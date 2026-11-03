import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { sequelize } from "./models/index";
import setupDB from "./db/setupDB.ts";
dotenv.config();

const port = process.env.PORT;

import indexRouter from "./routes/index.ts";
import userRouter from "./routes/user.ts";

var app = express();
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "public")));

console.log("Sincronizando DB");
sequelize.sync({ logging: false });
setupDB.LoadRoles();

app.use("/", indexRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log("Escuchando en el puerto " + port);
});

export default app;
