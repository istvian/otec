import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckAuth } from "../../Helpers/APIConnector";
import type { Relator } from "../../types/general";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Title } from "../../Components/Title/Title";
import { InputText } from "../../Components/InputText/InputText";
import { InputDate } from "../../Components/InputDate/InputDate";
import { Selector } from "../../Components/Selector/Selector";
import css from "./Negocios.module.css";

interface NegocioItem {
  id: number;
  empresaID: number;
  contactoID?: number | null;
  vendedorID: number;
  cursoID?: number | null;
  estado: string;
  montoTotal: number;
  fechaCreacion: string;
  fechaCierre: string;
  [key: string]: unknown;
}

interface EmpresaItem {
  id: number;
  nombre?: string;
  razon_social?: string;
  razonSocial?: string;
  rut?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  email?: string;
  giro?: string;
  rubro?: string;
  [key: string]: unknown;
}

interface VendedorItem {
  id: number;
  nombre: string;
  correo?: string;
  email?: string;
  telefono?: string;
  rolID?: number;
  rol?: string;
  [key: string]: unknown;
}

interface CursoItem {
  id: number;
  nombre?: string;
  nombre_comercial?: string;
  nombre_oficial?: string;
  titulo?: string;
  codigo?: string;
  modalidad?: string;
  horas?: number | string;
  duracion?: string;
  precio?: number | string;
  valor?: number | string;
  [key: string]: unknown;
}

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

const ETIQUETAS_LEGIBLES: Record<string, string> = {
  createdAt: "Fecha de registro",
  updatedAt: "Última actualización",
  razon_social: "Razón social",
  razonSocial: "Razón social",
  nombre_comercial: "Nombre comercial",
  nombre_oficial: "Nombre oficial",
  curso_oficial_id: "ID Curso oficial",
  estado_id: "ID Estado",
  contacto_id: "ID Contacto",
  empresa_id: "ID Empresa",
  vendedor_id: "ID Vendedor",
};

export function Negocios() {
  const [negocios, setNegocios] = useState<NegocioItem[]>([]);
  const [empresasById, setEmpresasById] = useState<Record<number, EmpresaItem>>({});
  const [vendedoresById, setVendedoresById] = useState<Record<number, VendedorItem>>({});
  const [cursosById, setCursosById] = useState<Record<number, CursoItem>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [negocioDetalle, setNegocioDetalle] = useState<NegocioItem | null>(null);
  const [adjuntos, setAdjuntos] = useState<any[]>([]);
  const [cargandoAdjuntos, setCargandoAdjuntos] = useState(false);
  const [subiendoAdjunto, setSubiendoAdjunto] = useState(false);
  const [relatores, setRelatores] = useState<Relator[]>([]);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);
  const [relatorSeleccionado, setRelatorSeleccionado] = useState<string>("");
  const [modalidadRelator, setModalidadRelator] = useState<string>("Presencial");
  const [honorariosRelator, setHonorariosRelator] = useState<string>("");
  const [plazoCobro, setPlazoCobro] = useState<string>("Contado");
  const [fechaRecepcionOC, setFechaRecepcionOC] = useState<Date>(new Date());
  const [estadoCobro, setEstadoCobro] = useState<string>("Pendiente");
  const [observacionesCobro, setObservacionesCobro] = useState<string>("");
  const [subiendoContrato, setSubiendoContrato] = useState(false);
  const nav = useNavigate();

  const cargarCatalogosRelacionados = async () => {
    const safeJson = async (url: string) => {
      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : data?.data || [];
      } catch {
        return [];
      }
    };

    const listaEmp = await safeJson(`${API_URL}/empresa`);
    const listaUsr = await safeJson(`${API_URL}/user`);
    const listaCursos = await safeJson(`${API_URL}/curso`);
    const listaCom = await safeJson(`${API_URL}/comercial`);

    const mapEmp: Record<number, EmpresaItem> = {};
    for (const emp of listaEmp as EmpresaItem[]) {
      if (emp?.id !== undefined) mapEmp[emp.id] = emp;
    }
    setEmpresasById(mapEmp);

    const mapUsr: Record<number, VendedorItem> = {};
    for (const usr of listaUsr as VendedorItem[]) {
      if (usr?.id !== undefined) mapUsr[usr.id] = usr;
    }
    setVendedoresById(mapUsr);

    const mapCursos: Record<number, CursoItem> = {};
    for (const c of [...(listaCursos as CursoItem[]), ...(listaCom as CursoItem[])]) {
      if (c?.id !== undefined) {
        mapCursos[c.id] = { ...(mapCursos[c.id] || {}), ...c };
      }
    }
    setCursosById(mapCursos);
  };

  const cargarNegocios = async () => {
    try {
      setLoading(true);
      setError(null);

      const urlNegocios = `${API_URL}/negocios`;
      const res = await fetch(urlNegocios, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Error ${res.status} al consultar ${urlNegocios}`);
      }
      const data = await res.json();
      const listaNegocios = Array.isArray(data) ? data : data?.data || [];
      setNegocios(listaNegocios);

      await cargarCatalogosRelacionados();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar negocios";
      setError(`${msg} (API: ${API_URL})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNegocios();
    cargarRelatores();
    CheckAuth().then((res) => {
      if (res && !res.error) setUsuarioActual((res as any).userdata || null);
    });
  }, []);

  useEffect(() => {
    if (negocioDetalle?.id) {
      cargarAdjuntos(negocioDetalle.id);
    } else {
      setAdjuntos([]);
    }
  }, [negocioDetalle?.id]);
  useEffect(() => {
    if (!negocioDetalle) return;
    const nd: any = negocioDetalle;
    if (nd.condicionCobro === "Contado" || nd.plazoCobroDias === 0 || nd.plazoCobroDias === "0") {
      setPlazoCobro("Contado");
    } else if (nd.plazoCobroDias != null) {
      setPlazoCobro(String(nd.plazoCobroDias));
    } else if (nd.condicionCobro && nd.condicionCobro !== "Contado") {
      setPlazoCobro(String(nd.condicionCobro));
    } else {
      setPlazoCobro("Contado");
    }
    if (nd.fechaRecepcionOC) {
      setFechaRecepcionOC(new Date(nd.fechaRecepcionOC));
    } else {
      const oc = adjuntos.find((a: any) => String(a.tipo).toUpperCase() === "OC");
      setFechaRecepcionOC(oc?.createdAt ? new Date(oc.createdAt) : new Date());
    }
    setEstadoCobro(nd.estadoCobro || "Pendiente");
    setObservacionesCobro(nd.observacionesCobro || "");
  }, [negocioDetalle?.id, adjuntos.length]);

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`${API_URL}/negocios/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el estado");
      const data = await res.json();

      setNegocios((prev) =>
        prev.map((n) => (n.id === id ? { ...n, estado: nuevoEstado } : n))
      );

      if (data.derivadoAOperaciones) {
        alert("Negocio marcado como Ganado: habilitado para derivación a Operaciones.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const cargarAdjuntos = async (negocioID: number) => {
    try {
      setCargandoAdjuntos(true);
      const res = await fetch(`${API_URL}/adjuntos?negocioID=${negocioID}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data?.data || [];
      setAdjuntos(lista);
    } catch {
      setAdjuntos([]);
    } finally {
      setCargandoAdjuntos(false);
    }
  };

  const cargarRelatores = async () => {
    try {
      const res = await fetch(`${API_URL}/relatores`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data?.data || [];
      setRelatores(lista);
    } catch {
      setRelatores([]);
    }
  };

  const esAutorizadoRelator = () => {
    const rolId = Number(usuarioActual?.rolID ?? usuarioActual?.rol?.id ?? usuarioActual?.rol);
    return [3, 6, 5].includes(rolId);
  };

  const contratos = adjuntos.filter((a: any) => String(a.tipo).toLowerCase() === "contrato");

  const subirContrato = async (file: File) => {
    if (!negocioDetalle) return;
    if (!relatorSeleccionado) {
      alert("Selecciona un relator");
      return;
    }
    try {
      setSubiendoContrato(true);
      const fd = new FormData();
      fd.append("archivo", file);
      fd.append("file", file);
      fd.append("tipo", "Contrato");
      fd.append("negocioID", String(negocioDetalle.id));
      fd.append("relatorID", relatorSeleccionado);
      fd.append("modalidad", modalidadRelator);
      if (honorariosRelator) fd.append("honorarios", honorariosRelator);
      const res = await fetch(`${API_URL}/adjuntos`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "No se pudo subir el contrato");
        return;
      }
      await cargarAdjuntos(negocioDetalle.id);
      setRelatorSeleccionado("");
      setHonorariosRelator("");
    } catch (err) {
      alert("Error al subir el contrato");
    } finally {
      setSubiendoContrato(false);
    }
  };

  const subirAdjunto = async (file: File, tipo: string) => {
    if (!negocioDetalle) return;
    try {
      setSubiendoAdjunto(true);
      const fd = new FormData();
      fd.append("archivo", file);
      fd.append("file", file);
      fd.append("tipo", tipo);
      fd.append("negocioID", String(negocioDetalle.id));
      const res = await fetch(`${API_URL}/adjuntos`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "No se pudo subir el adjunto");
        return;
      }
      await cargarAdjuntos(negocioDetalle.id);
    } catch (err) {
      alert("Error al subir el adjunto");
    } finally {
      setSubiendoAdjunto(false);
    }
  };

  const eliminarAdjunto = async (id: number) => {
    if (!confirm("¿Eliminar este adjunto?")) return;
    try {
      const res = await fetch(`${API_URL}/adjuntos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudo eliminar");
      if (negocioDetalle) await cargarAdjuntos(negocioDetalle.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const coordinarCurso = async () => {
    if (!negocioDetalle) return;
    try {
      const res = await fetch(`${API_URL}/negocios/${negocioDetalle.id}/coordinar`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "No se pudo coordinar el curso");
        return;
      }
      alert("Curso coordinado exitosamente");
      setNegocioDetalle((prev) => (prev ? { ...prev, estadoOperacion: "Coordinado" } : null));
    } catch (err) {
      alert("Error al coordinar el curso");
    }
  };

  const ejecutarCurso = async () => {
    if (!negocioDetalle) return;
    try {
      const res = await fetch(`${API_URL}/negocios/${negocioDetalle.id}/ejecutar`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "No se pudo ejecutar el curso");
        return;
      }
      alert("Curso en ejecución");
      setNegocioDetalle((prev) =>
        prev ? { ...prev, estadoOperacion: "En ejecucion" } : null
      );
    } catch (err) {
      alert("Error al ejecutar el curso");
    }
  };

  const descargarAdjunto = (id: number) => {
    window.open(`${API_URL}/adjuntos/${id}/descargar`, "_blank");
  };

  const obtenerNombreCurso = (cursoID?: number | null) => {
    if (!cursoID) return "Sin curso asignado";
    const c = cursosById[cursoID];
    if (!c) return `Curso #${cursoID}`;
    return c.nombre_comercial || c.nombre || c.nombre_oficial || c.titulo || `Curso #${cursoID}`;
  };

  const obtenerNombreEmpresa = (item: NegocioItem) => {
    const emp = empresasById[item.empresaID];
    if (!emp) return `Empresa #${item.empresaID}`;
    return emp.razon_social || emp.razonSocial || emp.nombre || `Empresa #${item.empresaID}`;
  };

  const obtenerNombreVendedor = (vendedorID: number) => {
    const usr = vendedoresById[vendedorID];
    if (!usr) return `Vendedor #${vendedorID}`;
    return usr.nombre || usr.correo || usr.email || `Vendedor #${vendedorID}`;
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return "No registrada";
    const d = new Date(fecha);
    return Number.isNaN(d.getTime()) ? fecha : d.toLocaleDateString("es-CL");
  };

  const formatCLP = (monto: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(monto || 0);

  const formatearClave = (key: string) => {
    if (ETIQUETAS_LEGIBLES[key]) return ETIQUETAS_LEGIBLES[key];
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatearValor = (key: string, val: unknown) => {
    if (typeof val === "boolean") return val ? "Sí" : "No";
    if (
      typeof val === "string" &&
      (key.toLowerCase().includes("fecha") ||
        key.endsWith("At") ||
        /^\d{4}-\d{2}-\d{2}T/.test(val))
    ) {
      return formatFecha(val);
    }
    return String(val);
  };

  const renderCampoFormal = (etiqueta: string, valor: React.ReactNode) => (
    <div
      key={etiqueta}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.2rem",
        padding: "0.65rem 0.85rem",
        backgroundColor: "#f8fafc",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#64748b",
        }}
      >
        {etiqueta}
      </span>
      <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#0f172a" }}>
        {valor}
      </span>
    </div>
  );

  const renderCamposExtraFormales = (
    obj: Record<string, unknown>,
    omitKeys: string[]
  ) => {
    const extras = Object.entries(obj).filter(
      ([key, val]) =>
        !omitKeys.includes(key) &&
        val !== null &&
        val !== undefined &&
        val !== "" &&
        typeof val !== "object"
    );

    if (extras.length === 0) return null;

    return extras.map(([key, val]) =>
      renderCampoFormal(formatearClave(key), formatearValor(key, val))
    );
  };

  const getBadgeStyle = (estado: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: "inline-block",
      padding: "0.2rem 0.65rem",
      borderRadius: "999px",
      fontSize: "0.8rem",
      fontWeight: 600,
    };
    if (estado === "Ganado") {
      return { ...base, backgroundColor: "#dcfce7", color: "#166534" };
    }
    if (estado === "Perdido/Vencido") {
      return { ...base, backgroundColor: "#fee2e2", color: "#991b1b" };
    }
    return { ...base, backgroundColor: "#dbeafe", color: "#1e40af" };
  };

  const negociosFiltrados =
    filtroEstado === "Todos"
      ? negocios
      : negocios.filter((n) => n.estado === filtroEstado);

  const empresaActual = negocioDetalle
    ? empresasById[negocioDetalle.empresaID]
    : undefined;
  const vendedorActual = negocioDetalle
    ? vendedoresById[negocioDetalle.vendedorID]
    : undefined;
  const cursoActual =
    negocioDetalle && negocioDetalle.cursoID
      ? cursosById[negocioDetalle.cursoID]
      : undefined;

  return (
    <>
      <Box
        style={{
          flexFlow: "row wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title>Negocios</Title>
        <div className={css.actions}>
          <Selector
            title=""
            firstOption="Todos los estados"
            data={filtroEstado === "Todos" ? "Todos los estados" : filtroEstado}
            options={["Todos los estados", "Abierto", "Ganado", "Perdido/Vencido"]}
            setData={(val) =>
              setFiltroEstado(val === "Todos los estados" ? "Todos" : val)
            }
          />

          <Btn
            onClick={() => {
              nav("/negocios/crear");
            }}
          >
            Crear negocio
          </Btn>
        </div>
      </Box>

      <Box>
        <Title>Listado de negocios</Title>
        {loading && <p>Cargando negocios...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className={css.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Curso asociado</th>
                  <th>Empresa</th>
                  <th>Vendedor</th>
                  <th>Estado</th>
                  <th>Monto Total</th>
                  <th>Fecha de creación</th>
                  <th>Fecha de cierre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {negociosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9}>No hay negocios registrados.</td>
                  </tr>
                ) : (
                  negociosFiltrados.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{obtenerNombreCurso(item.cursoID)}</td>
                      <td>{obtenerNombreEmpresa(item)}</td>
                      <td>{obtenerNombreVendedor(item.vendedorID)}</td>
                      <td>
                        <Selector
                          title=""
                          firstOption="Estado"
                          data={item.estado}
                          options={["Abierto", "Ganado", "Perdido/Vencido"]}
                          setData={(val) => cambiarEstado(item.id, val)}
                        />
                      </td>
                      <td>{formatCLP(item.montoTotal)}</td>
                      <td>{formatFecha(item.fechaCreacion)}</td>
                      <td>{formatFecha(item.fechaCierre)}</td>
                      <td>
                        <Btn onClick={() => setNegocioDetalle(item)}>
                          Ver detalle
                        </Btn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Box>

      {negocioDetalle && (
        <Box>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
              paddingBottom: "0.85rem",
              borderBottom: "2px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <Title>Ficha General del Negocio N° {negocioDetalle.id}</Title>
              <span style={getBadgeStyle(negocioDetalle.estado)}>
                {negocioDetalle.estado}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Btn
                onClick={() => {
                  const params = new URLSearchParams({
                    empresaID: String(negocioDetalle.empresaID),
                    negocioID: String(negocioDetalle.id),
                  });
                  if (negocioDetalle.cursoID) {
                    params.set("cursoID", String(negocioDetalle.cursoID));
                  }
                  nav(`/cotizaciones/crear?${params.toString()}`);
                }}
              >
                Generar cotización
              </Btn>
              <Btn onClick={() => setNegocioDetalle(null)}>Cerrar ficha</Btn>
            </div>
          </div>

          <section style={{ marginTop: "1.25rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.35rem",
                marginBottom: "0.75rem",
              }}
            >
              1. Información General de la Oportunidad
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {renderCampoFormal("Código de negocio", `#${negocioDetalle.id}`)}
              {renderCampoFormal("Monto total estimado", formatCLP(negocioDetalle.montoTotal))}
              {renderCampoFormal("Fecha de creación", formatFecha(negocioDetalle.fechaCreacion))}
              {renderCampoFormal("Fecha estimada de cierre", formatFecha(negocioDetalle.fechaCierre))}
              {renderCampoFormal(
                "Estado comercial",
                <Selector
                  title=""
                  firstOption="Estado"
                  data={negocioDetalle.estado}
                  options={["Abierto", "Ganado", "Perdido/Vencido"]}
                  setData={async (val) => {
                    await cambiarEstado(negocioDetalle.id, val);
                    setNegocioDetalle((prev) =>
                      prev ? { ...prev, estado: val } : null
                    );
                  }}
                />
              )}
              {negocioDetalle.contactoID &&
                renderCampoFormal("ID Contacto asociado", `#${negocioDetalle.contactoID}`)}
              {renderCamposExtraFormales(negocioDetalle, [
                "id",
                "estado",
                "montoTotal",
                "fechaCreacion",
                "fechaCierre",
                "empresaID",
                "vendedorID",
                "cursoID",
                "contactoID",
              ])}
            </div>
          </section>

          <section style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.35rem",
                marginBottom: "0.75rem",
              }}
            >
              2. Antecedentes de la Empresa Cliente
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {renderCampoFormal(
                "Razón social",
                empresaActual?.razon_social ||
                  empresaActual?.razonSocial ||
                  empresaActual?.nombre ||
                  `Empresa #${negocioDetalle.empresaID}`
              )}
              {renderCampoFormal(
                "Nombre comercial / fantasía",
                empresaActual?.nombre || "No registrado"
              )}
              {renderCampoFormal("RUT", empresaActual?.rut || "No registrado")}
              {renderCampoFormal("Dirección", empresaActual?.direccion || "No registrada")}
              {renderCampoFormal("Teléfono de contacto", empresaActual?.telefono || "No registrado")}
              {renderCampoFormal(
                "Correo electrónico",
                empresaActual?.correo || empresaActual?.email || "No registrado"
              )}
              {renderCampoFormal(
                "Giro / Rubro",
                empresaActual?.giro || empresaActual?.rubro || "No registrado"
              )}
              {empresaActual &&
                renderCamposExtraFormales(empresaActual, [
                  "id",
                  "razon_social",
                  "razonSocial",
                  "nombre",
                  "rut",
                  "direccion",
                  "telefono",
                  "correo",
                  "email",
                  "giro",
                  "rubro",
                ])}
            </div>
          </section>

          <section style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.35rem",
                marginBottom: "0.75rem",
              }}
            >
              3. Ejecutivo Comercial Asignado
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {renderCampoFormal(
                "Nombre completo",
                vendedorActual?.nombre || `Vendedor #${negocioDetalle.vendedorID}`
              )}
              {renderCampoFormal(
                "Correo institucional",
                vendedorActual?.correo || vendedorActual?.email || "No registrado"
              )}
              {renderCampoFormal("Teléfono", vendedorActual?.telefono || "No registrado")}
              {renderCampoFormal(
                "Cargo / Rol",
                (typeof vendedorActual?.rol === "object" && vendedorActual?.rol
                  ? (vendedorActual.rol as any).nombre
                  : vendedorActual?.rol) ||
                  (vendedorActual?.rolID === 2
                    ? "Ejecutivo Comercial (Vendedor)"
                    : vendedorActual?.rolID
                    ? `Rol #${vendedorActual.rolID}`
                    : "No especificado")
              )}
              {vendedorActual &&
                renderCamposExtraFormales(vendedorActual, [
                  "id",
                  "nombre",
                  "correo",
                  "email",
                  "telefono",
                  "rol",
                  "rolID",
                ])}
            </div>
          </section>

          <section style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.35rem",
                marginBottom: "0.75rem",
              }}
            >
              4. Programa o Curso Asociado
            </h3>
            {!negocioDetalle.cursoID ? (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                Este negocio no tiene un curso asociado registrado.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {renderCampoFormal(
                  "Nombre del curso",
                  obtenerNombreCurso(negocioDetalle.cursoID)
                )}
                {renderCampoFormal("Código", cursoActual?.codigo || "No registrado")}
                {renderCampoFormal("Modalidad", cursoActual?.modalidad || "No especificada")}
                {renderCampoFormal(
                  "Horas / Duración",
                  cursoActual?.horas ?? cursoActual?.duracion ?? "No especificada"
                )}
                {renderCampoFormal(
                  "Valor de referencia",
                  cursoActual?.precio !== undefined
                    ? formatCLP(Number(cursoActual.precio))
                    : cursoActual?.valor !== undefined
                    ? formatCLP(Number(cursoActual.valor))
                    : "No especificado"
                )}
                {cursoActual &&
                  renderCamposExtraFormales(cursoActual, [
                    "id",
                    "nombre",
                    "nombre_comercial",
                    "nombre_oficial",
                    "titulo",
                    "codigo",
                    "modalidad",
                    "horas",
                    "duracion",
                    "precio",
                    "valor",
                  ])}
              </div>
            )}
          </section>

          <section style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.35rem",
                marginBottom: "0.75rem",
              }}
            >
              5. Respaldos (Orden de Compra y Nómina SENCE)
            </h3>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>OC (PDF):</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={subiendoAdjunto}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirAdjunto(f, "OC");
                    e.target.value = "";
                  }}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Nómina (Excel/PDF):</span>
                <input
                  type="file"
                  accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  disabled={subiendoAdjunto}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirAdjunto(f, "Nomina");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {cargandoAdjuntos ? (
              <p>Cargando adjuntos...</p>
            ) : adjuntos.length === 0 ? (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                No hay respaldos adjuntos. Adjunte la Orden de Compra para coordinar/ejecutar el curso.
              </p>
            ) : (
              <div className={css.tableContainer}>
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Archivo</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjuntos.map((a: any) => (
                      <tr key={a.id}>
                        <td>{a.tipo}</td>
                        <td>{a.nombreArchivo}</td>
                        <td>{formatFecha(a.createdAt || a.fechaSubida)}</td>
                        <td style={{ display: "flex", gap: "0.4rem" }}>
                          <Btn onClick={() => descargarAdjunto(a.id)}>Descargar</Btn>
                          <Btn warning onClick={() => eliminarAdjunto(a.id)}>
                            Eliminar
                          </Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <Btn onClick={coordinarCurso}>Coordinar curso</Btn>
              <Btn onClick={ejecutarCurso}>Ejecutar curso</Btn>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
              La coordinación/ejecución requiere la Orden de Compra (OC) adjunta.
            </p>
          </section>

          <section style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.35rem",
                marginBottom: "0.75rem",
              }}
            >
              6. Asignación y Formalización del Relator
            </h3>

            {!esAutorizadoRelator() ? (
              <p style={{ color: "#64748b", fontStyle: "italic" }}>
                Los honorarios y contratos de relator son visibles únicamente para perfiles
                autorizados (Operaciones, RRHH, Admin).
              </p>
            ) : (
              <>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "center" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Relator:</span>
                    <Selector
                      title=""
                      firstOption="-- Seleccionar relator --"
                      data={
                        (relatores
                          .filter((r) => r.activo !== false)
                          .map((r) => `${r.nombre} ${r.especialidad ? `(${r.especialidad})` : ""}`.trim())
                          .find((_, idx) => {
                            const rr = relatores.filter((x) => x.activo !== false)[idx];
                            return String(rr?.id) === relatorSeleccionado;
                          })) || ""
                      }
                      options={relatores
                        .filter((r) => r.activo !== false)
                        .map((r) => `${r.nombre} ${r.especialidad ? `(${r.especialidad})` : ""}`.trim())}
                      setData={(val) => {
                        const r = relatores
                          .filter((x) => x.activo !== false)
                          .find((x) => `${x.nombre} ${x.especialidad ? `(${x.especialidad})` : ""}`.trim() === val);
                        setRelatorSeleccionado(r ? String(r.id) : "");
                      }}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Modalidad:</span>
                    <Selector
                      title=""
                      firstOption="Modalidad"
                      data={modalidadRelator}
                      options={["Presencial", "Online", "Distancia"]}
                      setData={setModalidadRelator}
                    />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Honorarios (CLP):</span>
                    <InputText
                       label=""
                       type="number"
                       value={honorariosRelator}
                       onChange={(text) => setHonorariosRelator(text)}
                       placeholder="Honorarios (CLP)"
                     />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.2rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Contrato (PDF):</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      disabled={subiendoContrato}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) subirContrato(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {subiendoContrato && <p>Subiendo contrato...</p>}

                {contratos.length === 0 ? (
                  <p style={{ color: "#64748b", fontStyle: "italic" }}>
                    No hay contratos de relator asignados.
                  </p>
                ) : (
                  <div className={css.tableContainer}>
                    <table>
                      <thead>
                        <tr>
                          <th>Relator</th>
                          <th>Modalidad</th>
                          <th>Honorarios</th>
                          <th>Archivo</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contratos.map((a: any) => (
                          <tr key={a.id}>
                            <td>{a.relator?.nombre || (a.relatorID ? `Relator #${a.relatorID}` : "-")}</td>
                            <td>{a.modalidad || "-"}</td>
                            <td>{a.honorarios != null ? formatCLP(Number(a.honorarios)) : "-"}</td>
                            <td>{a.nombreArchivo}</td>
                            <td style={{ display: "flex", gap: "0.4rem" }}>
                              <Btn onClick={() => window.open(`${API_URL}/adjuntos/${a.id}/descargar`, "_blank")}>
                                Descargar
                              </Btn>
                              <Btn warning onClick={() => eliminarAdjunto(a.id)}>
                                Eliminar
                              </Btn>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </section>

          <section style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#1e293b",
                borderBottom: "1px solid #cbd5e1",
                paddingBottom: "0.35rem",
                marginBottom: "0.75rem",
              }}
            >
              7. Condiciones y Plazos de Cobro B2B
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              {renderCampoFormal(
                "Condición actual",
                (negocioDetalle as any).condicionCobro
                  ? (negocioDetalle as any).condicionCobro === "Contado"
                    ? "Contado"
                    : `${(negocioDetalle as any).condicionCobro} días`
                  : "No registrada"
              )}
              {renderCampoFormal(
                "Fecha recepción OC",
                (negocioDetalle as any).fechaRecepcionOC
                  ? formatFecha(String((negocioDetalle as any).fechaRecepcionOC))
                  : "No registrada"
              )}
              {renderCampoFormal(
                "Fecha estimada de cobro",
                (negocioDetalle as any).fechaEstimadaCobro
                  ? formatFecha(String((negocioDetalle as any).fechaEstimadaCobro))
                  : "No calculada"
              )}
              {renderCampoFormal(
                "Estado de cobro",
                (negocioDetalle as any).estadoCobro || "Pendiente"
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "0.75rem" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Plazo de pago:</span>
                <Selector
                  title=""
                  firstOption="Plazo"
                  data={plazoCobro}
                  options={["Contado", "30", "45", "60"]}
                  setData={setPlazoCobro}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Fecha recepción OC:</span>
                <InputDate
                  label=""
                  value={fechaRecepcionOC}
                  onChange={(d) => setFechaRecepcionOC(d)}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Estado de cobro:</span>
                <Selector
                  title=""
                  firstOption="Estado"
                  data={estadoCobro}
                  options={["Pendiente", "Cobrado", "Vencido"]}
                  setData={setEstadoCobro}
                />
              </label>
              <Btn
                onClick={async () => {
                  const plazo = plazoCobro;
                  const fecha = fechaRecepcionOC.toISOString().slice(0, 10);
                  const estado = estadoCobro;
                  try {
                    const res = await fetch(`${API_URL}/negocios/${negocioDetalle.id}/cobro`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        plazo,
                        fechaRecepcionOC: fecha,
                        estadoCobro: estado,
                        observacionesCobro,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      alert(data?.message || "No se pudo registrar la condición de cobro");
                      return;
                    }
                    const actualizado = data?.data || data;
                    setNegocioDetalle((prev) =>
                      prev ? { ...prev, ...actualizado } : null
                    );
                    alert("Condición de cobro registrada correctamente");
                  } catch (err) {
                    alert("Error al registrar la condición de cobro");
                  }
                }}
              >
                Registrar condición de cobro
              </Btn>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Observaciones:</span>
              <InputText
                label=""
                value={observacionesCobro}
                onChange={(text) => setObservacionesCobro(text)}
                placeholder="Observaciones"
                isArea
              />
            </label>

            {!adjuntos.some((a: any) => String(a.tipo).toUpperCase() === "OC") && (
              <p style={{ fontSize: "0.8rem", color: "#b45309", marginTop: "0.5rem" }}>
                Advertencia: no hay Orden de Compra (OC) adjunta. La condición de cobro se calcula a partir de la recepción de la OC.
              </p>
            )}
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
              Plazos estándar: Contado, 30, 45 o 60 días a partir de la recepción de la OC.
            </p>
          </section>
        </Box>
      )}
    </>
  );
}

export default Negocios;