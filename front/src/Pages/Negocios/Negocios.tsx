import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Title } from "../../Components/Title/Title";
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
  }, []);

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
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Abierto">Abierto</option>
            <option value="Ganado">Ganado</option>
            <option value="Perdido/Vencido">Perdido/Vencido</option>
          </select>

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
                        <select
                          value={item.estado}
                          onChange={(e) => cambiarEstado(item.id, e.target.value)}
                        >
                          <option value="Abierto">Abierto</option>
                          <option value="Ganado">Ganado</option>
                          <option value="Perdido/Vencido">Perdido/Vencido</option>
                        </select>
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
            <Btn onClick={() => setNegocioDetalle(null)}>Cerrar ficha</Btn>
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
                <select
                  value={negocioDetalle.estado}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontWeight: 500,
                  }}
                  onChange={async (e) => {
                    const nuevoEstado = e.target.value;
                    await cambiarEstado(negocioDetalle.id, nuevoEstado);
                    setNegocioDetalle((prev) =>
                      prev ? { ...prev, estado: nuevoEstado } : null
                    );
                  }}
                >
                  <option value="Abierto">Abierto</option>
                  <option value="Ganado">Ganado</option>
                  <option value="Perdido/Vencido">Perdido/Vencido</option>
                </select>
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
                vendedorActual?.rol ||
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
        </Box>
      )}
    </>
  );
}

export default Negocios;