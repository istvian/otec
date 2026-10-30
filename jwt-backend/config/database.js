import { Sequelize } from "sequelize";
import path from "path";

let db = path.join(process.cwd(), "db", "database.db");
const sequelize = new Sequelize({ dialect: "sqlite", storage: db });

export default sequelize;
