import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export type TipoAdjunto = "OC" | "Nomina" | "orden_compra" | "nomina";

export interface AdjuntoType {
  id?: number;
  negocioID?: number | null;
  cursoID?: number | null;
  tipo: string;
  nombreArchivo: string;
  ruta: string;
  mimeType?: string | null;
  size?: number | null;
  descripcion?: string | null;
  usuarioID?: number | null;
  relatorID?: number | null;
  modalidad?: string | null;
  honorarios?: number | null;
  deleted?: boolean;
}

const Adjunto = sequelize.define("Adjunto", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  negocioID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cursoID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "OC",
  },
  nombreArchivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ruta: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  usuarioID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  relatorID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  modalidad: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  honorarios: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

export default Adjunto;