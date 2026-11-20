import type { ReactNode } from "react";
import css from "./CellBtn.module.css";

interface BtnProps {
  children: ReactNode;
  onClick: VoidFunction;
  disabled?: boolean;
  warning?: boolean;
}

export function CellBtn({ children, onClick }: BtnProps) {
  return (
    <td
      className={css.btn}
      onClick={() => {
        onClick();
      }}
    >
      {children}
    </td>
  );
}
