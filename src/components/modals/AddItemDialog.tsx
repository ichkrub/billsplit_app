import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number) => void;
  currency: string;
  editItem?: { index: number; item: { name: string; price: number } } | null;
}

export const AddItemDialog = ({ isOpen, onClose, onAdd, currency, editItem }: AddItemDialogProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // Initialize form when editing an item
  useEffect(() => {
    if (editItem) {
      setName(editItem.item.name);
      setPrice(editItem.item.price.toString());
    } else {
      setName('');
      setPrice('');
    }
  }, [editItem]);

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
    <Dialog isOpen={isOpen} onClose={onClose} title={editItem ? 'Edit Item' : 'Add Item'}>
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
            {editItem ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};