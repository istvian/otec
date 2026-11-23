import { useEffect, useState } from "react";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Title } from "../../Components/Title/Title";
import { InputText } from "../../Components/InputText/InputText";
import css from "../Negocios/Negocios.module.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

export function Respaldos() {
  const [adjuntos, setAdjuntos] = useState<any[]>([]);
  const [negocioID, setNegocioID] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const url = negocioID
        ? `${API_URL}/adjuntos?negocioID=${negocioID}`
        : `${API_URL}/adjuntos`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setAdjuntos(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setAdjuntos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const subir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("archivo", file);
    fd.append("file", file);
    if (negocioID) fd.append("negocioID", negocioID);
    fd.append("tipo", file.name.toLowerCase().endsWith(".pdf") ? "OC" : "Nomina");
    const res = await fetch(`${API_URL}/adjuntos`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d?.message || "Error al subir");
      return;
    }
    e.target.value = "";
    cargar();
  };

  return (
    <>
      <Box style={{ flexFlow: "row wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Title>Repositorio de Respaldos (OC y Nómina)</Title>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <InputText
            label=""
            placeholder="Negocio ID (opcional)"
            value={negocioID}
            onChange={(text) => setNegocioID(text)}
          />
          <Btn onClick={cargar}>Filtrar</Btn>
          <input type="file" onChange={subir} style={{ padding: "0.3rem" }} />
        </div>
      </Box>
      <Box>
        {loading ? (
          <p>Cargando...</p>
        ) : adjuntos.length === 0 ? (
          <p>No hay respaldos.</p>
        ) : (
          <div className={css.tableContainer}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Negocio</th>
                  <th>Archivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {adjuntos.map((a: any) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.tipo}</td>
                    <td>{a.negocioID ?? "-"}</td>
                    <td>{a.nombreArchivo}</td>
                    <td>
                      <Btn onClick={() => window.open(`${API_URL}/adjuntos/${a.id}/descargar`, "_blank")}>
                        Descargar
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </>
  );
}

export default Respaldos;