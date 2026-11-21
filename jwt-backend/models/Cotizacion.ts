import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface CotizacionType {
  id?: number;
  negocioID?: number;
  cursoComercialID?: number;
  temarioCustom: string;
  cantidadAlumnos: number;
}

const Cotizacion = sequelize.define("Cotizacion", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  temarioCustom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cantidadAlumnos: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  negocioID: {
    type: DataTypes.INTEGER,
  },
  cursoComercialID: {
    type: DataTypes.INTEGER,
  },
});

export default Cotizacion;
