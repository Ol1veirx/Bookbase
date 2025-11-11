from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    BIBLIOTECARIO = "bibliotecario"
    USUARIO = "usuario"

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    role: UserRole = UserRole.USUARIO
    is_active: bool = True

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class Usuario(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class LivroBase(BaseModel):
    titulo: str
    autor: str
    isbn: str
    ano: int
    quantidade_exemplares: int = 1

class LivroCreate(LivroBase):
    pass

class LivroUpdate(BaseModel):
    titulo: Optional[str] = None
    autor: Optional[str] = None
    isbn: Optional[str] = None
    ano: Optional[int] = None
    quantidade_exemplares: Optional[int] = None

class Livro(LivroBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class EmprestimoBase(BaseModel):
    usuario_id: int
    livro_id: int
    data_devolucao_prevista: datetime

class EmprestimoCreate(EmprestimoBase):
    pass

class EmprestimoUpdate(BaseModel):
    data_devolucao_prevista: Optional[datetime] = None
    data_devolucao_real: Optional[datetime] = None
    status: Optional[str] = None

class Emprestimo(EmprestimoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    data_emprestimo: datetime
    data_devolucao_real: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    usuario: Usuario
    livro: Livro

class EmprestimoSimple(EmprestimoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    data_emprestimo: datetime
    data_devolucao_real: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None