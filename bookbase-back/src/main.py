from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from database import engine, Base
import models
from routers import auth_router, books_router
from config import UPLOAD_DIR

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bookbase API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar pasta de uploads se não existir
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Servir arquivos estáticos (imagens)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Rotas
app.include_router(auth_router)
app.include_router(books_router)

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API Bookbase"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)