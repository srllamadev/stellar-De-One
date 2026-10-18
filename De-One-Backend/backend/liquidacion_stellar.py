
from pathlib import Path
from dotenv import dotenv_values

from stellar_sdk import (
    Asset,
    Keypair,
    Network,
    Server,
    TransactionBuilder
)

HORIZON_URL = "https://horizon-testnet.stellar.org"
server = Server(horizon_url=HORIZON_URL)


def ejecutar_transferencia_testnet():

    # Leer cuentas privadas de demostracion
    archivo = Path(__file__).parent / ".cuentas_testnet"
    datos = dotenv_values(archivo)

    remitente = Keypair.from_secret(
        datos["REMITENTE_SECRETA"]
    )

    destinatario = Keypair.from_secret(
        datos["DESTINATARIO_SECRETA"]
    )

    # Comprobar las cuentas
    cuenta_origen = server.load_account(
        remitente.public_key
    )

    server.load_account(destinatario.public_key)

    # Construir la transferencia
    transaccion = (
        TransactionBuilder(
            source_account=cuenta_origen,
            network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
            base_fee=100
        )
        .append_payment_op(
            destination=destinatario.public_key,
            asset=Asset.native(),
            amount="1"
        )
        .add_text_memo("DE ONE DEMO")
        .set_timeout(60)
        .build()
    )

    # Firmar y enviar a Stellar Testnet
    transaccion.sign(remitente)

    respuesta = server.submit_transaction(transaccion)

    if not respuesta.get("successful"):
        raise RuntimeError(
            "Stellar no confirmó la transacción"
        )

    return {
        "hash": respuesta["hash"],
        "red": "TESTNET",
        "estado": "confirmada",
        "monto_xlm": "1",
        "modo": "demostracion"
    }
from pathlib import Path
from dotenv import dotenv_values

from stellar_sdk import (
    Asset,
    Keypair,
    Network,
    Server,
    TransactionBuilder
)

HORIZON_URL = "https://horizon-testnet.stellar.org"

server = Server(horizon_url=HORIZON_URL)


def preparar_transferencia_testnet():

    # 1. Leer las credenciales privadas de prueba
    archivo = Path(__file__).parent / ".cuentas_testnet"
    datos = dotenv_values(archivo)

    remitente = Keypair.from_secret(
        datos["REMITENTE_SECRETA"]
    )

    destinatario = Keypair.from_secret(
        datos["DESTINATARIO_SECRETA"]
    )

    # 2. Comprobar las claves publicas
    if remitente.public_key != datos["REMITENTE_PUBLICA"]:
        raise ValueError("Clave incorrecta del remitente")

    if destinatario.public_key != datos["DESTINATARIO_PUBLICA"]:
        raise ValueError("Clave incorrecta del destinatario")

    # 3. Consultar las cuentas en Stellar Testnet
    cuenta_origen = server.load_account(
        remitente.public_key
    )

    server.load_account(destinatario.public_key)

    # 4. Construir la transaccion
    transaccion = (
        TransactionBuilder(
            source_account=cuenta_origen,
            network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
            base_fee=100
        )
        .append_payment_op(
            destination=destinatario.public_key,
            asset=Asset.native(),
            amount="1"
        )
        .add_text_memo("DE ONE DEMO")
        .set_timeout(300)
        .build()
    )

    # 5. Firmar sin enviar
    transaccion.sign(remitente)

    # 6. Calcular el hash de la transaccion firmada
    hash_tx = transaccion.hash_hex()

    return {
        "transaccion": transaccion,
        "xdr": transaccion.to_xdr(),
        "hash": hash_tx,
        "origen": remitente.public_key,
        "destino": destinatario.public_key,
        "monto_xlm": "1",
        "red": "TESTNET"
    }


def enviar_transferencia_testnet(transaccion):

    # Enviar la transaccion ya preparada
    respuesta = server.submit_transaction(transaccion)

    return {
        "hash": respuesta["hash"],
        "confirmada": respuesta.get("successful", False),
        "ledger": respuesta.get("ledger")
    }

