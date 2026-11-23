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
  estadoOperacion?: string;
  fechaCoordinacion?: Date | null;
  fechaEjecucion?: Date | null;
  condicionCobro?: string | null;
  plazoCobroDias?: number | null;
  fechaRecepcionOC?: Date | null;
  fechaEstimadaCobro?: Date | null;
  estadoCobro?: string | null;
  observacionesCobro?: string | null;
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
    estadoOperacion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pendiente",
    },
    fechaCoordinacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fechaEjecucion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    condicionCobro: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plazoCobroDias: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fechaRecepcionOC: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fechaEstimadaCobro: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estadoCobro: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pendiente",
    },
    observacionesCobro: {
      type: DataTypes.TEXT,
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