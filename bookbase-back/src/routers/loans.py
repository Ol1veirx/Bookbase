from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from database import get_db
from dependencies import get_current_user, require_bibliotecario
from schemas import Emprestimo, EmprestimoCreate, EmprestimoUpdate, EmprestimoSimple
import models

router = APIRouter(prefix="/emprestimos", tags=["Empréstimos"])

@router.post("/", response_model=Emprestimo)
def create_emprestimo(
    emprestimo: EmprestimoCreate,
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Criar novo empréstimo (apenas bibliotecário)"""

    livro = db.query(models.Livro).filter(models.Livro.id == emprestimo.livro_id).first()
    if not livro:
        raise HTTPException(status_code=404, detail="Livro não encontrado")

    emprestimos_ativos = db.query(models.Emprestimo).filter(
        models.Emprestimo.livro_id == emprestimo.livro_id,
        models.Emprestimo.status == "emprestado"
    ).count()

    if emprestimos_ativos >= livro.quantidade_exemplares:
        raise HTTPException(status_code=400, detail="Não há exemplares disponíveis")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == emprestimo.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    emprestimo_existente = db.query(models.Emprestimo).filter(
        models.Emprestimo.usuario_id == emprestimo.usuario_id,
        models.Emprestimo.livro_id == emprestimo.livro_id,
        models.Emprestimo.status == "emprestado"
    ).first()

    if emprestimo_existente:
        raise HTTPException(status_code=400, detail="Usuário já possui este livro emprestado")

    db_emprestimo = models.Emprestimo(
        usuario_id=emprestimo.usuario_id,
        livro_id=emprestimo.livro_id,
        data_emprestimo=datetime.now(),
        data_devolucao_prevista=emprestimo.data_devolucao_prevista,
        status="emprestado"
    )

    db.add(db_emprestimo)
    db.commit()
    db.refresh(db_emprestimo)

    return db_emprestimo

@router.get("/")
def list_emprestimos(
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    usuario_id: Optional[int] = None,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar empréstimos com nomes (usuários veem apenas os seus)"""

    query = db.query(
        models.Emprestimo.id,
        models.Emprestimo.usuario_id,
        models.Emprestimo.livro_id,
        models.Emprestimo.data_emprestimo,
        models.Emprestimo.data_devolucao_prevista,
        models.Emprestimo.data_devolucao_real,
        models.Emprestimo.status,
        models.Usuario.nome.label("usuario_nome"),
        models.Livro.titulo.label("livro_titulo")
    ).join(models.Usuario).join(models.Livro)

    if current_user.role != "bibliotecario":
        query = query.filter(models.Emprestimo.usuario_id == current_user.id)
    else:
        if usuario_id:
            query = query.filter(models.Emprestimo.usuario_id == usuario_id)

    if status:
        query = query.filter(models.Emprestimo.status == status)

    result = query.offset(skip).limit(limit).all()

    emprestimos = []
    for row in result:
        emprestimos.append({
            "id": row.id,
            "usuario_id": row.usuario_id,
            "livro_id": row.livro_id,
            "data_emprestimo": row.data_emprestimo,
            "data_devolucao_prevista": row.data_devolucao_prevista,
            "data_devolucao_real": row.data_devolucao_real,
            "status": row.status,
            "usuario_nome": row.usuario_nome,
            "livro_titulo": row.livro_titulo
        })

    return emprestimos

@router.get("/{emprestimo_id}", response_model=Emprestimo)
def get_emprestimo(
    emprestimo_id: int,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter detalhes de um empréstimo"""

    emprestimo = db.query(models.Emprestimo).filter(models.Emprestimo.id == emprestimo_id).first()
    if not emprestimo:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")

    if current_user.role != "bibliotecario" and emprestimo.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para ver este empréstimo")

    return emprestimo

@router.put("/{emprestimo_id}/devolver", response_model=Emprestimo)
def devolver_livro(
    emprestimo_id: int,
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Registrar devolução de livro (apenas bibliotecário)"""

    emprestimo = db.query(models.Emprestimo).filter(models.Emprestimo.id == emprestimo_id).first()
    if not emprestimo:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")

    if emprestimo.status != "emprestado":
        raise HTTPException(status_code=400, detail="Este livro já foi devolvido")

    emprestimo.data_devolucao_real = datetime.now()
    emprestimo.status = "devolvido"

    db.commit()
    db.refresh(emprestimo)

    return emprestimo

@router.put("/{emprestimo_id}", response_model=Emprestimo)
def update_emprestimo(
    emprestimo_id: int,
    emprestimo_update: EmprestimoUpdate,
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Atualizar empréstimo (apenas bibliotecário)"""

    emprestimo = db.query(models.Emprestimo).filter(models.Emprestimo.id == emprestimo_id).first()
    if not emprestimo:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")

    if emprestimo_update.data_devolucao_prevista:
        emprestimo.data_devolucao_prevista = emprestimo_update.data_devolucao_prevista

    if emprestimo_update.data_devolucao_real:
        emprestimo.data_devolucao_real = emprestimo_update.data_devolucao_real

    if emprestimo_update.status:
        emprestimo.status = emprestimo_update.status

    db.commit()
    db.refresh(emprestimo)

    return emprestimo

@router.delete("/{emprestimo_id}")
def delete_emprestimo(
    emprestimo_id: int,
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Deletar empréstimo (apenas bibliotecário)"""

    emprestimo = db.query(models.Emprestimo).filter(models.Emprestimo.id == emprestimo_id).first()
    if not emprestimo:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado")

    db.delete(emprestimo)
    db.commit()

    return {"message": "Empréstimo deletado com sucesso"}

@router.get("/usuario/{usuario_id}", response_model=list[EmprestimoSimple])
def get_emprestimos_usuario(
    usuario_id: int,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter empréstimos de um usuário específico"""

    if current_user.role != "bibliotecario" and current_user.id != usuario_id:
        raise HTTPException(status_code=403, detail="Sem permissão para ver empréstimos deste usuário")

    emprestimos = db.query(models.Emprestimo).filter(
        models.Emprestimo.usuario_id == usuario_id
    ).all()

    return emprestimos

@router.get("/atrasados/", response_model=list[Emprestimo])
def get_emprestimos_atrasados(
    current_user: models.Usuario = Depends(require_bibliotecario),
    db: Session = Depends(get_db)
):
    """Listar empréstimos em atraso (apenas bibliotecário)"""

    hoje = datetime.now().date()

    emprestimos_atrasados = db.query(models.Emprestimo).filter(
        models.Emprestimo.status == "emprestado",
        models.Emprestimo.data_devolucao_prevista < hoje
    ).all()

    return emprestimos_atrasados