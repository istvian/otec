import type { ReactNode } from "react";
import css from "./Btn.module.css";

interface BtnProps {
  children: ReactNode;
  onClick: VoidFunction;
  disabled?: boolean;
  warning?: boolean;
}

export function Btn({
  children,
  onClick,
  disabled = false,
  warning = false,
}: BtnProps) {
  return (
    <button
      className={warning ? css.warning : css.btn}
      disabled={disabled}
      onClick={() => {
        onClick();
      }}
    >
      {children}
    </button>
  );
}
