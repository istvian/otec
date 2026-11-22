// backend/models/negocio.ts
import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export type EstadoNegocio = "Abierto" | "Ganado" | "Perdido/Vencido";

export interface NegocioType {
  id?: number;
  empresaID: number;
  contactoID?: number | null;
  vendedorID: number;
  cursoID?: number | null;
  estado: EstadoNegocio | string;
  montoTotal: number;
  fechaCreacion?: Date;
  fechaCierre: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const Negocio = sequelize.define(
  "Negocio",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Abierto",
    },
    montoTotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fechaCierre: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    empresaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contactoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vendedorID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cursoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Negocios",
    timestamps: false,
  }
);

export default Negocio;