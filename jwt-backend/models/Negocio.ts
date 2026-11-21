import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface NegocioType {
  id?: number;
  empresaID: number;
  contactoID: number;
  vendedorID: number;
  estado: boolean;
  montoTotal: number;
  fechaCreacion: Date;
  fechaCierre: Date;
}

const Negocio = sequelize.define("Negocio", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  montoTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fechaCierre: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  empresaID: {
    type: DataTypes.INTEGER,
  },
  contactoID: {
    type: DataTypes.INTEGER,
  },
  vendedorID: {
    type: DataTypes.INTEGER,
  },
});

export default Negocio;
