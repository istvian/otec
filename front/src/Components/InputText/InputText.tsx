import css from "./InputText.module.css";

interface InputTextProps {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  disabled?: boolean;
  isArea?: boolean;
  onChange: (text: string) => void;
}

export function InputText({
  label,
  placeholder,
  type = "text",
  value,
  disabled = false,
  onChange,
  isArea = false,
}: InputTextProps) {
  if (isArea) {
    return (
      <div className={css.main}>
        <p className={css.label}>{label}</p>
        <textarea
          disabled={disabled}
          className={css.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  } else {
    return (
      <div className={css.main}>
        {label != "" ? <p className={css.label}>{label}</p> : ""}
        <input
          type={type}
          disabled={disabled}
          className={css.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
}
