
import re

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from stellar_sdk import Server

from database import engine

HORIZON_URL = "https://horizon-testnet.stellar.org"

server = Server(horizon_url=HORIZON_URL)


def guardar_transaccion(id_remesa: int, hash_tx: str):

    # Verificar el formato del hash
    if not re.fullmatch(r"[a-fA-F0-9]{64}", hash_tx):
        raise ValueError("Hash de transaccion invalido")

    hash_tx = hash_tx.lower()

    # Verificar la transaccion en Stellar Testnet
    transaccion = (
        server.transactions()
        .transaction(hash_tx)
        .call()
    )

    if not transaccion.get("successful"):
        raise ValueError("Transaccion no confirmada en Stellar")

    # Registrar evidencia en PostgreSQL
    consulta = text("""
        INSERT INTO transacciones_stellar (
            id_remesa,
            hash_transaccion,
            red,
            estado
        )
        VALUES (
            :id_remesa,
            :hash_tx,
            'TESTNET',
            'confirmada'
        )
        RETURNING id_transaccion
    """)

    with engine.begin() as conexion:
        resultado = conexion.execute(
            consulta,
            {
                "id_remesa": id_remesa,
                "hash_tx": hash_tx
            }
        )

        id_transaccion = resultado.scalar_one()

    return {
        "id_transaccion": id_transaccion,
        "id_remesa": id_remesa,
        "hash": hash_tx,
        "red": "TESTNET",
        "estado": "confirmada",
        "ledger": transaccion["ledger"]
    }
