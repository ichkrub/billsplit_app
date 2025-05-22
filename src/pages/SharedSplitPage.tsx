import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAnonymousSplit, supabase } from '../utils/supabaseClient';
import type { AnonymousSplit } from '../utils/supabaseClient';
import { calculateSplit } from '../utils/splitLogic';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

const SharedSplitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [split, setSplit] = useState<AnonymousSplit | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [editAllowed, setEditAllowed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editAssignments, setEditAssignments] = useState<any[]>([]);
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
          discountType: data.discount_type,
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
      discount: Number(split.discount),
      discountType: split.discount_type,
      currency: split.currency,
      otherCharges: 0,
      vendorName: split.vendor_name || '',
    };
    setSummary(calculateSplit(splitInput));
    setEditMode(false);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (expired) return <div className="text-center text-gray-500 py-12">This split link has expired.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Shared Bill Split</h1>
      {showPasswordPrompt ? (
        <form onSubmit={handlePasswordSubmit} className="max-w-xs mx-auto bg-white p-6 rounded shadow">
          <label className="block mb-2 font-medium">Enter password to edit:</label>
          <input
            type="text"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            className="input-field mb-4"
            autoFocus
          />
          <button type="submit" className="btn-primary w-full">Submit</button>
        </form>
      ) : editMode ? (
        <div className="card">
          <h2 className="text-xl font-bold mb-2">Edit Item Assignments</h2>
          {editAssignments.map((item, itemIdx) => (
            <div key={itemIdx} className="mb-4">
              <div className="font-medium mb-1">{item.name} - {split?.currency} {item.price.toFixed(2)}</div>
              <div className="flex flex-wrap gap-2">
                {split?.people.map((person, pIdx) => (
                  <label key={pIdx} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={item.assigned.includes(person.name)}
                      onChange={() => toggleAssignment(itemIdx, person.name)}
                    />
                    <span>{person.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <button className="btn-secondary" onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={saveAssignments} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-bold mb-2">Vendor: {split?.vendor_name || 'N/A'}</h2>
          <div className="mb-4 text-gray-700">Currency: {split?.currency}</div>
          <div className="mb-4">
            <div className="font-medium">People:</div>
            <ul className="list-disc list-inside">
              {split?.people.map((p, i) => <li key={i}>{p.name}</li>)}
            </ul>
          </div>
          <div className="mb-4">
            <div className="font-medium">Items:</div>
            <ul className="list-disc list-inside">
              {split?.items.map((item, i) => (
                <li key={i}>{item.name} - {split.currency} {item.price.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <div>Tax: {split?.currency} {split?.tax_amount.toFixed(2)}</div>
            <div>Service: {split?.currency} {split?.service_amount.toFixed(2)}</div>
            <div>Discount: {split?.currency} {split?.discount.toFixed(2)} ({split?.discount_type})</div>
          </div>
          {summary && (
            <div className="mb-4">
              <div className="font-bold mb-2">Per Person:</div>
              <ul className="list-disc list-inside">
                {Object.entries(summary.perPerson).map(([name, amount]) => (
                  <li key={name}>{name}: {split?.currency} {(amount as number).toFixed(2)}</li>
                ))}
              </ul>
              <div className="mt-4 font-bold">Total: {split?.currency} {summary.total.toFixed(2)}</div>
            </div>
          )}
          {editAllowed && <button className="btn-secondary mt-4" onClick={startEdit}>Edit</button>}
        </div>
      )}
    </div>
  );
};

export default SharedSplitPage; 