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


// User.hasMany(Post);
// Post.belongsTo(User);

// Post.hasMany(Upvotes);
// Post.hasMany(Downvotes);

// Upvotes.belongsTo(User);
// Downvotes.belongsTo(User);

// Upvotes.belongsTo(Post);
// Downvotes.belongsTo(Post);

export { sequelize, Usuario, Rol };
