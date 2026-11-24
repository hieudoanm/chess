import type { FC } from 'react';

interface BatchAddFormProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export const BatchAddForm: FC<BatchAddFormProps> = ({
  value,
  onChange,
  onAdd,
  onClose,
}) => (
  <div className="border-base-content/10 bg-base-200 rounded-xl border p-3">
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="One name per line"
      className="textarea textarea-bordered w-full"
      rows={4}
    />
    <div className="mt-2 flex justify-end gap-2">
      <button onClick={onClose} className="btn btn-ghost btn-sm">
        Cancel
      </button>
      <button
        onClick={onAdd}
        className="btn btn-primary btn-sm"
        disabled={!value.trim()}>
        Add All
      </button>
    </div>
  </div>
);
