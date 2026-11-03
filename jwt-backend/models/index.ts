import sequelize from "../config/database";
import Rol from "./Rol";
import Usuario from "./Usuario";

// RELACIONES

Rol.hasMany(Usuario, {
  foreignKey: "rolID",
  as: "usuarios",
});

Usuario.belongsTo(Rol, {
  foreignKey: "id",
  as: "rol",
});


export { sequelize, Usuario, Rol };
