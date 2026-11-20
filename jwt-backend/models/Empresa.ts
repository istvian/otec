import { DataTypes } from "sequelize";
import sequelize from "../config/database";
import { ContactoType } from "./Contacto";

export interface EmpresaType {
  rut: string;
  razon: string;
  direccion: string;
  contactos: ContactoType[];
}

const Empresa = sequelize.define("Empresa", {
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
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export default Empresa;
