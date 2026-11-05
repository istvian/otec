import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { LoginPage } from "./Pages/Login/LoginPage";
import { RegisterPage } from "./Pages/Register/RegisterPage";
import { Main } from "./Pages/Main/Main";
import { NotFound } from "./Pages/NotFound/NotFound";
import { Nav } from "./Components/Nav/Nav";
import { Catalogo } from "./Pages/Catalogo/Catalogo";
import { Negocios } from "./Pages/Negocios/Negocios";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route element={<Main />} path="/" />
          <Route element={<Catalogo />} path="/catalogo" />
          <Route element={<Negocios />} path="/negocios" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<NotFound />} path="/*" />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
