import { Rol } from "../models";

async function LoadRoles() {
  try {
    const roles = await Rol.findAll();
    if (roles.length === 0) {
      console.log("Creando roles");
      Rol.create({ nombre: "nuevo", descripcion: "" });
      Rol.create({ nombre: "vendedor", descripcion: "" });
      Rol.create({ nombre: "operador", descripcion: "" });
      Rol.create({ nombre: "legal", descripcion: "" });
      Rol.create({ nombre: "administrador", descripcion: "" });
    }
  } catch (e) {
    console.error(e);
  }
}

export default { LoadRoles };
