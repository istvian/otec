import type { ReactNode } from "react";
import css from "./Title.module.css";

interface TitleProps {
  children?: ReactNode;
  style?: React.CSSProperties;
}
export function Title({ children, style }: TitleProps) {
  return (
    <h1 style={style} className={css.title}>
      {children}
    </h1>
  );
}
