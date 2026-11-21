import { DataTypes } from "sequelize";
import sequelize from "../config/database";

export interface CursoComercialType {
  id?: number;
  nombre: string;
  objetivos: string;
  temario: string;
  cursoID?: number;
}

const CursoComercial = sequelize.define("CursoComercial", {
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
  objetivos: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  temario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cursoID: {
    type: DataTypes.INTEGER,
  },
});

export default CursoComercial;
