import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface Curso {
  codigo: string;
  numeroSolicitud: string;
  nombre: string;
  modalidad: string;
  modo: string;
  tipo: string;
  nivel: string;
  horas: number;
  valorFranquicia: number;
  valorEfectivoParticipante: number;
  valorImputableParticipante: number;
  numeroResolucionAutorizacion: number;
  estado: string;
  numeroDeposito: number;
  ingreso: Date;
  evaluacion: Date;
  resolucion: Date;
  vigencia: Date;
  pago: Date;
  activo: boolean;
}

const Curso = sequelize.define("Curso", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  numeroSolicitud: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modalidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nivel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  horas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valorFranquicia: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  valorEfectivoParticipante: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  valorImputableParticipante: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  numeroResolucionAutorizacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numeroDeposito: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  evaluacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  resolucion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  vigencia: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  pago: {
    type: DataTypes.DATE,
    allowNull: false,
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

export default Curso;
