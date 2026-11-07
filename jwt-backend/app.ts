import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { sequelize } from "./models/index";
import setupDB from "./db/setupDB.ts";
import { rateLimit } from "express-rate-limit";
dotenv.config();

const port = process.env.PORT;

import indexRouter from "./routes/index.ts";
import userRouter from "./routes/user.ts";
import cursoRouter from "./routes/curso.ts";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

var app = express();
app.use(limiter);
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
sequelize.sync({ logging: false }).then(() => {
  setupDB.LoadRoles();
});

app.use("/", indexRouter);
app.use("/api/user", userRouter);
app.use("/api/curso", cursoRouter);

app.listen(port, () => {
  console.log("Escuchando en el puerto " + port);
});

export default app;
