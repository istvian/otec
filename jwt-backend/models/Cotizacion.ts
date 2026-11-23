import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export type EstadoCotizacion =
  | "Borrador"
  | "Enviada"
  | "Aceptada"
  | "Rechazada";

export interface CotizacionType {
  id?: number;
  negocioID?: number | null;
  empresaID?: number | null;
  contactoID?: number | null;
  vendedorID?: number | null;
  cursoID?: number | null;
  cursoComercialID?: number | null;
  nombreCurso?: string;
  nombreCliente?: string;
  clienteRut?: string;
  clienteDireccion?: string;
  contactoNombre?: string;
  contactoCorreo?: string;
  contactoTelefono?: string;
  objetivosCustom?: string;
  temarioCustom: string;
  cantidadAlumnos: number;
  valorAlumno: number;
  descuento?: number;
  subtotal?: number;
  total: number;
  estado?: EstadoCotizacion | string;
  validezDias?: number;
  observaciones?: string;
  condiciones?: string;
  tokenPublico?: string;
  fechaEmision?: Date;
  deleted?: boolean;
  revalidada?: boolean;
  fechaRevalidacion?: Date | null;
  revalidaciones?: number;
  historialRevalidaciones?: string | null;
  tokensHistoricos?: string | null;
}

const Cotizacion = sequelize.define("Cotizacion", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  // Relaciones comerciales (opcionales: una cotización puede emitirse sin negocio)
  negocioID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  empresaID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  contactoID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  vendedorID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cursoID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cursoComercialID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Snapshot de los datos al momento de cotizar (la propuesta no cambia si
  // luego se edita la empresa, el curso o el temario comercial).
  nombreCurso: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  clienteRut: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  clienteDireccion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactoNombre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactoCorreo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactoTelefono: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  objetivosCustom: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Temario en texto plano: se renderiza respetando saltos de línea, sin HTML.
  temarioCustom: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cantidadAlumnos: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  valorAlumno: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  descuento: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Borrador",
  },
  validezDias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  condiciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tokenPublico: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  fechaEmision: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  revalidada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  fechaRevalidacion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  revalidaciones: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  historialRevalidaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tokensHistoricos: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export default Cotizacion;
