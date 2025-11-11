from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import time
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://bookbase_user:bookbase_password@postgres:5432/bookbase"
)

def wait_for_db():
    max_retries = 30
    retry_count = 0

    while retry_count < max_retries:
        try:
            engine = create_engine(DATABASE_URL)
            connection = engine.connect()
            connection.close()
            logger.info("Banco de dados conectado com sucesso!")
            return engine
        except Exception as e:
            retry_count += 1
            logger.info(f"Tentativa {retry_count}/{max_retries} - Aguardando banco de dados... ({e})")
            time.sleep(2)

    raise Exception("Não foi possível conectar ao banco de dados após várias tentativas")

engine = wait_for_db()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()