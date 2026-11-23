import { useEffect, useState } from "react";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import { Title } from "../../Components/Title/Title";
import { InputText } from "../../Components/InputText/InputText";
import { Selector } from "../../Components/Selector/Selector";
import useIsLogin from "../../Hooks/useIsLogin";
import css from "./Admin.module.css";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

interface RolItem {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
}

interface UsuarioItem {
  id: number;
  nombre: string;
  correo: string;
  rolID?: number;
  rol?: RolItem | null;
  activo?: boolean;
}

export function Admin() {
  const status = useIsLogin();
  const [tab, setTab] = useState<"usuarios" | "roles">("usuarios");

  // Roles
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [rolForm, setRolForm] = useState({ nombre: "", descripcion: "" });
  const [editingRol, setEditingRol] = useState<RolItem | null>(null);

  // Usuarios
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [userForm, setUserForm] = useState({
    nombre: "",
    correo: "",
    contraseña: "",
    rolID: 0,
  });
  const [editingUser, setEditingUser] = useState<UsuarioItem | null>(null);

  const cargarRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles`, { credentials: "include" });
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setRoles([]);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/user`, { credentials: "include" });
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setUsuarios([]);
    }
  };

  useEffect(() => {
    if (status === "authorized") {
      cargarRoles();
      cargarUsuarios();
    }
  }, [status]);

  // ---- Roles handlers ----
  const submitRol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolForm.nombre.trim()) {
      alert("El nombre del rol es obligatorio");
      return;
    }
    try {
      const url = editingRol
        ? `${API_URL}/roles/${editingRol.id}`
        : `${API_URL}/roles`;
      const method = editingRol ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(rolForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Error al guardar el rol");
        return;
      }
      setRolForm({ nombre: "", descripcion: "" });
      setEditingRol(null);
      cargarRoles();
    } catch {
      alert("Error al guardar el rol");
    }
  };

  const editarRol = (rol: RolItem) => {
    setEditingRol(rol);
    setRolForm({ nombre: rol.nombre, descripcion: rol.descripcion || "" });
  };

  const eliminarRol = async (id: number) => {
    if (!confirm("¿Eliminar este rol?")) return;
    try {
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "No se pudo eliminar");
        return;
      }
      cargarRoles();
    } catch {
      alert("Error al eliminar");
    }
  };

  // ---- Usuarios handlers ----
  const submitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.nombre.trim() || !userForm.correo.trim()) {
      alert("Nombre y correo son obligatorios");
      return;
    }
    if (!editingUser && !userForm.contraseña.trim()) {
      alert("La contraseña es obligatoria");
      return;
    }
    try {
      const payload: any = {
        nombre: userForm.nombre,
        correo: userForm.correo,
        rolID: userForm.rolID || undefined,
      };
      if (userForm.contraseña.trim()) payload.contraseña = userForm.contraseña;

      const url = editingUser
        ? `${API_URL}/user/${editingUser.id}`
        : `${API_URL}/user`;
      const method = editingUser ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Error al guardar el usuario");
        return;
      }
      setUserForm({ nombre: "", correo: "", contraseña: "", rolID: 0 });
      setEditingUser(null);
      cargarUsuarios();
    } catch {
      alert("Error al guardar el usuario");
    }
  };

  const editarUser = (u: UsuarioItem) => {
    setEditingUser(u);
    setUserForm({
      nombre: u.nombre,
      correo: u.correo,
      contraseña: "",
      rolID: u.rolID || u.rol?.id || 0,
    });
  };

  const eliminarUser = async (id: number) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await fetch(`${API_URL}/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "No se pudo eliminar");
        return;
      }
      cargarUsuarios();
    } catch {
      alert("Error al eliminar");
    }
  };

  if (status === "checking") return <div>Cargando...</div>;
  if (status !== "authorized") return null;

  return (
    <Frame>
      <Box>
        <Title>Panel de administración</Title>
        <div className={css.tabs}>
          <button
            className={tab === "usuarios" ? css.tabActive : css.tab}
            onClick={() => setTab("usuarios")}
          >
            Usuarios
          </button>
          <button
            className={tab === "roles" ? css.tabActive : css.tab}
            onClick={() => setTab("roles")}
          >
            Roles
          </button>
        </div>
      </Box>

      {tab === "usuarios" && (
        <>
          <Box>
            <Title>{editingUser ? "Editar usuario" : "Crear usuario"}</Title>
            <form
              onSubmit={submitUser}
              style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}
            >
              <InputText
                label=""
                placeholder="Nombre *"
                value={userForm.nombre}
                onChange={(text) => setUserForm({ ...userForm, nombre: text })}
              />
              <InputText
                label=""
                placeholder="Correo *"
                type="email"
                value={userForm.correo}
                onChange={(text) => setUserForm({ ...userForm, correo: text })}
              />
              <InputText
                label=""
                placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña *"}
                type="password"
                value={userForm.contraseña}
                onChange={(text) => setUserForm({ ...userForm, contraseña: text })}
              />
              <Selector
                title="Rol"
                firstOption="Seleccionar rol"
                data={roles.find((r) => r.id === userForm.rolID)?.nombre || ""}
                options={roles.map((r) => r.nombre)}
                setData={(name) => {
                  const r = roles.find((x) => x.nombre === name);
                  setUserForm({ ...userForm, rolID: r ? r.id : 0 });
                }}
              />
              <Btn onClick={() => {}}>{editingUser ? "Actualizar" : "Crear"}</Btn>
              {editingUser && (
                <Btn
                  warning
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({ nombre: "", correo: "", contraseña: "", rolID: 0 });
                  }}
                >
                  Cancelar
                </Btn>
              )}
            </form>
          </Box>
          <Box>
            <Title>Listado de usuarios</Title>
            {usuarios.length === 0 ? (
              <p>No hay usuarios.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.nombre}</td>
                      <td>{u.correo}</td>
                      <td>{u.rol?.nombre || u.rolID || "-"}</td>
                      <td style={{ display: "flex", gap: "0.5rem" }}>
                        <Btn onClick={() => editarUser(u)}>Editar</Btn>
                        <Btn warning onClick={() => eliminarUser(u.id)}>
                          Eliminar
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        </>
      )}

      {tab === "roles" && (
        <>
          <Box>
            <Title>{editingRol ? "Editar rol" : "Crear rol"}</Title>
            <form
              onSubmit={submitRol}
              style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}
            >
              <InputText
                label=""
                placeholder="Nombre *"
                value={rolForm.nombre}
                onChange={(text) => setRolForm({ ...rolForm, nombre: text })}
              />
              <InputText
                label=""
                placeholder="Descripción"
                value={rolForm.descripcion}
                onChange={(text) => setRolForm({ ...rolForm, descripcion: text })}
              />
              <Btn onClick={() => {}}>{editingRol ? "Actualizar" : "Crear"}</Btn>
              {editingRol && (
                <Btn
                  warning
                  onClick={() => {
                    setEditingRol(null);
                    setRolForm({ nombre: "", descripcion: "" });
                  }}
                >
                  Cancelar
                </Btn>
              )}
            </form>
          </Box>
          <Box>
            <Title>Listado de roles</Title>
            {roles.length === 0 ? (
              <p>No hay roles.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.nombre}</td>
                      <td>{r.descripcion || "-"}</td>
                      <td style={{ display: "flex", gap: "0.5rem" }}>
                        <Btn onClick={() => editarRol(r)}>Editar</Btn>
                        <Btn warning onClick={() => eliminarRol(r.id)}>
                          Eliminar
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        </>
      )}
    </Frame>
  );
}

export default Admin;