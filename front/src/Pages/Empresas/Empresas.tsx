import { useNavigate } from "react-router-dom";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Frame } from "../../Components/Frame/Frame";
import { Title } from "../../Components/Title/Title";
import css from "./Empresas.module.css";

export function Empresas() {
  const nav = useNavigate();
  return (
    <Frame>
      <Box>
        <Title>Empresas</Title>
      </Box>
      <Box>
        <div className={css.row}>
          <Title>Listado de empresas</Title>
          <Btn
            onClick={() => {
              nav("/empresas/crear");
            }}
          >
            Crear empresa
          </Btn>
        </div>
        <div className={css.container}></div>
      </Box>
    </Frame>
  );
}
