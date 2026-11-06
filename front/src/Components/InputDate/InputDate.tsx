import css from "./InputDate.module.css";

interface InputDateProps {
  label: string;
  value: Date;
  disabled?: boolean;
  onChange: (date: Date) => void;
}

export function InputDate({
  label,
  value,
  disabled = false,
  onChange,
}: InputDateProps) {
  const dateToString = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const newDate = new Date(val + "T00:00:00");
    onChange(newDate);
  };

  return (
    <div className={css.main}>
      {label !== "" && <p className={css.label}>{label}</p>}
      <input
        type="date"
        disabled={disabled}
        className={css.input}
        value={dateToString(value)}
        onChange={handleChange}
      />
    </div>
  );
}
