import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, CheckIcon } from '@heroicons/react/24/solid'
import type { Person, Item, SplitInput, SplitSummary } from '../../utils/splitLogic'
import { calculateSplit } from '../../utils/splitLogic'
import { saveAnonymousSplit, updateAnonymousSplit } from '../../utils/supabaseClient'
import { AddPersonDialog, AddItemDialog } from '../../components/modals'

// Helper functions for calculations
const calculateDiscount = (subtotal: number, discount: number, discountType: 'percent' | 'amount'): number => {
  if (discountType === 'percent') {
    return (subtotal * discount) / 100;
  }
  return discount;
}

const calculateTotal = (items: Item[], taxAmount: number, serviceAmount: number, otherCharges: number, discount: number, discountType: 'percent' | 'amount'): number => {
  const subtotal = items.reduce((sum, item) => sum + (isNaN(item.price) ? 0 : item.price), 0);
  const discountAmount = calculateDiscount(subtotal, discount, discountType);
  return subtotal + taxAmount + serviceAmount + otherCharges - discountAmount;
}

const calculatePersonTotal = (itemTotal: number, items: Item[], taxAmount: number, serviceAmount: number, otherCharges: number, discount: number, discountType: 'percent' | 'amount'): number => {
  const billTotal = calculateTotal(items, taxAmount, serviceAmount, otherCharges, discount, discountType);
  const subtotal = items.reduce((sum, item) => sum + (isNaN(item.price) ? 0 : item.price), 0);
  if (subtotal === 0) return 0;
  // Calculate person's share of additional charges proportionally
  const additionalChargesShare = (itemTotal / subtotal) * (billTotal - subtotal);
  return itemTotal + additionalChargesShare;
}

const QuickSplitPage = () => {
  const [people, setPeople] = useState<Person[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [taxAmount, setTaxAmount] = useState(0)
  const [serviceAmount, setServiceAmount] = useState(0)
  const [otherCharges, setOtherCharges] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('amount')
  const [currency, setCurrency] = useState('USD')
  const [vendorName, setVendorName] = useState('')
  const [summary, setSummary] = useState<SplitSummary | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<{ index: number; item: Item } | null>(null)
  const [password, setPassword] = useState('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [splitId, setSplitId] = useState<string | null>(null)

  // Live update summary
  useEffect(() => {
    const input: SplitInput = {
      people,
      items,
      taxAmount,
      serviceAmount,
      otherCharges,
      discount,
      discountType,
      currency,
      vendorName,
    }
    setSummary(calculateSplit(input))
  }, [people, items, taxAmount, serviceAmount, otherCharges, discount, discountType, currency, vendorName])

  const addPerson = () => setShowAddPersonDialog(true);

  const handleAddPerson = (name: string) => {
    // Update in batch to avoid state overwrite issues
    setPeople(prevPeople => [...prevPeople, { name }]);
  };

  const addItem = () => setShowAddItemDialog(true);

  const handleAddItem = (name: string, price: number) => {
    if (editingItem) {
      // Edit existing item
      const newItems = [...items];
      newItems[editingItem.index] = { ...editingItem.item, name, price };
      setItems(newItems);
      setEditingItem(null);
    } else {
      // Add new item
      setItems([...items, { name, price, assigned: [] }]);
    }
  };

  const assignPersonToItem = (itemIndex: number, personName: string) => {
    const newItems = [...items]
    const item = newItems[itemIndex]
    const assignedIndex = item.assigned.indexOf(personName)
    
    if (assignedIndex === -1) {
      item.assigned.push(personName)
    } else {
      item.assigned.splice(assignedIndex, 1)
    }
    
    setItems(newItems)
  }

  const saveAndShare = async () => {
    setShowSaveDialog(true)
  }

  const handleConfirmSave = async () => {
    try {
      const input: SplitInput & { password?: string } = {
        people,
        items,
        taxAmount,
        serviceAmount,
        otherCharges,
        discount,
        discountType,
        currency,
        vendorName,
        password: password || undefined,
      }

      let saveId: string;
      
      if (splitId) {
        // Update existing split
        await updateAnonymousSplit(splitId, input);
        saveId = splitId;
      } else {
        // Save new split
        saveId = await saveAnonymousSplit(input);
        setSplitId(saveId);
      }

      // Generate share URL
      const shareUrl = `${window.location.origin}/split/${saveId}`;

      // Set share link in UI
      setShareLink(shareUrl);
      setShowSaveDialog(false); 
      setPassword(''); // Reset password after successful save

      // First try native share on mobile devices
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobileDevice && typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: 'SplitFair - Shared Bill Split',
            text: `${vendorName ? `Check out the bill split for ${vendorName}` : 'Check out this bill split'} on SplitFair!`,
            url: shareUrl
          });
          // Return early if share succeeds
          return;
        } catch (err) {
          // If user cancels, don't try clipboard
          if (err instanceof Error && err.name === 'AbortError') {
            return;
          }
          console.log('Share failed, trying clipboard:', err);
        }
      }

      // Then try the modern clipboard API
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(shareUrl);
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
          return;
        }
      } catch (err) {
        console.log('Clipboard API failed, trying fallback:', err);
      }

      // Finally try the legacy execCommand method
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        // Place in viewport but make it "invisible"
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        textarea.style.zIndex = '-1';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const success = document.execCommand('copy');
        textarea.remove();

        if (success) {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        } else {
          throw new Error('execCommand returned false');
        }
      } catch (err) {
        console.error('All clipboard methods failed:', err);
        alert('Unable to copy automatically. Please copy this link manually:\n\n' + shareUrl);
      }

    } catch (error) {
      console.error('Failed to save split:', error);
      alert('Failed to save split. Please try again.');
    }
  }

  return (
    <div className="bg-slate-50 w-full">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Quick Split Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Split your bills quickly and fairly. Add people, items, and we'll do the math.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - People & Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* People Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">People</h2>
                <button
                  onClick={addPerson}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Person
                </button>
              </div>
              {people.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No people added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {people.map((person, index) => (
                    <div key={index} className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full border border-primary-200 group hover:bg-primary-100 transition-colors">
                      <span className="font-medium text-sm">{person.name}</span>
                      <button
                        onClick={() => setPeople(people.filter((_, i) => i !== index))}
                        className="ml-2 text-primary-400 hover:text-primary-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Items</h2>
                <button
                  onClick={addItem}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Item
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items added yet</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex flex-col bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between px-3 py-2 group">
                          <div className="flex items-baseline gap-4 min-w-0">
                            <h3 className="font-medium truncate">{item.name}</h3>
                            <span className="text-sm font-medium text-gray-600 shrink-0">{currency} {item.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem({ index: itemIndex, item });
                                setShowAddItemDialog(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-500 transition-all"
                              title="Edit item"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setItems(items.filter((_, i) => i !== itemIndex))}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            </button>
                          </div>
                      </div>
                      <div className="px-3 py-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                          {people.map((person, personIndex) => (
                            <button
                              key={personIndex}
                              onClick={() => assignPersonToItem(itemIndex, person.name)}
                              className={`px-2 py-1 rounded text-sm transition-all ${
                                item.assigned.includes(person.name)
                                  ? 'bg-primary-100 text-primary-700 font-medium shadow-sm'
                                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              {person.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Additional Info & Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Bill Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bill Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="input-field"
                    placeholder="Restaurant name or vendor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>                    <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-field"
                  >
                    {/* Most Used */}
                    <option value="USD">USD ($)</option>
                    <option value="SGD">SGD (S$)</option>
                    <option value="THB">THB (฿)</option>

                    {/* Southeast Asia */}
                    <option disabled>──────────</option>
                    <option value="MYR">MYR (RM)</option>
                    <option value="IDR">IDR (Rp)</option>
                    <option value="PHP">PHP (₱)</option>
                    <option value="VND">VND (₫)</option>

                    {/* East Asia */}
                    <option disabled>──────────</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="HKD">HKD (HK$)</option>
                    <option value="KRW">KRW (₩)</option>

                    {/* Global */}
                    <option disabled>──────────</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Amount
                    </label>
                    <input
                      type="number"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(Number(e.target.value))}
                      className="input-field"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Amount
                    </label>
                    <input
                      type="number"
                      value={serviceAmount}
                      onChange={(e) => setServiceAmount(Number(e.target.value))}
                      className="input-field"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Charges
                    </label>
                    <input
                      type="number"
                      value={otherCharges}
                      onChange={(e) => setOtherCharges(Number(e.target.value))}
                      className="input-field"
                      min="0"
                      step="0.01"
                      placeholder="Additional fees, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="input-field"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')}
                        className="input-field w-24"
                      >
                        <option value="percent">%</option>
                        <option value="amount">$</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
              
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No items added yet</p>
                  <button
                    onClick={addItem}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    Add your first item
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bill Header */}
                  {vendorName && (
                    <div className="text-gray-600 border-b pb-3">
                      <h3 className="font-medium text-lg">{vendorName}</h3>
                      <p className="text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                    </div>
                  )}

                  {/* Bill Breakdown */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Bill Details</h3>
                    <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{currency} {items.reduce((sum, item) => sum + (isNaN(item.price) ? 0 : item.price), 0).toFixed(2)}</span>
                      </div>
                      {taxAmount > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Tax</span>
                          <span>{currency} {taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {serviceAmount > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Service Charge</span>
                          <span>{currency} {serviceAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {otherCharges > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Other Charges</span>
                          <span>{currency} {otherCharges.toFixed(2)}</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="flex justify-between py-1 text-green-600">
                          <span>Discount {discountType === 'percent' ? `(${discount}%)` : ''}</span>
                          <span>- {currency} {calculateDiscount(
                            items.reduce((sum, item) => sum + (isNaN(item.price) ? 0 : item.price), 0),
                            discount,
                            discountType
                          ).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t font-medium text-base">
                        <span>Total</span>
                        <span>{currency} {calculateTotal(items, taxAmount, serviceAmount, otherCharges, discount, discountType).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Per Person Breakdown */}
                  <div className="pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Per Person Breakdown</h3>
                    {people.length === 0 ? (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm mb-2">Add people to see individual breakdowns</p>
                        <button
                          onClick={addPerson}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Add Person
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {people.map((person) => {
                          const personItems = items.filter(item => item.assigned.includes(person.name));
                          const itemTotal = personItems.reduce((sum, item) => {
                            const splitAmount = item.price / item.assigned.length;
                            return sum + (isNaN(splitAmount) ? 0 : splitAmount);
                          }, 0);
                          
                          // Calculate proportional shares
                          const subtotal = items.reduce((sum, item) => sum + (isNaN(item.price) ? 0 : item.price), 0);
                          const proportion = subtotal === 0 ? 0 : itemTotal / subtotal;
                          const taxShare = taxAmount * proportion;
                          const serviceShare = serviceAmount * proportion;
                          const otherShare = otherCharges * proportion;
                          const discountShare = calculateDiscount(subtotal, discount, discountType) * proportion;
                          const personTotal = itemTotal + taxShare + serviceShare + otherShare - discountShare;

                          return (
                            <div key={person.name} className="bg-gray-50 rounded-lg overflow-hidden">
                              <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={(e) => {
                                  const details = e.currentTarget.nextElementSibling;
                                  if (details) {
                                    details.classList.toggle('hidden');
                                  }
                                  const icon = e.currentTarget.querySelector('.rotate-icon');
                                  if (icon) {
                                    icon.classList.toggle('rotate-180');
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-gray-900">{person.name}</span>
                                  <span className="text-sm text-gray-500">
                                    {personItems.length} item{personItems.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{currency} {personTotal.toFixed(2)}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 rotate-icon transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>

                              <div className="hidden border-t border-gray-200">
                                {personItems.length > 0 ? (
                                  <div className="p-4 space-y-4">
                                    {/* Items */}
                                    <div className="space-y-2">
                                      {personItems.map((item) => (
                                        <div key={item.name} className="flex justify-between text-sm text-gray-600">
                                          <span className="flex items-center gap-2">
                                            {item.name}
                                            {item.assigned.length > 1 && (
                                              <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                                                Split {item.assigned.length} ways
                                              </span>
                                            )}
                                          </span>
                                          <span>{currency} {(item.price / item.assigned.length).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="space-y-2 pt-2 border-t border-gray-200">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Items Subtotal</span>
                                        <span>{currency} {itemTotal.toFixed(2)}</span>
                                      </div>
                                      {taxShare > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Tax Share</span>
                                          <span>{currency} {taxShare.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {serviceShare > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Service Charge Share</span>
                                          <span>{currency} {serviceShare.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {otherShare > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Other Charges Share</span>
                                          <span>{currency} {otherShare.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {discountShare > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                          <span>Discount Share</span>
                                          <span>- {currency} {discountShare.toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                                        <span>Total</span>
                                        <span>{currency} {personTotal.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 p-4">No items assigned yet</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Save & Share Button */}
              {items.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {shareLink ? (
                    <div className="text-center space-y-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 text-green-800 mb-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Split saved successfully!</span>
                        </div>
                        <button
                          onClick={async () => {
                            // First attempt: Web Share API for mobile devices
                            const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                            if (isMobileDevice && typeof navigator.share === 'function') {
                              try {
                                await navigator.share({
                                  title: 'SplitFair - Shared Bill Split',
                                  text: `${vendorName ? `Check out the bill split for ${vendorName}` : 'Check out this bill split'} on SplitFair!`,
                                  url: shareLink
                                });
                                return;
                              } catch (err) {
                                if (err instanceof Error && err.name === 'AbortError') {
                                  return; // User cancelled share, don't fallback
                                }
                                console.log('Share failed, trying clipboard:', err);
                              }
                            }

                            // Second attempt: Modern navigator.clipboard API
                            try {
                              if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                                await navigator.clipboard.writeText(shareLink);
                                setShowCopySuccess(true);
                                setTimeout(() => setShowCopySuccess(false), 2000);
                                return;
                              }
                            } catch (err) {
                              console.log('Clipboard API failed, trying fallback:', err);
                            }

                            // Final attempt: Legacy execCommand with textarea
                            try {
                              const textarea = document.createElement('textarea');
                              textarea.value = shareLink;
                              // Place in viewport but make it "invisible"
                              textarea.style.position = 'fixed';
                              textarea.style.opacity = '0';
                              textarea.style.pointerEvents = 'none';
                              textarea.style.zIndex = '-1';
                              document.body.appendChild(textarea);
                              textarea.focus();
                              textarea.select();

                              const success = document.execCommand('copy');
                              textarea.remove();

                              if (success) {
                                setShowCopySuccess(true);
                                setTimeout(() => setShowCopySuccess(false), 2000);
                              } else {
                                throw new Error('execCommand returned false');
                              }
                            } catch (err) {
                              console.error('All clipboard methods failed:', err);
                              alert('Unable to copy automatically. Please copy this link manually:\n\n' + shareLink);
                            }
                          }}
                          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-200 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 relative"
                          disabled={showCopySuccess}
                        >
                          {showCopySuccess ? (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <CheckIcon className="h-5 w-5 text-green-500" />
                              <span className="text-green-600 font-medium">Copied!</span>
                            </motion.div>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                              </svg>
                              Copy Share Link
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            setPeople([]);
                            setItems([]);
                            setTaxAmount(0);
                            setServiceAmount(0);
                            setOtherCharges(0);
                            setDiscount(0);
                            setDiscountType('amount');
                            setCurrency('USD');
                            setVendorName('');
                            setSummary(null);
                            setShareLink(null);
                            setShowSaveDialog(false);
                            setShowCopySuccess(false);
                            setPassword('');
                          }}
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Start New Split
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={saveAndShare}
                      className="w-full btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Save & Share
                  </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save & Share Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save Split</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Leave blank for no password"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="btn-primary"
                >
                  Save Split
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Person Dialog */}
      <AddPersonDialog
        isOpen={showAddPersonDialog}
        onClose={() => setShowAddPersonDialog(false)}
        onAdd={handleAddPerson}
      />

      {/* Add Item Dialog */}
      <AddItemDialog
        isOpen={showAddItemDialog}
        onClose={() => {
          setShowAddItemDialog(false);
          setEditingItem(null);
        }}
        onAdd={handleAddItem}
        currency={currency}
        editItem={editingItem}
      />
    </div>
  )
}

export default QuickSplitPage