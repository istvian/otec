import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import {
  GetCotizacionPublica,
  UrlPdfCotizacionPublica,
} from "../../Helpers/APIConnector";
import type { Cotizacion } from "../../types/general";
import css from "./VerCotizacionPublica.module.css";

const formatoCLP = (monto?: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(monto || 0));

const formatoFecha = (fecha?: string | Date) => {
  if (!fecha) return "No informada";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "No informada";
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const claseEstado = (estado?: string) => {
  if (estado === "Aceptada") return css.estadoAceptada;
  if (estado === "Rechazada") return css.estadoRechazada;
  if (estado === "Enviada") return css.estadoEnviada;
  return css.estadoBorrador;
};

export function VerCotizacionPublica() {
  const { token } = useParams();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Enlace no válido.");
      setCargando(false);
      return;
    }

    GetCotizacionPublica(token, (res) => {
      if (res.error || !res.data) {
        setError(res.message || "No se pudo cargar la cotización.");
      } else {
        setCotizacion(res.data);
      }
      setCargando(false);
    });
  }, [token]);

  if (cargando) {
    return (
      <Frame>
        <div className={css.estadoCarga}>
          <p>Cargando cotización...</p>
        </div>
      </Frame>
    );
  }

  if (error || !cotizacion) {
    return (
      <Frame>
        <div className={css.estadoCarga}>
          <h1>Cotización no disponible</h1>
          <p>{error || "El enlace no es válido o la cotización fue eliminada."}</p>
        </div>
      </Frame>
    );
  }

  const subtotal =
    cotizacion.subtotal ??
    Number(cotizacion.cantidadAlumnos) * Number(cotizacion.valorAlumno);
  const fechaEmision = new Date(
    cotizacion.fechaEmision || cotizacion.createdAt || "",
  );
  const fechaVencimiento = new Date(fechaEmision);
  fechaVencimiento.setDate(
    fechaVencimiento.getDate() + Number(cotizacion.validezDias || 15),
  );
  const vencida =
    typeof cotizacion.vencida === "boolean"
      ? cotizacion.vencida
      : fechaVencimiento < new Date();

  return (
    <Frame>
      <div className={css.acciones}>
        <Btn onClick={() => window.print()}>Imprimir / Guardar PDF</Btn>
        {token && (
          <a
            className={css.descargar}
            href={UrlPdfCotizacionPublica(token)}
            target="_blank"
            rel="noreferrer"
          >
            Descargar PDF
          </a>
        )}
      </div>

      <article className={css.documento}>
        <header className={css.encabezado}>
          <div>
            <h1>KeepLearning</h1>
            <p>Capacitación y formación profesional</p>
          </div>
          <div className={css.identificacion}>
            <span className={css.tipoDocumento}>Cotización</span>
            <strong>COT-{String(cotizacion.id).padStart(5, "0")}</strong>
            <span className={claseEstado(cotizacion.estado)}>
              {cotizacion.estado || "Borrador"}
            </span>
          </div>
        </header>

        {vencida && (
        <p style={{ color: "#991b1b", fontWeight: 600, margin: "0.5rem 0" }}>
          Esta cotización se encuentra vencida. Contacta al ejecutivo para una
          versión revalidada.
        </p>
      )}

      <div className={css.meta}>
          <span>
            <strong>Emitida:</strong> {formatoFecha(fechaEmision)}
          </span>
          <span>
            <strong>Válida hasta:</strong> {formatoFecha(fechaVencimiento)}
          </span>
          <span>
            <strong>Ejecutivo:</strong>{" "}
            {cotizacion.vendedor?.nombre || "No informado"}
          </span>
          {cotizacion.vendedor?.correo && (
            <span>
              <strong>Contacto:</strong> {cotizacion.vendedor.correo}
            </span>
          )}
        </div>

        <section className={css.bloqueDosColumnas}>
          <div>
            <h2>Cliente</h2>
            <p className={css.destacado}>
              {cotizacion.nombreCliente || "Cliente no informado"}
            </p>
            {cotizacion.clienteRut && <p>RUT: {cotizacion.clienteRut}</p>}
            {cotizacion.clienteDireccion && (
              <p>Dirección: {cotizacion.clienteDireccion}</p>
            )}
            {cotizacion.contactoNombre && (
              <p>Contacto: {cotizacion.contactoNombre}</p>
            )}
            {cotizacion.contactoCorreo && (
              <p>Correo: {cotizacion.contactoCorreo}</p>
            )}
            {cotizacion.contactoTelefono && (
              <p>Teléfono: {cotizacion.contactoTelefono}</p>
            )}
          </div>
          <div>
            <h2>Programa</h2>
            <p className={css.destacado}>
              {cotizacion.nombreCurso ||
                cotizacion.curso?.nombre ||
                "Programa de capacitación"}
            </p>
            {cotizacion.curso?.codigo && (
              <p>Código SENCE: {cotizacion.curso.codigo}</p>
            )}
            {cotizacion.curso?.modalidad && (
              <p>Modalidad: {cotizacion.curso.modalidad}</p>
            )}
            {cotizacion.curso?.horas && (
              <p>Horas: {cotizacion.curso.horas}</p>
            )}
          </div>
        </section>

        {cotizacion.objetivosCustom && (
          <section className={css.seccion}>
            <h2>Objetivos</h2>
            <p className={css.textoPlano}>{cotizacion.objetivosCustom}</p>
          </section>
        )}

        <section className={css.seccion}>
          <h2>Temario</h2>
          <p className={css.textoPlano}>
            {cotizacion.temarioCustom || "Sin temario informado."}
          </p>
        </section>

        <section className={css.seccion}>
          <h2>Detalle de valores</h2>
          <table className={css.tabla}>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Participantes</th>
                <th>Valor unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {cotizacion.nombreCurso ||
                    cotizacion.curso?.nombre ||
                    "Programa de capacitación"}
                </td>
                <td>{cotizacion.cantidadAlumnos}</td>
                <td>{formatoCLP(cotizacion.valorAlumno)}</td>
                <td>{formatoCLP(subtotal)}</td>
              </tr>
              {Number(cotizacion.descuento || 0) > 0 && (
                <tr>
                  <td>Descuento aplicado</td>
                  <td>-</td>
                  <td>-</td>
                  <td>- {formatoCLP(Number(cotizacion.descuento))}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total</td>
                <td>{formatoCLP(cotizacion.total)}</td>
              </tr>
            </tfoot>
          </table>
          <p className={css.nota}>
            Valores expresados en pesos chilenos (CLP). El total se calcula
            como cantidad de participantes por valor por alumno, menos
            descuentos aplicados.
          </p>
        </section>

        {cotizacion.observaciones && (
          <section className={css.seccion}>
            <h2>Observaciones</h2>
            <p className={css.textoPlano}>{cotizacion.observaciones}</p>
          </section>
        )}

        {cotizacion.condiciones && (
          <section className={css.seccion}>
            <h2>Condiciones comerciales</h2>
            <p className={css.textoPlano}>{cotizacion.condiciones}</p>
          </section>
        )}

        <footer className={css.pie}>
          <p>
            Documento generado electrónicamente. Esta cotización es una versión
            web de solo lectura y puede descargarse en PDF desde el mismo
            enlace.
          </p>
          {token && (
            <p className={css.enlace}>
              {window.location.href}
            </p>
          )}
        </footer>
      </article>
    </Frame>
  );
}

export default VerCotizacionPublica;
