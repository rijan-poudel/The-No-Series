export function ChoiceField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string | number;
  options: readonly (readonly [string | number, string])[];
}) {
  return (
    <fieldset className="choice-field">
      <legend>{label}</legend>
      <div className="choice-options">
        {options.map(([key, text]) => (
          <label key={key}>
            <input
              className="visually-hidden"
              type="radio"
              name={name}
              value={key}
              defaultChecked={key === value}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
