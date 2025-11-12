import os
from pathlib import Path

# Diretório de uploads
UPLOAD_DIR = Path("uploads/capas")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Extensões permitidas
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def get_upload_path(filename: str) -> str:
    """Retorna o caminho completo para salvar a imagem"""
    return str(UPLOAD_DIR / filename)

def allowed_file(filename: str) -> bool:
    """Verifica se a extensão do arquivo é permitida"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS