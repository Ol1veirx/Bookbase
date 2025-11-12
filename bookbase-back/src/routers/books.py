from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user, require_bibliotecario
from file_handler import save_upload_file, delete_upload_file
from schemas import Livro, LivroCreate, LivroUpdate
from config import UPLOAD_DIR
import models
import json

router = APIRouter(prefix="/livros", tags=["Livros"])

@router.post("/", response_model=Livro)
async def create_livro(
    titulo: str = Form(...),
    autor: str = Form(...),
    isbn: str = Form(...),
    ano: int = Form(...),
    quantidade_exemplares: int = Form(1),
    categoria: str = Form(...),
    paginas: int = Form(...),
    descricao: str = Form(...),
    capa: UploadFile = File(None),
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Criar novo livro com capa (form-data)"""

    db_livro = db.query(models.Livro).filter(models.Livro.isbn == isbn).first()
    if db_livro:
        raise HTTPException(status_code=400, detail="ISBN já cadastrado")

    capa_filename = None
    if capa:
        capa_filename = await save_upload_file(capa)

    db_livro = models.Livro(
        titulo=titulo,
        autor=autor,
        isbn=isbn,
        ano=ano,
        quantidade_exemplares=quantidade_exemplares,
        categoria=categoria,
        paginas=paginas,
        descricao=descricao,
        capa=capa_filename
    )

    db.add(db_livro)
    db.commit()
    db.refresh(db_livro)

    return db_livro

@router.get("/", response_model=list[Livro])
def list_livros(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Listar todos os livros"""
    livros = db.query(models.Livro).offset(skip).limit(limit).all()
    return livros

@router.get("/{livro_id}", response_model=Livro)
def get_livro(
    livro_id: int,
    db: Session = Depends(get_db)
):
    """Obter detalhes de um livro"""
    livro = db.query(models.Livro).filter(models.Livro.id == livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")
    return livro

@router.put("/{livro_id}", response_model=Livro)
async def update_livro(
    livro_id: int,
    livro_update: LivroUpdate,
    capa: UploadFile = File(None),
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Atualizar livro (apenas bibliotecário)"""
    db_livro = db.query(models.Livro).filter(models.Livro.id == livro_id).first()
    if not db_livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    try:
        if capa:
            if db_livro.capa:
                delete_upload_file(db_livro.capa)
            db_livro.capa = await save_upload_file(capa)

        if livro_update.titulo:
            db_livro.titulo = livro_update.titulo
        if livro_update.autor:
            db_livro.autor = livro_update.autor
        if livro_update.categoria:
            db_livro.categoria = livro_update.categoria
        if livro_update.descricao:
            db_livro.descricao = livro_update.descricao
        if livro_update.paginas:
            db_livro.paginas = livro_update.paginas
        if livro_update.quantidade_exemplares:
            db_livro.quantidade_exemplares = livro_update.quantidade_exemplares

        db.commit()
        db.refresh(db_livro)
        return db_livro

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{livro_id}")
def delete_livro(
    livro_id: int,
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Deletar livro (apenas bibliotecário)"""
    db_livro = db.query(models.Livro).filter(models.Livro.id == livro_id).first()
    if not db_livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    if db_livro.capa:
        delete_upload_file(db_livro.capa)

    db.delete(db_livro)
    db.commit()

    return {"message": "Livro deletado com sucesso"}

@router.get("/capas/{filename}")
async def get_capa(filename: str):
    """Obter imagem da capa do livro"""
    file_path = UPLOAD_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Imagem não encontrada")

    return FileResponse(file_path)