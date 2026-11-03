import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { LoginPage } from "./Pages/Login/LoginPage";
import { RegisterPage } from "./Pages/Register/RegisterPage";
import { Main } from "./Pages/Main/Main";
import { NotFound } from "./Pages/NotFound/NotFound";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<Main />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<NotFound />} path="/*" />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
