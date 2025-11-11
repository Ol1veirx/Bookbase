from pydantic import BaseModel, EmailStr, ConfigDict, validator
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

    @validator('senha')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Senha muito longa. Máximo 72 bytes.')
        return v

    @validator('nome')
    def validate_nome(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()

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

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('Nova senha deve ter pelo menos 6 caracteres')
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Nova senha muito longa. Máximo 72 bytes.')
        return v

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