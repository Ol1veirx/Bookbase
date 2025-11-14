from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    BIBLIOTECARIO = "bibliotecario"
    USUARIO = "usuario"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USUARIO, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    emprestimos = relationship("Emprestimo", back_populates="usuario")

class Livro(Base):
    __tablename__ = "livros"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False, index=True)
    autor = Column(String(255), nullable=False)
    isbn = Column(String(20), unique=True, index=True, nullable=False)
    ano = Column(Integer, nullable=False)
    quantidade_exemplares = Column(Integer, default=1, nullable=False)
    categoria = Column(String(100), nullable=False)
    paginas = Column(Integer, nullable=False)
    descricao = Column(Text, nullable=False)
    capa = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    emprestimos = relationship("Emprestimo", back_populates="livro")

class Emprestimo(Base):
    __tablename__ = "emprestimos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    livro_id = Column(Integer, ForeignKey("livros.id"), nullable=False)
    data_emprestimo = Column(DateTime(timezone=True), server_default=func.now())
    data_devolucao_prevista = Column(DateTime(timezone=True), nullable=False)
    data_devolucao_real = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="ativo")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    usuario = relationship("Usuario", back_populates="emprestimos")
    livro = relationship("Livro", back_populates="emprestimos")
