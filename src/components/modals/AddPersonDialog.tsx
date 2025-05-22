import { useState } from 'react';
import { Dialog } from './Dialog';

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export const AddPersonDialog = ({ isOpen, onClose, onAdd }: AddPersonDialogProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const names = name.split(',').map(n => n.trim()).filter(n => n.length > 0);
      names.forEach(n => onAdd(n));
      setName('');
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Person">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="personName" className="block text-sm font-medium text-gray-700">
            Person's Name
            <span className="text-sm font-normal text-gray-500 ml-1">
              (separate multiple names with commas)
            </span>
          </label>
          <input
            type="text"
            id="personName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 input-field"
            placeholder="e.g. John, Jane, Steve"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-primary"
          >
            Add Person
          </button>
        </div>
      </form>
    </Dialog>
  );
};