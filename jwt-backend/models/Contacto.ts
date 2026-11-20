import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface ContactoType {
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
}

const Contacto = sequelize.define("Contacto", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  empresaID: {
    type: DataTypes.INTEGER,
  },
});

export default Contacto;
