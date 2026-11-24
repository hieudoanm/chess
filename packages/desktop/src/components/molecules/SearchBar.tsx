import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className="relative mb-4">
    <FiSearch className="text-base-content/50 absolute top-1/2 left-3 -translate-y-1/2" />
    <input
      type="text"
      placeholder="Search tournaments..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input input-bordered w-full pl-10"
    />
  </div>
);
