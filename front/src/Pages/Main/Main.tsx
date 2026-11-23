import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import { Spinner } from "../../Components/Spinner/Spinner";
import { Title } from "../../Components/Title/Title";
import useIsLogin from "../../Hooks/useIsLogin";
import css from "./Main.module.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

type Item = Record<string, any>;

const safeJson = async (url: string): Promise<Item[]> => {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || [];
  } catch {
    return [];
  }
};

const formatCLP = (monto?: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(monto || 0));

const formatFecha = (fecha?: string | Date | null) => {
  if (!fecha) return "No registrada";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? String(fecha) : d.toLocaleDateString("es-CL");
};

const estaVencidaCot = (cot: Item) => {
  if (typeof cot.vencida === "boolean") return cot.vencida;
  const emision = new Date(cot.fechaEmision || cot.createdAt || "");
  if (Number.isNaN(emision.getTime())) return false;
  const vencimiento = new Date(emision);
  vencimiento.setDate(vencimiento.getDate() + Number(cot.validezDias || 15));
  return vencimiento < new Date();
};

export function Main() {
  const status = useIsLogin();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [fechaActual] = useState(() =>
    new Date().toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  const [empresas, setEmpresas] = useState<Item[]>([]);
  const [cursos, setCursos] = useState<Item[]>([]);
  const [comerciales, setComerciales] = useState<Item[]>([]);
  const [negocios, setNegocios] = useState<Item[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Item[]>([]);
  const [relatores, setRelatores] = useState<Item[]>([]);
  const [adjuntos, setAdjuntos] = useState<Item[]>([]);
  const [cobros, setCobros] = useState<Item[]>([]);
  const [usuarios, setUsuarios] = useState<Item[]>([]);

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        listaEmpresas,
        listaCursos,
        listaComerciales,
        listaNegocios,
        listaCotizaciones,
        listaRelatores,
        listaAdjuntos,
        listaCobros,
        listaUsuarios,
      ] = await Promise.all([
        safeJson(`${API_URL}/empresa`),
        safeJson(`${API_URL}/curso`),
        safeJson(`${API_URL}/comercial`),
        safeJson(`${API_URL}/negocios`),
        safeJson(`${API_URL}/cotizaciones`),
        safeJson(`${API_URL}/relatores`),
        safeJson(`${API_URL}/adjuntos`),
        safeJson(`${API_URL}/cobros?soloConCobro=true`),
        safeJson(`${API_URL}/user`),
      ]);

      setEmpresas(listaEmpresas);
      setCursos(listaCursos);
      setComerciales(listaComerciales);
      setNegocios(listaNegocios);
      setCotizaciones(listaCotizaciones);
      setRelatores(listaRelatores);
      setAdjuntos(listaAdjuntos);
      setCobros(listaCobros);
      setUsuarios(listaUsuarios);
      setLastUpdate(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authorized") cargar();
  }, [status]);

  const stats = useMemo(() => {
    const negociosTotal = negocios.length;
    const negociosAbiertos = negocios.filter((n) => n.estado === "Abierto").length;
    const negociosGanados = negocios.filter((n) => n.estado === "Ganado").length;
    const negociosPerdidos = negocios.filter(
      (n) => n.estado === "Perdido/Vencido",
    ).length;
    const montoNegocios = negocios.reduce(
      (acc, n) => acc + Number(n.montoTotal || 0),
      0,
    );

    const cotizacionesTotal = cotizaciones.length;
    const cotizacionesAceptadas = cotizaciones.filter(
      (c) => c.estado === "Aceptada",
    ).length;
    const cotizacionesEnviadas = cotizaciones.filter(
      (c) => c.estado === "Enviada",
    ).length;
    const cotizacionesBorrador = cotizaciones.filter(
      (c) => !c.estado || c.estado === "Borrador",
    ).length;
    const cotizacionesRechazadas = cotizaciones.filter(
      (c) => c.estado === "Rechazada",
    ).length;
    const cotizacionesVencidas = cotizaciones.filter(estaVencidaCot).length;
    const montoCotizado = cotizaciones.reduce(
      (acc, c) => acc + Number(c.total || 0),
      0,
    );

    const cobrosPendientes = cobros.filter(
      (c) => (c.estadoCobro || "Pendiente") === "Pendiente",
    ).length;
    const cobrosCobrados = cobros.filter(
      (c) => c.estadoCobro === "Cobrado",
    ).length;
    const cobrosVencidos = cobros.filter((c) => c.vencida).length;
    const montoPorCobrar = cobros
      .filter((c) => c.estadoCobro !== "Cobrado")
      .reduce((acc, c) => acc + Number(c.montoTotal || 0), 0);

    const relatoresActivos = relatores.filter(
      (r) => r.activo !== false && !r.deleted,
    ).length;

    const adjuntosOC = adjuntos.filter(
      (a) => String(a.tipo || "").toUpperCase() === "OC",
    ).length;
    const adjuntosNomina = adjuntos.filter(
      (a) => String(a.tipo || "").toLowerCase() === "nomina",
    ).length;
    const adjuntosContrato = adjuntos.filter(
      (a) => String(a.tipo || "").toLowerCase() === "contrato",
    ).length;

    const contactosTotal = empresas.reduce(
      (acc, e) => acc + (Array.isArray(e.contactos) ? e.contactos.length : 0),
      0,
    );

    return {
      empresas: empresas.length,
      contactos: contactosTotal,
      cursos: cursos.length,
      comerciales: comerciales.length,
      negociosTotal,
      negociosAbiertos,
      negociosGanados,
      negociosPerdidos,
      montoNegocios,
      cotizacionesTotal,
      cotizacionesAceptadas,
      cotizacionesEnviadas,
      cotizacionesBorrador,
      cotizacionesRechazadas,
      cotizacionesVencidas,
      montoCotizado,
      cobrosTotal: cobros.length,
      cobrosPendientes,
      cobrosCobrados,
      cobrosVencidos,
      montoPorCobrar,
      relatores: relatores.length,
      relatoresActivos,
      adjuntos: adjuntos.length,
      adjuntosOC,
      adjuntosNomina,
      adjuntosContrato,
      usuarios: usuarios.length,
    };
  }, [empresas, cursos, comerciales, negocios, cotizaciones, relatores, adjuntos, cobros, usuarios]);

  const ultimosNegocios = useMemo(
    () =>
      [...negocios]
        .sort(
          (a, b) =>
            new Date(b.fechaCreacion || b.createdAt || 0).getTime() -
            new Date(a.fechaCreacion || a.createdAt || 0).getTime(),
        )
        .slice(0, 5),
    [negocios],
  );

  const ultimasCotizaciones = useMemo(
    () =>
      [...cotizaciones]
        .sort(
          (a, b) =>
            new Date(b.fechaEmision || b.createdAt || 0).getTime() -
            new Date(a.fechaEmision || a.createdAt || 0).getTime(),
        )
        .slice(0, 5),
    [cotizaciones],
  );

  const proximosCobros = useMemo(
    () =>
      [...cobros]
        .filter((c) => c.fechaEstimadaCobro)
        .sort(
          (a, b) =>
            new Date(a.fechaEstimadaCobro).getTime() -
            new Date(b.fechaEstimadaCobro).getTime(),
        )
        .slice(0, 5),
    [cobros],
  );

  if (status === "checking") return <Spinner />;
  if (status !== "authorized") return null;

  const maxNegocioEstado = Math.max(
    stats.negociosAbiertos,
    stats.negociosGanados,
    stats.negociosPerdidos,
    1,
  );
  const maxCotEstado = Math.max(
    stats.cotizacionesBorrador,
    stats.cotizacionesEnviadas,
    stats.cotizacionesAceptadas,
    stats.cotizacionesRechazadas,
    1,
  );

  return (
    <Frame>
      <div className={css.dashboard}>
        <Box
          style={{
            flexFlow: "row wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Title>Dashboard</Title>
            <p style={{ margin: "0.25rem 0 0", opacity: 0.7, fontSize: "0.9rem" }}>
              Resumen informativo del sistema KeepLearning
            </p>
          </div>
          <div className={css.headerActions}>
            {lastUpdate && (
              <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Actualizado: {lastUpdate.toLocaleTimeString("es-CL")}
              </span>
            )}
            <Btn onClick={cargar} disabled={loading}>
              {loading ? "Cargando..." : "Actualizar"}
            </Btn>
          </div>
        </Box>

        {loading && !lastUpdate && (
          <Box>
            <p>Cargando información del dashboard...</p>
          </Box>
        )}

        {error && (
          <Box>
            <p style={{ color: "crimson" }}>{error}</p>
          </Box>
        )}

        {!loading || lastUpdate ? (
          <>
            {/* KPIs principales */}
            <div className={css.kpiGrid}>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Empresas</span>
                <span className={css.kpiValue}>{stats.empresas}</span>
                <span className={css.kpiSub}>
                  {stats.contactos} contactos registrados
                </span>
              </div>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Cursos SENCE</span>
                <span className={css.kpiValue}>{stats.cursos}</span>
                <span className={css.kpiSub}>
                  {stats.comerciales} temarios comerciales
                </span>
              </div>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Negocios</span>
                <span className={css.kpiValue}>{stats.negociosTotal}</span>
                <span className={css.kpiSub}>
                  {formatCLP(stats.montoNegocios)} monto total
                </span>
              </div>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Cotizaciones</span>
                <span className={css.kpiValue}>{stats.cotizacionesTotal}</span>
                <span className={css.kpiSub}>
                  {formatCLP(stats.montoCotizado)} monto cotizado
                </span>
              </div>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Cuentas por cobrar</span>
                <span className={css.kpiValue}>{stats.cobrosTotal}</span>
                <span className={css.kpiSub}>
                  {formatCLP(stats.montoPorCobrar)} por cobrar
                </span>
              </div>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Relatores</span>
                <span className={css.kpiValue}>{stats.relatores}</span>
                <span className={css.kpiSub}>
                  {stats.relatoresActivos} activos
                </span>
              </div>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Respaldos</span>
                <span className={css.kpiValue}>{stats.adjuntos}</span>
                <span className={css.kpiSub}>
                  {stats.adjuntosOC} OC · {stats.adjuntosNomina} nóminas ·{" "}
                  {stats.adjuntosContrato} contratos
                </span>
              </div>
              <div className={css.kpiCard}>
                <span className={css.kpiTitle}>Usuarios</span>
                <span className={css.kpiValue}>{stats.usuarios}</span>
                <span className={css.kpiSub}>Registrados en el sistema</span>
              </div>
            </div>

            {/* Distribuciones */}
            <div className={css.sectionGrid}>
              <div className={css.section}>
                <h3>Negocios por estado</h3>
                <div className={css.barList}>
                  {[
                    { label: "Abiertos", value: stats.negociosAbiertos, color: "#2563eb" },
                    { label: "Ganados", value: stats.negociosGanados, color: "#16a34a" },
                    { label: "Perdidos/Vencidos", value: stats.negociosPerdidos, color: "#dc2626" },
                  ].map((item) => (
                    <div className={css.barRow} key={item.label}>
                      <div className={css.barLabel}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className={css.barTrack}>
                        <div
                          className={css.barFill}
                          style={{
                            width: `${(item.value / maxNegocioEstado) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={css.kpiRow}>
                  <span>Total: {stats.negociosTotal}</span>
                </div>
              </div>

              <div className={css.section}>
                <h3>Cotizaciones por estado</h3>
                <div className={css.barList}>
                  {[
                    { label: "Borrador", value: stats.cotizacionesBorrador, color: "#64748b" },
                    { label: "Enviadas", value: stats.cotizacionesEnviadas, color: "#2563eb" },
                    { label: "Aceptadas", value: stats.cotizacionesAceptadas, color: "#16a34a" },
                    { label: "Rechazadas", value: stats.cotizacionesRechazadas, color: "#dc2626" },
                  ].map((item) => (
                    <div className={css.barRow} key={item.label}>
                      <div className={css.barLabel}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className={css.barTrack}>
                        <div
                          className={css.barFill}
                          style={{
                            width: `${(item.value / maxCotEstado) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={css.kpiRow}>
                  <span>Total: {stats.cotizacionesTotal}</span>
                  <span>· Vencidas: {stats.cotizacionesVencidas}</span>
                </div>
              </div>

              <div className={css.section}>
                <h3>Cuentas por cobrar</h3>
                <div className={css.barList}>
                  {[
                    { label: "Pendientes", value: stats.cobrosPendientes, color: "#d97706" },
                    { label: "Cobradas", value: stats.cobrosCobrados, color: "#16a34a" },
                    { label: "Vencidas", value: stats.cobrosVencidos, color: "#dc2626" },
                  ].map((item) => {
                    const max = Math.max(stats.cobrosTotal, 1);
                    return (
                      <div className={css.barRow} key={item.label}>
                        <div className={css.barLabel}>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                        <div className={css.barTrack}>
                          <div
                            className={css.barFill}
                            style={{
                              width: `${(item.value / max) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={css.kpiRow}>
                  <span>Total: {stats.cobrosTotal}</span>
                  <span>· Por cobrar: {formatCLP(stats.montoPorCobrar)}</span>
                </div>
              </div>

              <div className={css.section}>
                <h3>Accesos rápidos</h3>
                <div className={css.quickLinks}>
                  <button onClick={() => nav("/empresas")}>Empresas</button>
                  <button onClick={() => nav("/catalogo")}>Catálogo</button>
                  <button onClick={() => nav("/negocios")}>Negocios</button>
                  <button onClick={() => nav("/cotizaciones")}>Cotizaciones</button>
                  <button onClick={() => nav("/cobros")}>Cobros</button>
                  <button onClick={() => nav("/relatores")}>Relatores</button>
                  <button onClick={() => nav("/respaldos")}>Respaldos</button>
                </div>
                <p className={css.empty}>Fecha actual: {fechaActual}</p>
              </div>
            </div>

            {/* Listados recientes */}
            <div className={css.sectionGrid}>
              <div className={css.section}>
                <h3>Últimos negocios</h3>
                {ultimosNegocios.length === 0 ? (
                  <p className={css.empty}>No hay negocios registrados.</p>
                ) : (
                  <div className={css.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Estado</th>
                          <th>Monto</th>
                          <th>Cierre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimosNegocios.map((n) => (
                          <tr key={n.id}>
                            <td>#{n.id}</td>
                            <td>{n.estado}</td>
                            <td>{formatCLP(n.montoTotal)}</td>
                            <td>{formatFecha(n.fechaCierre)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={css.section}>
                <h3>Últimas cotizaciones</h3>
                {ultimasCotizaciones.length === 0 ? (
                  <p className={css.empty}>No hay cotizaciones registradas.</p>
                ) : (
                  <div className={css.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Cliente</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimasCotizaciones.map((c) => (
                          <tr key={c.id}>
                            <td>COT-{String(c.id).padStart(5, "0")}</td>
                            <td>{c.nombreCliente || "Sin cliente"}</td>
                            <td>{formatCLP(c.total)}</td>
                            <td>{c.estado || "Borrador"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={css.section}>
                <h3>Próximos cobros</h3>
                {proximosCobros.length === 0 ? (
                  <p className={css.empty}>No hay cobros programados.</p>
                ) : (
                  <div className={css.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>Negocio</th>
                          <th>Empresa</th>
                          <th>Estimado</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proximosCobros.map((c) => (
                          <tr key={c.id}>
                            <td>#{c.id}</td>
                            <td>
                              {c.empresa?.razon ||
                                c.empresa?.razonSocial ||
                                `Empresa #${c.empresaID}`}
                            </td>
                            <td>{formatFecha(c.fechaEstimadaCobro)}</td>
                            <td>{c.estadoCobro || "Pendiente"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Frame>
  );
}

export default Main;