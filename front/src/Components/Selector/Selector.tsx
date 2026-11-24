import css from "./Selector.module.css";

interface SelectorProps {
  isDisabled?: boolean;
  setData?: (selected: string) => void;
  setValue?: (value: number) => void;
  options: string[];
  firstOption: string;
  data: string | number;
  title: string;
}

export function Selector({
  isDisabled = false,
  options,
  setData,
  setValue,
  data,
  firstOption = "",
  title = "",
}: SelectorProps) {
  return (
    <div className={css.main}>
      <p className={css.label}>{title}</p>
      <select
        className={css.select}
        disabled={isDisabled}
        value={data}
        onChange={(e) => {
          const numberValue = Number(e.target.value);
          if (setData) setData(e.target.value);
          if (setValue) setValue(numberValue);
        }}
      >
        <option value={0}>{firstOption}</option>
        {options.map((item, index) => {
          return (
            <option
              key={index}
              value={setData ? item : setValue ? index + 1 : ""}
            >
              {item}
            </option>
          );
        })}
      </select>
    </div>
  );
}
