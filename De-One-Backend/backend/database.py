
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Leer variables del archivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("Falta DATABASE_URL en el archivo .env")

# Crear motor de conexión
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


def verificar_conexion():
    try:
        with engine.connect() as conexion:
            resultado = conexion.execute(
                text("SELECT current_database()")
            )
            return {
                "estado": "conectado",
                "base_datos": resultado.scalar()
            }

    except Exception:
        return {
            "estado": "error",
            "mensaje": "No se pudo conectar a PostgreSQL"
        }
