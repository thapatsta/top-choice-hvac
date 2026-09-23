export function ChoiceCard({
  name,
  value,
  label,
  description,
  checked,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex min-h-[64px] cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors ${
        checked
          ? "border-ember bg-ember-light"
          : "border-border bg-card hover:border-ember/50"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="h-5 w-5 accent-ember"
      />
      <span>
        <span className="block font-display font-bold text-navy">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
    </label>
  );
}
