import { useEffect, useState } from "react";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Title } from "../../Components/Title/Title";
import { InputText } from "../../Components/InputText/InputText";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

interface RelatorItem {
  id: number;
  nombre: string;
  correo?: string | null;
  telefono?: string | null;
  rut?: string | null;
  especialidad?: string | null;
  activo?: boolean;
}

export function Relatores() {
  const [relatores, setRelatores] = useState<RelatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    rut: "",
    especialidad: "",
  });

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/relatores`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setRelatores(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setRelatores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/relatores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Error al crear relator");
        return;
      }
      setForm({ nombre: "", correo: "", telefono: "", rut: "", especialidad: "" });
      cargar();
    } catch {
      alert("Error al crear relator");
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este relator?")) return;
    try {
      const res = await fetch(`${API_URL}/relatores/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data?.message || "No se pudo eliminar");
        return;
      }
      cargar();
    } catch {
      alert("Error al eliminar");
    }
  };

  return (
    <>
      <Box style={{ flexFlow: "row wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Title>Relatores</Title>
      </Box>
      <Box>
        <Title>Crear relator</Title>
        <form onSubmit={crear} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <InputText label="" placeholder="Nombre *" value={form.nombre} onChange={(text) => setForm({ ...form, nombre: text })} />
          <InputText label="" placeholder="Correo" value={form.correo} onChange={(text) => setForm({ ...form, correo: text })} />
          <InputText label="" placeholder="Teléfono" value={form.telefono} onChange={(text) => setForm({ ...form, telefono: text })} />
          <InputText label="" placeholder="RUT" value={form.rut} onChange={(text) => setForm({ ...form, rut: text })} />
          <InputText label="" placeholder="Especialidad" value={form.especialidad} onChange={(text) => setForm({ ...form, especialidad: text })} />
          <Btn onClick={() => {}}>Crear</Btn>
        </form>
      </Box>
      <Box>
        <Title>Listado de relatores</Title>
        {loading ? (
          <p>Cargando...</p>
        ) : relatores.length === 0 ? (
          <p>No hay relatores.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>RUT</th>
                <th>Especialidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {relatores.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.nombre}</td>
                  <td>{r.correo || "-"}</td>
                  <td>{r.telefono || "-"}</td>
                  <td>{r.rut || "-"}</td>
                  <td>{r.especialidad || "-"}</td>
                  <td>
                    <Btn warning onClick={() => eliminar(r.id)}>Eliminar</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </>
  );
}

export default Relatores;
