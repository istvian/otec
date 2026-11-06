import { Box } from "../../Components/Box/Box";
import { Frame } from "../../Components/Frame/Frame";
import { Spinner } from "../../Components/Spinner/Spinner";
import { Title } from "../../Components/Title/Title";
import useIsLogin from "../../Hooks/useIsLogin";
import css from "./Main.module.css";

export function Main() {
  const status = useIsLogin();
  if (status === "checking") return <Spinner />;
  if (status !== "authorized") return;
  return (
    <Frame>
      <Box>
        <Title>Dashboard</Title>
      </Box>
    </Frame>
  );
}
