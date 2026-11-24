import type { FC } from 'react';

interface AddParticipantFormProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  disabled?: boolean;
}

export const AddParticipantForm: FC<AddParticipantFormProps> = ({
  value,
  onChange,
  onAdd,
  disabled,
}) => (
  <div className="border-base-content/10 bg-base-200 flex gap-2 rounded-xl border p-3">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Participant name"
      className="input input-bordered input-sm flex-1"
      onKeyDown={(e) => e.key === 'Enter' && onAdd()}
    />
    <button
      onClick={onAdd}
      className="btn btn-primary btn-sm"
      disabled={disabled}>
      Add
    </button>
  </div>
);
