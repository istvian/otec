import sequelize from "../config/database";
import Rol from "./Rol";
import Curso from "./Curso";
import Usuario from "./Usuario";
import Contacto from "./Contacto";
import Empresa from "./Empresa";

// RELACIONES

Rol.hasMany(Usuario, {
  foreignKey: "rolID",
  as: "usuarios",
});

Usuario.belongsTo(Rol, {
  foreignKey: "id",
  as: "rol",
});

Empresa.hasMany(Contacto, {
  foreignKey: "empresaID",
  as: "contactos",
});

Contacto.belongsTo(Empresa, {
  foreignKey: "empresaID",
  as: "empresa",
});

export { sequelize, Usuario, Rol, Curso, Contacto, Empresa };
