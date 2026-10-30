import type { ReactNode } from "react";
import css from "./Frame.module.css";

interface FrameProps {
  children?: ReactNode;
  style?: React.CSSProperties;
}

export function Frame({ children, style }: FrameProps) {
  return (
    <div className={css.main} style={style}>
      {children}
    </div>
  );
}
