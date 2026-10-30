import { useState } from "react";
import { Frame } from "../../Components/Frame/Frame";
import { InputText } from "../../Components/InputText/InputText";
import css from "./RegisterPage.module.css";
import { Btn } from "../../Components/Btn/Btn";
import { Box } from "../../Components/Box/Box";
import { Title } from "../../Components/Title/Title";
import type { RegisterData } from "../../types/general";
import { Login, Register } from "../../Helpers/APIConnector";
import { Link } from "react-router-dom";

export function RegisterPage() {
  const [registerData, setRegisterData] = useState<RegisterData>({
    contraseña: "",
    correo: "",
    nombre: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  async function HandleSubmit() {
    await Register(registerData, (res) => {
      if (res.error) {
        setErrorMsg(res.message);
      } else {
        alert("¡Usuario registrado correctamente!");
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
        <Title>Registro</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            HandleSubmit();
          }}
        ></form>
        <InputText
          label="Nombre"
          type="text"
          onChange={(text) => {
            setRegisterData((prev) => ({
              ...prev,
              nombre: text,
            }));
          }}
          placeholder="Juan Perez"
          value={registerData?.nombre}
        />
        <InputText
          label="Correo"
          type="email"
          onChange={(text) => {
            setRegisterData((prev) => ({
              ...prev,
              correo: text.toLowerCase().trim(),
            }));
          }}
          placeholder="correo@otec.cl"
          value={registerData?.correo}
        />
        <InputText
          label="Contraseña"
          type="password"
          onChange={(text) => {
            setRegisterData((prev) => ({
              ...prev,
              contraseña: text.trim(),
            }));
          }}
          placeholder="Mínimo 8 carácteres, 1 mayuscula, 1 minuscula y 1 número"
          value={registerData?.contraseña}
        />
        {errorMsg != "" ? <p className={css.msg}>{errorMsg}</p> : ""}
        <Btn
          onClick={() => {
            HandleSubmit();
          }}
          disabled={
            registerData.nombre != "" &&
            registerData.contraseña != "" &&
            registerData.correo != ""
              ? false
              : true
          }
        >
          Registrar
        </Btn>
        <Link className={css.link} to={"/login"}>
          O quizás quieras iniciar sesión
        </Link>
      </Box>
    </Frame>
  );
}
