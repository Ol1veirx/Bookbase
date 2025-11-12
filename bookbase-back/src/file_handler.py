import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from config import UPLOAD_DIR, MAX_FILE_SIZE, allowed_file

async def save_upload_file(upload_file: UploadFile) -> str:
    """
    Salva o arquivo de upload e retorna o nome do arquivo
    """

    if not allowed_file(upload_file.filename):
        raise ValueError(f"Tipo de arquivo não permitido: {upload_file.filename}")

    content = await upload_file.read()

    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f"Arquivo muito grande. Máximo: 5MB")

    file_extension = upload_file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    file_path = UPLOAD_DIR / unique_filename
    with open(file_path, "wb") as f:
        f.write(content)

    return unique_filename

def delete_upload_file(filename: str) -> bool:
    """
    Deleta um arquivo de upload
    """
    if not filename:
        return False

    file_path = UPLOAD_DIR / filename
    try:
        if file_path.exists():
            file_path.unlink()
            return True
    except Exception as e:
        print(f"Erro ao deletar arquivo: {e}")

    return False