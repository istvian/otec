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
import rolRouter from "./routes/rol.ts";
import cursoRouter from "./routes/curso.ts";
import empresaRouter from "./routes/empresa.ts";
import cursoComercialRouter from "./routes/cursoComercial.ts";
import negocioRouter from "./routes/negocioRoutes.ts";
import cotizacionRouter from "./routes/cotizacion.ts";
import adjuntoRouter from "./routes/adjunto.ts";
import relatorRouter from "./routes/relator.ts";
import cobroRouter from "./routes/cobroRoutes.ts";


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
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
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

console.log("Sincronizando DB");
sequelize.sync({ logging: false }).then(async () => {
  await setupDB.EnsureCotizacionSchema();
  await setupDB.EnsureNegocioSchema();
  await setupDB.EnsureAdjuntoSchema();
  await setupDB.EnsureRelatorSchema();
  await setupDB.EnsureUsuarioSchema();
  await setupDB.EnsureRolSchema();
  setupDB.LoadRoles();
});

app.use("/", indexRouter);
app.use("/api/user", userRouter);
app.use("/api/users", userRouter);
app.use("/api/usuarios", userRouter);
app.use("/api/admin/users", userRouter);
app.use("/api/admin/usuarios", userRouter);
app.use("/api/rol", rolRouter);
app.use("/api/roles", rolRouter);
app.use("/api/rols", rolRouter);
app.use("/api/admin/roles", rolRouter);
app.use("/api/admin/rols", rolRouter);
app.use("/api/curso", cursoRouter);
app.use("/api/empresa", empresaRouter);
app.use("/api/comercial", cursoComercialRouter);
app.use("/api/negocios", negocioRouter);
app.use("/api/cotizaciones", cotizacionRouter);
app.use("/api/adjuntos", adjuntoRouter);
app.use("/api/respaldos", adjuntoRouter);
app.use("/api/attachments", adjuntoRouter);
app.use("/api/operaciones/adjuntos", adjuntoRouter);
app.use("/api/contratos", adjuntoRouter);
app.use("/api/relatores", relatorRouter);
app.use("/api/relators", relatorRouter);

// HU-09: Condiciones y Plazos de Cobro B2B
app.use("/api/cobros", cobroRouter);
app.use("/api/cuentas-por-cobrar", cobroRouter);
app.use("/api/condiciones-cobro", cobroRouter);
app.use("/api/plazos-cobro", cobroRouter);
app.use("/api/cobro", cobroRouter);

app.listen(port, () => {
  console.log("Escuchando en el puerto " + port);
});

export default app;
