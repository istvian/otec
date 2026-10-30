import type { ReactNode } from "react";
import css from "./Box.module.css";

interface BoxProps {
  children?: ReactNode;
  style?: React.CSSProperties;
}

export function Box({ children, style }: BoxProps) {
  return (
    <div className={css.main} style={style}>
      {children}
    </div>
  );
}
