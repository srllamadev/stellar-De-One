
from pathlib import Path
from stellar_sdk import Keypair

# Archivo privado de cuentas de demostración
archivo = Path(__file__).parent / ".cuentas_testnet"

if archivo.exists():
    print("Las cuentas de prueba ya existen.")
    print("No se generaron nuevas cuentas.")
else:
    remitente = Keypair.random()
    destinatario = Keypair.random()

    contenido = (
        f"REMITENTE_PUBLICA={remitente.public_key}\n"
        f"REMITENTE_SECRETA={remitente.secret}\n"
        f"DESTINATARIO_PUBLICA={destinatario.public_key}\n"
        f"DESTINATARIO_SECRETA={destinatario.secret}\n"
    )

    # Crear archivo privado para la demo local
    with archivo.open("x", encoding="utf-8") as f:
        f.write(contenido)

    print("Cuentas de prueba generadas.")
    print("Remitente:", remitente.public_key)
    print("Destinatario:", destinatario.public_key)
    print("Las claves secretas no se muestran.")
