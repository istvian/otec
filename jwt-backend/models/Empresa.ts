import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface Empresa {
  rut: string;
  razon: string;
  contactos: Contacto[];
}
export interface Contacto {
  nombre: string;
  telefono: string;
  correo: string;
}

const Curso = sequelize.define("Curso", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  rut: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  razon: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactos: {
    type: DataTypes.ARRAY,
    allowNull: false,
  },
});

export default Curso;
