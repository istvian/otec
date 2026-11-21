import { useState } from "react";
import { Box } from "../../Components/Box/Box";
import { Btn } from "../../Components/Btn/Btn";
import { Title } from "../../Components/Title/Title";
import css from "./Negocios.module.css";
import { useNavigate } from "react-router-dom";

export function Negocios() {
  const [showCotizaciones, setShowCotizaciones] = useState(false);
  const nav = useNavigate();
  return (
    <>
      <Box
        style={{
          flexFlow: "row wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title>Negocios y cotizaciones</Title>
        <div className={css.actions}>
          <Btn
            onClick={() => {
              nav("/negocios/crear");
            }}
          >
            Crear negocio
          </Btn>
        </div>
      </Box>
      <Box>
        <Title>Negocios</Title>
        <div className={css.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Curso asociado</th>
                <th>Contacto</th>
                <th>Vendedor</th>
                <th>Estado</th>
                <th>Monto Total</th>
                <th>Fecha de creación</th>
                <th>Fecha de cierre</th>
                <th>-</th>
              </tr>
            </thead>
            <tbody>
              {[]?.map((item) => {
                return (
                  <tr key={item}>
                    <td></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
      {showCotizaciones ? (
        <Box>
          <Title>Cotizaciones</Title>
          <div className={css.tableContainer}></div>
        </Box>
      ) : (
        ""
      )}
    </>
  );
}
