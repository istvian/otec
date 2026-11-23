import { useEffect, useState } from "react";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Title } from "../../Components/Title/Title";
import { Selector } from "../../Components/Selector/Selector";
import css from "../Negocios/Negocios.module.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

interface CobroItem {
  id: number;
  empresaID: number;
  montoTotal?: number;
  condicionCobro?: string | null;
  plazoCobroDias?: number | null;
  fechaRecepcionOC?: string | null;
  fechaEstimadaCobro?: string | null;
  estadoCobro?: string | null;
  observacionesCobro?: string | null;
  vencida?: boolean;
  [key: string]: unknown;
}

interface EmpresaItem {
  id: number;
  razon_social?: string;
  razonSocial?: string;
  nombre?: string;
  [key: string]: unknown;
}

export function CuentasPorCobrar() {
  const [cobros, setCobros] = useState<CobroItem[]>([]);
  const [empresasById, setEmpresasById] = useState<Record<number, EmpresaItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/cuentas-por-cobrar?soloConCobro=true`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data?.data || [];
      setCobros(lista);

      const resEmp = await fetch(`${API_URL}/empresa`, { credentials: "include" });
      if (resEmp.ok) {
        const d = await resEmp.json();
        const listaEmp = Array.isArray(d) ? d : d?.data || [];
        const map: Record<number, EmpresaItem> = {};
        for (const e of listaEmp as EmpresaItem[]) {
          if (e?.id !== undefined) map[e.id] = e;
        }
        setEmpresasById(map);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "No registrada";
    const d = new Date(fecha);
    return Number.isNaN(d.getTime()) ? fecha : d.toLocaleDateString("es-CL");
  };

  const formatCLP = (monto?: number) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(monto || 0);

  const obtenerEmpresa = (id: number) => {
    const e = empresasById[id];
    return e?.razon_social || e?.razonSocial || e?.nombre || `Empresa #${id}`;
  };

  const filtrados =
    filtroEstado === "Todos"
      ? cobros
      : cobros.filter((c) => (c.estadoCobro || "Pendiente") === filtroEstado);

  return (
    <>
      <Box style={{ flexFlow: "row wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Title>Cuentas por Cobrar (Condiciones y Plazos de Cobro B2B)</Title>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Selector
            title=""
            firstOption="Todos"
            data={filtroEstado}
            options={["Todos", "Pendiente", "Cobrado", "Vencido"]}
            setData={setFiltroEstado}
          />
          <Btn onClick={cargar}>Actualizar</Btn>
        </div>
      </Box>

      <Box>
        {loading && <p>Cargando...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <div className={css.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>Negocio</th>
                  <th>Empresa</th>
                  <th>Monto</th>
                  <th>Plazo</th>
                  <th>Recepción OC</th>
                  <th>Estimado cobro</th>
                  <th>Estado</th>
                  <th>Vencida</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No hay cuentas por cobrar registradas.</td>
                  </tr>
                ) : (
                  filtrados.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>{obtenerEmpresa(c.empresaID)}</td>
                      <td>{formatCLP(c.montoTotal)}</td>
                      <td>
                        {c.condicionCobro === "Contado"
                          ? "Contado"
                          : c.plazoCobroDias != null
                          ? `${c.plazoCobroDias} días`
                          : c.condicionCobro || "-"}
                      </td>
                      <td>{formatFecha(c.fechaRecepcionOC)}</td>
                      <td>{formatFecha(c.fechaEstimadaCobro)}</td>
                      <td>{c.estadoCobro || "Pendiente"}</td>
                      <td>{c.vencida ? "Sí" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </>
  );
}

export default CuentasPorCobrar;
