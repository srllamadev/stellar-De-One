
const API_URL = "http://127.0.0.1:8000";

const boton = document.getElementById("btnConsultar");
const resultado = document.getElementById("resultado");

function agregarDato(contenedor, etiqueta, valor) {
    const parrafo = document.createElement("p");
    const negrita = document.createElement("strong");

    negrita.textContent = `${etiqueta}: `;
    parrafo.appendChild(negrita);
    parrafo.appendChild(document.createTextNode(valor));

    contenedor.appendChild(parrafo);
}

boton.addEventListener("click", async () => {
    const id = document.getElementById("idRemesa").value;

    resultado.replaceChildren();

    if (!id || Number(id) < 1) {
        resultado.textContent = "Introduce un ID válido.";
        return;
    }

    resultado.textContent = "Consultando remesa...";

    try {
        const respuesta = await fetch(
            `${API_URL}/remesas/${encodeURIComponent(id)}/detalle`
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar la remesa");
        }

        const datos = await respuesta.json();

        resultado.replaceChildren();

        const titulo = document.createElement("h3");
        titulo.textContent = `Remesa #${datos.id_remesa}`;
        resultado.appendChild(titulo);

        agregarDato(resultado, "Remitente", datos.remitente);
        agregarDato(resultado, "Destinatario", datos.destinatario);
        agregarDato(resultado, "Monto enviado",
            `${datos.monto_brl} BRL`);
        agregarDato(resultado, "Monto estimado",
            `${datos.monto_bob} BOB`);
        agregarDato(resultado, "Estado remesa",
            datos.estado_remesa);
        agregarDato(resultado, "Stellar",
            datos.estado_stellar || "Sin transacción");

        if (datos.hash_transaccion && datos.red === "TESTNET") {
            const enlace = document.createElement("a");
            enlace.href =
                `https://stellar.expert/explorer/testnet/tx/${datos.hash_transaccion}`;
            enlace.textContent = "Ver comprobante Stellar";
            enlace.target = "_blank";
            enlace.rel = "noopener noreferrer";

            resultado.appendChild(enlace);
        }

    } catch (error) {
        resultado.replaceChildren();

        const mensaje = document.createElement("p");
        mensaje.className = "error";
        mensaje.textContent = error.message;

        resultado.appendChild(mensaje);
    }
});


const btnCotizar = document.getElementById("btnCotizar");
const btnEnviar = document.getElementById("btnEnviar");

const resultadoCotizacion =
    document.getElementById("resultadoCotizacion");

const resultadoEnvio =
    document.getElementById("resultadoEnvio");

let cotizacionActual = null;

// PASO 1: Calcular la cotización
btnCotizar.addEventListener("click", async () => {
    const monto = Number(document.getElementById("monto").value);

    btnEnviar.disabled = true;
    cotizacionActual = null;
    resultadoEnvio.textContent = "";

    if (!Number.isFinite(monto) || monto <= 0) {
        resultadoCotizacion.textContent = "Introduce un monto válido.";
        return;
    }

    resultadoCotizacion.textContent = "Calculando...";

    try {
        const respuesta = await fetch(
            `${API_URL}/cotizar?monto=${encodeURIComponent(monto)}`
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo calcular la cotización");
        }

        const datos = await respuesta.json();

        resultadoCotizacion.replaceChildren();

        agregarDato(resultadoCotizacion,
            "Monto enviado", `${datos.monto_enviado} BRL`);

        agregarDato(resultadoCotizacion,
            "Tipo de cambio", datos.tipo_cambio);

        agregarDato(resultadoCotizacion,
            "Comisión", `${datos.comision} BRL`);

        agregarDato(resultadoCotizacion,
            "Recibirá", `${datos.monto_recibido} BOB`);

        cotizacionActual = datos;
        btnEnviar.disabled = false;

    } catch (error) {
        resultadoCotizacion.textContent = error.message;
    }
});

// Si cambia el monto, invalidar la cotización anterior
document.getElementById("monto").addEventListener("input", () => {
    cotizacionActual = null;
    btnEnviar.disabled = true;
    resultadoCotizacion.textContent = "";
});

// PASO 2: Registrar cotización y remesa
btnEnviar.addEventListener("click", async () => {
    if (!cotizacionActual) return;

    remesaActualId = null;
    seccionPago.hidden = true;
    resultadoPago.textContent = "";

    btnEnviar.disabled = true;
    btnCotizar.disabled = true;
    resultadoEnvio.textContent = "Registrando remesa simulada...";

    try {
        const monto = cotizacionActual.monto_enviado;

        // Guardar cotización en PostgreSQL
        const respuestaCotizacion = await fetch(
            `${API_URL}/cotizaciones?monto=${encodeURIComponent(monto)}`,
            { method: "POST" }
        );

        if (!respuestaCotizacion.ok) {
            throw new Error("No se pudo guardar la cotización");
        }

        const cotizacionGuardada =
            await respuestaCotizacion.json();

        // Registrar remesa en PostgreSQL
        const respuestaRemesa = await fetch(
            `${API_URL}/remesas`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_remitente: 1,
                    id_destinatario: 2,
                    id_cotizacion: cotizacionGuardada.id_cotizacion
                })
            }
        );

        if (!respuestaRemesa.ok) {
            throw new Error("No se pudo registrar la remesa");
        }

        const remesa = await respuestaRemesa.json();


        // Guardar el ID de la nueva remesa
        remesaActualId = remesa.id_remesa;

        // Mostrar la sección de pago simulado
        seccionPago.hidden = false;
        btnSimularPago.disabled = false;
        resultadoPago.textContent = "";


        resultadoEnvio.textContent =
            `Remesa simulada #${remesa.id_remesa} creada. ` +
            `Estado: ${remesa.estado}. ` +
            `No se ha realizado ningún pago real.`;

        // Colocar el nuevo ID en el formulario de consulta
        document.getElementById("idRemesa").value =
            remesa.id_remesa;

    } catch (error) {
        resultadoEnvio.textContent = error.message;

    } finally {
        btnCotizar.disabled = false;
    }
});


const seccionPago = document.getElementById("seccionPago");
const btnSimularPago = document.getElementById("btnSimularPago");
const resultadoPago = document.getElementById("resultadoPago");

let remesaActualId = null;

// Confirmar el pago PIX ficticio
btnSimularPago.addEventListener("click", async () => {

    if (!remesaActualId) {
        resultadoPago.textContent =
            "Primero debes crear una remesa.";
        return;
    }

    btnSimularPago.disabled = true;
    resultadoPago.textContent = "Simulando pago PIX...";

    try {
        const respuesta = await fetch(
            `${API_URL}/remesas/${remesaActualId}/simular-pago`,
            {
                method: "POST"
            }
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo confirmar el pago simulado"
            );
        }

        const datos = await respuesta.json();

        resultadoPago.textContent =
            `Pago PIX simulado correctamente. ` +
            `Remesa #${datos.id_remesa}. ` +
            `Estado: ${datos.estado}. ` +
            `No se ha movido dinero real.`;

    } catch (error) {
        resultadoPago.textContent = error.message;
        btnSimularPago.disabled = false;
    }
});
