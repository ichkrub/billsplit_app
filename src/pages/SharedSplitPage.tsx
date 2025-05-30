import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronDownIcon,
  UserGroupIcon,
  PencilSquareIcon,
  XMarkIcon,
  LockClosedIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { getAnonymousSplit, supabase } from '../utils/supabaseClient';
import type { AnonymousSplit } from '../utils/supabaseClient';
import { calculateSplit } from '../utils/splitLogic';

interface SplitSummary {
  subtotal: number;
  total: number;
  perPerson: Record<string, number>;
}

interface EditableItem {
  name: string;
  price: number;
  assigned: string[];
}

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

const SharedSplitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [split, setSplit] = useState<AnonymousSplit | null>(null);
  const [summary, setSummary] = useState<SplitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [editAllowed, setEditAllowed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editAssignments, setEditAssignments] = useState<EditableItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSplit = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnonymousSplit(id!);
        setSplit(data);
        // Check expiry
        const createdAt = new Date(data.created_at);
        if (Date.now() - createdAt.getTime() > FIVE_DAYS_MS) {
          setExpired(true);
        }
        // Check password
        if (data.password) {
          setShowPasswordPrompt(true);
        } else {
          setEditAllowed(true);
        }
        // Calculate summary
        const splitInput = {
          people: data.people,
          items: data.items,
          taxAmount: Number(data.tax_amount),
          serviceAmount: Number(data.service_amount),
          discount: Number(data.discount),
          // discountType removed as we only use amount now
          currency: data.currency,
          otherCharges: 0, // Not yet in DB, fallback to 0
          vendorName: data.vendor_name || '',
        };
        setSummary(calculateSplit(splitInput));
      } catch (err: any) {
        setError('Split not found or has been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchSplit();
  }, [id]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (split && split.password === passwordInput) {
      setEditAllowed(true);
      setShowPasswordPrompt(false);
    } else {
      alert('Incorrect password.');
    }
  };

  // Edit mode logic
  const startEdit = () => {
    if (!split) return;
    setEditAssignments(split.items.map(item => ({
      ...item,
      assigned: [...item.assigned],
    })));
    setEditMode(true);
  };

  const toggleAssignment = (itemIdx: number, personName: string) => {
    setEditAssignments(prev => prev.map((item, idx) => {
      if (idx !== itemIdx) return item;
      const assigned = item.assigned.includes(personName)
        ? item.assigned.filter((n: string) => n !== personName)
        : [...item.assigned, personName];
      return { ...item, assigned };
    }));
  };

  const saveAssignments = async () => {
    if (!split) return;
    setSaving(true);
    const { error: updateError } = await supabase
      .from('anonymous_splits')
      .update({ items: editAssignments })
      .eq('id', split.id);
    setSaving(false);
    if (updateError) {
      alert('Failed to save changes. Please try again.');
      return;
    }
    // Refresh split and summary
    setSplit({ ...split, items: editAssignments });
    const splitInput = {
      people: split.people,
      items: editAssignments,
      taxAmount: Number(split.tax_amount),
      serviceAmount: Number(split.service_amount),
      discount: Number(split.discount),          // discountType removed as we only use amount now
      currency: split.currency,
      otherCharges: 0,
      vendorName: split.vendor_name || '',
    };
    setSummary(calculateSplit(splitInput));
    setEditMode(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-gray-500">Loading split details...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg">
        {error}
      </div>
    </div>
  );

  if (expired) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-gray-500 bg-gray-50 px-4 py-3 rounded-lg">
        This split link has expired.
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 w-full">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Shared Bill Split
          </h1>
          {split?.vendor_name && (
            <div className="text-lg text-gray-600">
              <p>Bill from {split.vendor_name}</p>
              {split.bill_date && (
                <p className="text-sm mt-1">{new Date(split.bill_date).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </motion.div>

        {showPasswordPrompt ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-sm mx-auto"
          >
            <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-gray-600">
                <LockClosedIcon className="h-5 w-5" />
                <h2 className="font-medium">This split is password protected</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter password to view and edit:
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="input-field"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        ) : editMode ? (
          <EditModeView
            split={split!}
            editAssignments={editAssignments}
            toggleAssignment={toggleAssignment}
            onSave={saveAssignments}
            onCancel={() => setEditMode(false)}
            saving={saving}
          />
        ) : split && summary ? (
          <ViewModeContent
            split={split}
            summary={summary}
            editAllowed={editAllowed}
            onEditClick={startEdit}
          />
        ) : null}
      </div>
    </div>
  );
};

// Separate components for better organization
const ViewModeContent: React.FC<{
  split: AnonymousSplit;
  summary: SplitSummary;
  editAllowed: boolean;
  onEditClick: () => void;
}> = ({ split, summary, editAllowed, onEditClick }) => {
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  return (
    <div className="grid gap-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bill Summary</h2>
          {editAllowed && (
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit Assignments
            </button>
          )}
        </div>
        
        <div className="grid gap-6">
          {/* Bill Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <ReceiptRefundIcon className="h-5 w-5" />
              <span className="font-medium">Bill Details</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{split.currency} {summary.subtotal.toFixed(2)}</span>
              </div>
              {split.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>{split.currency} {split.tax_amount.toFixed(2)}</span>
                </div>
              )}
              {split.service_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span>{split.currency} {split.service_amount.toFixed(2)}</span>
                </div>
              )}                {split.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>- {split.currency} {split.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Total</span>
                <span>{split.currency} {summary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* People Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <UserGroupIcon className="h-5 w-5" />
              <span className="font-medium">Split Details</span>
            </div>
            <div className="space-y-3">
              {split.people.map((person, index) => {
                const isExpanded = expandedPerson === person.name;
                const personItems = split.items.filter(item => 
                  item.assigned.includes(person.name)
                );
                const personTotal = summary.perPerson[person.name] || 0;

                return (
                  <div 
                    key={index}
                    className="bg-gray-50 rounded-lg overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setExpandedPerson(isExpanded ? null : person.name)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{person.name}</span>
                        <span className="text-sm text-gray-500">
                          {personItems.length} item{personItems.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {split.currency} {personTotal.toFixed(2)}
                        </span>
                        <ChevronDownIcon 
                          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200 space-y-4">
                        {/* Items */}
                        <div className="space-y-2">
                          {personItems.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between text-sm">
                              <span className="flex items-center gap-2">
                                {item.name}
                                {item.assigned.length > 1 && (
                                  <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                    Split {item.assigned.length} ways
                                  </span>
                                )}
                              </span>
                              <span>{split.currency} {(item.price / item.assigned.length).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Charges Breakdown */}
                        <div className="space-y-2 pt-3 border-t text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Share of Tax</span>
                            <span>{split.currency} {((split.tax_amount * personTotal) / summary.total).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Share of Service</span>
                            <span>{split.currency} {((split.service_amount * personTotal) / summary.total).toFixed(2)}</span>
                          </div>
                          {split.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Share of Discount</span>
                              <span>- {split.currency} {((split.discount * personTotal) / summary.total).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EditModeView: React.FC<{
  split: AnonymousSplit;
  editAssignments: EditableItem[];
  toggleAssignment: (itemIdx: number, personName: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}> = ({ split, editAssignments, toggleAssignment, onSave, onCancel, saving }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Edit Item Assignments</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6">
        {editAssignments.map((item, itemIdx) => (
          <div key={itemIdx} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{split.currency} {item.price.toFixed(2)}</p>
              </div>
              {item.assigned.length > 0 && (
                <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                  Split {item.assigned.length} way{item.assigned.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {split.people.map((person, pIdx) => {
                const isAssigned = item.assigned.includes(person.name);
                return (
                  <button
                    key={pIdx}
                    onClick={() => toggleAssignment(itemIdx, person.name)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                      isAssigned
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isAssigned ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {isAssigned && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{person.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6 pt-6 border-t">
        <button
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Changes...
            </>
          ) : (
            <>
              <CheckIcon className="h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SharedSplitPage;