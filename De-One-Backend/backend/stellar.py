
from stellar_sdk import Server

from stellar_sdk.exceptions import NotFoundError

# Servidor oficial de Stellar Testnet
STELLAR_HORIZON_URL = "https://horizon-testnet.stellar.org"

# Crear cliente de Stellar
server = Server(horizon_url=STELLAR_HORIZON_URL)


def verificar_stellar():
    try:
        # Consultar información de la red
        respuesta = server.root().call()

        return {
            "estado": "conectado",
            "red": "Stellar Testnet",
            "version": respuesta.get("horizon_version"),
            "mensaje": "Conexion exitosa con Stellar Testnet"
        }

    except Exception:
        return {
            "estado": "error",
            "mensaje": "No se pudo conectar con Stellar Testnet"
        }






def consultar_cuenta(direccion: str):

    try:
        # Consultar una cuenta en Stellar Testnet
        cuenta = server.accounts().account_id(direccion).call()

        # Obtener los saldos de la cuenta
        saldos = []

        for balance in cuenta["balances"]:
            saldos.append({
                "activo": balance.get("asset_code", "XLM"),
                "saldo": balance["balance"]
            })

        return {
            "estado": "encontrada",
            "red": "Stellar Testnet",
            "direccion": direccion,
            "saldos": saldos
        }

    except NotFoundError:
        return {
            "estado": "no_encontrada",
            "mensaje": "La cuenta no existe en Stellar Testnet"
        }

    except Exception:
        return {
            "estado": "error",
            "mensaje": "No se pudo consultar la cuenta"
        }
