import { useState, useEffect } from 'react';
import { Dialog } from './Dialog';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number, assigned: string[]) => void;
  currency: string;
  editItem?: { index: number; item: { name: string; price: number; assigned: string[] } } | null;
  people: { name: string }[];
}

export const AddItemDialog = ({ isOpen, onClose, onAdd, currency, editItem, people }: AddItemDialogProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [assigned, setAssigned] = useState<string[]>([]);

  // Initialize form when editing an item
  useEffect(() => {
    if (editItem) {
      setName(editItem.item.name);
      setPrice(editItem.item.price.toString());
      setAssigned(editItem.item.assigned);
    } else {
      setName('');
      setPrice('');
      setAssigned([]);
    }
  }, [editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numericPrice = parseFloat(price);
    if (trimmedName && !isNaN(numericPrice) && numericPrice > 0) {
      onAdd(trimmedName, numericPrice, assigned);
      setName('');
      setPrice('');
      setAssigned([]);
      onClose();
    }
  };

  const toggleAssignment = (personName: string) => {
    setAssigned(prev => {
      const isAssigned = prev.includes(personName);
      if (isAssigned) {
        return prev.filter(name => name !== personName);
      } else {
        return [...prev, personName];
      }
    });
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

        {people.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to
            </label>
            <div className="grid grid-cols-2 gap-2">
              {people.map((person, index) => {
                const isPersonAssigned = assigned.includes(person.name);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleAssignment(person.name)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      isPersonAssigned
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isPersonAssigned ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {isPersonAssigned && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{person.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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