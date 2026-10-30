import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rolID: {
    type: DataTypes.INTEGER,
  },
});

export default Usuario;
