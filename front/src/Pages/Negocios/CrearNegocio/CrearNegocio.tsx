import { Box } from "../../../Components/Box/Box";
import { Btn } from "../../../Components/Btn/Btn";
import { Frame } from "../../../Components/Frame/Frame";
import { InputDate } from "../../../Components/InputDate/InputDate";
import { InputText } from "../../../Components/InputText/InputText";
import { Selector } from "../../../Components/Selector/Selector";
import { Title } from "../../../Components/Title/Title";
import css from "./CrearNegocio.module.css";

export function CrearNegocio() {
  return (
    <Frame>
      <Box>
        <Title>Crear negocio</Title>
        <p>Complete los datos</p>
        <div className={css.form}>
          <Selector
            title="Empresa"
            firstOption="Selecciona una empresa"
            data={""}
            options={[""]}
          />
          <Selector
            title="Vendedor"
            firstOption="Selecciona un vendedor"
            data={""}
            options={[""]}
          />
          <Selector
            title="Estado"
            firstOption="Selecciona un estado"
            data={""}
            options={[""]}
          />
          <InputText
            label="Monto total"
            type="number"
            onChange={(text) => {}}
            placeholder="Ingrese el monto total"
            value="0"
          />
          <InputDate
            label="Fecha de cierre"
            onChange={(e) => {}}
            value={new Date()}
          />
          <Btn onClick={() => {}}>Crear negocio</Btn>
        </div>
      </Box>
    </Frame>
  );
}
