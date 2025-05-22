import { useState } from 'react';
import { Dialog } from './Dialog';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number) => void;
  currency: string;
}

export const AddItemDialog = ({ isOpen, onClose, onAdd, currency }: AddItemDialogProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numericPrice = parseFloat(price);
    if (trimmedName && !isNaN(numericPrice) && numericPrice > 0) {
      onAdd(trimmedName, numericPrice);
      setName('');
      setPrice('');
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            type="text"
            id="itemName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 input-field"
            placeholder="Enter item name"
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">
            Price ({currency})
          </label>
          <input
            type="number"
            id="itemPrice"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 input-field"
            placeholder={`Enter price in ${currency}`}
            step="0.01"
            min="0"
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
            disabled={!name.trim() || !price || isNaN(parseFloat(price)) || parseFloat(price) <= 0}
            className="btn-primary"
          >
            Add Item
          </button>
        </div>
      </form>
    </Dialog>
  );
};