import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { LoginPage } from "./Pages/Login/LoginPage";
import { RegisterPage } from "./Pages/Register/RegisterPage";
import { Main } from "./Pages/Main/Main";
import { NotFound } from "./Pages/NotFound/NotFound";
import { Nav } from "./Components/Nav/Nav";
import { Catalogo } from "./Pages/Catalogo/Catalogo";
import {Negocios} from "./Pages/Negocios/Negocios";
import {Respaldos} from "./Pages/Respaldos/Respaldos";
import {Relatores} from "./Pages/Relatores/Relatores";
import { CuentasPorCobrar } from "./Pages/CuentasPorCobrar/CuentasPorCobrar";
import { Empresas } from "./Pages/Empresas/Empresas";
import { CrearEmpresa } from "./Pages/Empresas/CrearEmpresa/CrearEmpresa";
import { CrearCurso } from "./Pages/Catalogo/CrearCurso/CrearCurso";
import { CorreosPorEmpresa } from "./Pages/Empresas/CorreosPorEmpresa/CorreosPorEmpresa";
import { CrearNegocio } from "./Pages/Negocios/CrearNegocio/CrearNegocio";
import { Cotizaciones } from "./Pages/Cotizaciones/Cotizaciones";
import { CrearCotizacion } from "./Pages/Cotizaciones/CrearCotizacion";
import { VerCotizacionPublica } from "./Pages/Cotizaciones/VerCotizacionPublica";
import { Admin } from "./Pages/Admin/Admin";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route element={<Main />} path="/" />
          <Route element={<Catalogo />} path="/catalogo" />
          <Route element={<CrearCurso />} path="/catalogo/nuevo/:id" />
          <Route element={<Negocios />} path="/negocios" />
          <Route element={<Respaldos />} path="/respaldos" />
          <Route element={<Relatores />} path="/relatores" />
          <Route element={<CuentasPorCobrar />} path="/cobros" />
          <Route element={<CuentasPorCobrar />} path="/cuentas-por-cobrar" />
          <Route element={<CrearNegocio />} path="/negocios/crear" />
          <Route element={<Cotizaciones />} path="/cotizaciones" />
          <Route element={<CrearCotizacion />} path="/cotizaciones/crear" />
          <Route element={<CrearCotizacion />} path="/cotizaciones/editar/:id" />
          <Route
            element={<VerCotizacionPublica />}
            path="/cotizaciones/publica/:token"
          />
          <Route element={<Empresas />} path="/empresas" />
          <Route element={<Admin />} path="/admin" />
          <Route element={<Admin />} path="/usuarios" />
          <Route element={<Admin />} path="/roles" />
          <Route element={<Admin />} path="/panel-admin" />
          <Route element={<CorreosPorEmpresa />} path="/empresas/correos/:id" />
          <Route element={<CrearEmpresa />} path="/empresas/crear/:id?" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<NotFound />} path="/*" />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
