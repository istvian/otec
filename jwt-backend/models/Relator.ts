import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface RelatorType {
  id?: number;
  nombre: string;
  correo?: string | null;
  telefono?: string | null;
  rut?: string | null;
  especialidad?: string | null;
  activo?: boolean;
  deleted?: boolean;
}

const Relator = sequelize.define("Relator", {
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
  correo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rut: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export default Relator;
