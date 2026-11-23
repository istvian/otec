import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import { Title } from "../../Components/Title/Title";
import { InputText } from "../../Components/InputText/InputText";
import { Selector } from "../../Components/Selector/Selector";
import {
  DeleteCotizacion,
  GetCotizaciones,
  RevalidarCotizacion,
  UrlPdfCotizacion,
  UrlPublicaCotizacion,
} from "../../Helpers/APIConnector";
import type { Cotizacion } from "../../types/general";
import css from "./Cotizaciones.module.css";

const ESTADOS = ["Todos", "Borrador", "Enviada", "Aceptada", "Rechazada"];

const formatoCLP = (monto?: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(monto || 0));

const formatoFecha = (fecha?: string | Date) => {
  if (!fecha) return "No informada";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime())
    ? "No informada"
    : d.toLocaleDateString("es-CL");
};

const claseEstado = (estado?: string) => {
  if (estado === "Aceptada") return css.estadoAceptada;
  if (estado === "Rechazada") return css.estadoRechazada;
  if (estado === "Enviada") return css.estadoEnviada;
  return css.estadoBorrador;
};

const estaVencida = (cot: Cotizacion) => {
  if (typeof cot.vencida === "boolean") return cot.vencida;
  const emision = new Date(cot.fechaEmision || cot.createdAt || "");
  if (Number.isNaN(emision.getTime())) return false;
  const vencimiento = new Date(emision);
  vencimiento.setDate(vencimiento.getDate() + Number(cot.validezDias || 15));
  return vencimiento < new Date();
};

export function Cotizaciones() {
  const nav = useNavigate();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroVigencia, setFiltroVigencia] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  const cargarCotizaciones = () => {
    setLoading(true);
    setError(null);
    GetCotizaciones((res) => {
      if (res.error) {
        setError(res.message);
        setCotizaciones([]);
      } else {
        setCotizaciones(res.data || []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return cotizaciones.filter((cot) => {
      const coincideEstado =
        filtroEstado === "Todos" || cot.estado === filtroEstado;
      if (!coincideEstado) return false;
      const vencida = estaVencida(cot);
      const coincideVigencia =
        filtroVigencia === "Todos" ||
        (filtroVigencia === "Vigentes" && !vencida) ||
        (filtroVigencia === "Vencidas" && vencida);
      if (!coincideVigencia) return false;
      if (!texto) return true;
      const contenido = [
        cot.nombreCliente,
        cot.nombreCurso,
        cot.curso?.codigo,
        cot.curso?.nombre,
        cot.vendedor?.nombre,
        cot.tokenPublico,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return contenido.includes(texto);
    });
  }, [cotizaciones, filtroEstado, filtroVigencia, busqueda]);

  const totalCotizado = filtradas.reduce(
    (acumulado, cot) => acumulado + Number(cot.total || 0),
    0,
  );

  const copiarEnlace = async (cot: Cotizacion) => {
    const url = UrlPublicaCotizacion(cot.tokenPublico);
    if (!url) {
      window.alert("Esta cotización aún no tiene enlace público.");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      window.alert("Enlace público copiado al portapapeles.");
    } catch {
      window.prompt("Copia el enlace público de la cotización:", url);
    }
  };

  const eliminarCotizacion = (cot: Cotizacion) => {
    if (!cot.id) return;
    if (!confirm("¿Seguro que deseas eliminar esta cotización?")) return;
    DeleteCotizacion(cot.id, (res) => {
      if (res.error) {
        window.alert(res.message);
        return;
      }
      window.alert("Cotización eliminada correctamente.");
      cargarCotizaciones();
    });
  };

  const revalidarCotizacion = (cot: Cotizacion) => {
    if (!cot.id) return;
    if (!confirm("¿Revalidar y extender la vigencia de esta cotización?")) return;
    RevalidarCotizacion(
      cot.id,
      { validezDias: cot.validezDias || 15, regenerarEnlace: true },
      (res) => {
        if (res.error) {
          window.alert(res.message);
          return;
        }
        const token = res.data?.tokenPublico || cot.tokenPublico;
        const url = token ? UrlPublicaCotizacion(token) : "";
        window.alert(
          `${res.message}${url ? `\n\nNuevo enlace público: ${url}` : ""}`,
        );
        cargarCotizaciones();
      },
    );
  };

  return (
    <Frame>
      <Box
        style={{
          flexFlow: "row wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title>Cotizaciones</Title>
        <div className={css.actions}>
          <Btn onClick={() => nav("/cotizaciones/crear")}>
            Nueva cotización
          </Btn>
        </div>
      </Box>

      <Box>
        <div className={css.resumen}>
          <div>
            <span>Cotizaciones mostradas</span>
            <strong>{filtradas.length}</strong>
          </div>
          <div>
            <span>Monto total cotizado</span>
            <strong>{formatoCLP(totalCotizado)}</strong>
          </div>
        </div>

        <div className={css.toolbar}>
          <InputText
            label=""
            placeholder="Buscar por cliente, curso, código SENCE o ejecutivo..."
            value={busqueda}
            onChange={(text) => setBusqueda(text)}
          />
          <Selector
            title=""
            firstOption="Todos los estados"
            data={filtroEstado === "Todos" ? "Todos los estados" : filtroEstado}
            options={ESTADOS.map((e) => (e === "Todos" ? "Todos los estados" : e))}
            setData={(val) => setFiltroEstado(val === "Todos los estados" ? "Todos" : val)}
          />
          <Selector
            title=""
            firstOption="Toda la vigencia"
            data={filtroVigencia === "Todos" ? "Toda la vigencia" : filtroVigencia}
            options={["Toda la vigencia", "Vigentes", "Vencidas"]}
            setData={(val) =>
              setFiltroVigencia(
                val === "Toda la vigencia"
                  ? "Todos"
                  : val
              )
            }
          />
        </div>

        {loading && <p>Cargando cotizaciones...</p>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}

        {!loading && !error && (
          <div className={css.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Cliente</th>
                  <th>Programa</th>
                  <th>Código SENCE</th>
                  <th>Participantes</th>
                  <th>Valor alumno</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Vigencia</th>
                  <th>Emisión</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      No hay cotizaciones que coincidan con el filtro.
                    </td>
                  </tr>
                ) : (
                  filtradas.map((cot) => (
                    <tr key={cot.id}>
                      <td>COT-{String(cot.id).padStart(5, "0")}</td>
                      <td>{cot.nombreCliente || "Sin cliente"}</td>
                      <td>{cot.nombreCurso || cot.curso?.nombre || "-"}</td>
                      <td>{cot.curso?.codigo || "-"}</td>
                      <td>{cot.cantidadAlumnos}</td>
                      <td>{formatoCLP(cot.valorAlumno)}</td>
                      <td>
                        <strong>{formatoCLP(cot.total)}</strong>
                      </td>
                      <td>
                        <span className={claseEstado(cot.estado)}>
                          {cot.estado || "Borrador"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            estaVencida(cot)
                              ? css.estadoRechazada
                              : css.estadoAceptada
                          }
                        >
                          {estaVencida(cot) ? "Vencida" : "Vigente"}
                        </span>
                      </td>
                      <td>{formatoFecha(cot.fechaEmision)}</td>
                      <td>
                        <div className={css.acciones}>
                          <button
                            className={css.accion}
                            onClick={() => nav(`/cotizaciones/editar/${cot.id}`)}
                          >
                            Editar
                          </button>
                          <button
                            className={css.accion}
                            onClick={() => copiarEnlace(cot)}
                          >
                            Copiar enlace
                          </button>
                          <button
                            className={css.accion}
                            onClick={() =>
                              window.open(
                                UrlPdfCotizacion(cot.id as number),
                                "_blank",
                              )
                            }
                          >
                            PDF
                          </button>
                          <button
                            className={css.accion}
                            onClick={() => revalidarCotizacion(cot)}
                          >
                            {estaVencida(cot) ? "Revalidar" : "Extender vigencia"}
                          </button>
                          <button
                            className={css.accionPeligro}
                            onClick={() => eliminarCotizacion(cot)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </Frame>
  );
}

export default Cotizaciones;
