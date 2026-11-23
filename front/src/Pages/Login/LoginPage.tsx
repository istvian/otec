import { useState } from "react";
import { Frame } from "../../Components/Frame/Frame";
import { InputText } from "../../Components/InputText/InputText";
import css from "./LoginPage.module.css";
import { Btn } from "../../Components/Btn/Btn";
import { Box } from "../../Components/Box/Box";
import { Title } from "../../Components/Title/Title";
import type { LoginData } from "../../types/general";
import { Login } from "../../Helpers/APIConnector";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
  const [loginData, setLoginData] = useState<LoginData>({
    contraseña: "",
    correo: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const nav = useNavigate();

  async function HandleSubmit() {
    await Login(loginData, (res) => {
      if (res.error) {
        setErrorMsg(res.message);
      } else {
        nav("/");
      }
    });
  }

  return (
    <Frame style={{ justifyContent: "center", alignItems: "center" }}>
      <Box style={{ maxWidth: "600px" }}>
        <img
          src="/favicon.webp"
          alt="Logo de empresa Keeplearning"
          className={css.logo}
        />
        <Title>Inicio de sesión</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            HandleSubmit();
          }}
          style={{width:"100%"}}
        >
          <InputText
            label="Correo"
            type="email"
            onChange={(text) => {
              setLoginData((prev) => ({
                ...prev,
                correo: text.toLowerCase().trim(),
              }));
            }}
            placeholder="correo@otec.cl"
            value={loginData?.correo}
          />
          <InputText
            label="Contraseña"
            type="password"
            onChange={(text) => {
              setLoginData((prev) => ({
                ...prev,
                contraseña: text.trim(),
              }));
            }}
            placeholder="Mínimo 8 carácteres, 1 mayuscula, 1 minuscula y 1 número"
            value={loginData?.contraseña}
          />
          {errorMsg != "" ? <p className={css.msg}>{errorMsg}</p> : ""}
          <Btn
            onClick={() => {
              HandleSubmit();
            }}
            disabled={
              loginData.contraseña != "" && loginData.correo != ""
                ? false
                : true
            }
          >
            Iniciar sesión
          </Btn>
        </form>
        <Link className={css.link} to={"/register"}>
          O quizás quieras crear una cuenta
        </Link>
      </Box>
    </Frame>
  );
}
