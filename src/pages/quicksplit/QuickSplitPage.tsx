import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Person, Item, SplitInput, SplitSummary } from '../../utils/splitLogic'
import { calculateSplit } from '../../utils/splitLogic'
import { saveAnonymousSplit } from '../../utils/supabaseClient'

const QuickSplitPage = () => {
  const [people, setPeople] = useState<Person[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [taxAmount, setTaxAmount] = useState(0)
  const [serviceAmount, setServiceAmount] = useState(0)
  const [otherCharges, setOtherCharges] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent')
  const [currency, setCurrency] = useState('USD')
  const [vendorName, setVendorName] = useState('')
  const [summary, setSummary] = useState<SplitSummary | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [password, setPassword] = useState('')

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

  const addPerson = () => {
    const name = prompt('Enter person name:')
    if (name) {
      setPeople([...people, { name }])
    }
  }

  const addItem = () => {
    const name = prompt('Enter item name:')
    const price = parseFloat(prompt('Enter item price:') || '0')
    if (name && !isNaN(price)) {
      setItems([...items, { name, price, assigned: [] }])
    }
  }

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
      const id = await saveAnonymousSplit(input)
      setShareLink(`${window.location.origin}/split/${id}`)
      setShowSaveDialog(false)
    } catch (error) {
      console.error('Failed to save split:', error)
      alert('Failed to save split. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
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
                        <div className="flex items-baseline gap-2 min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="font-medium truncate">{item.name}</h3>
                            <button
                              onClick={() => {
                                const newName = prompt('Enter new item name:', item.name)
                                if (newName) {
                                  const newItems = [...items]
                                  newItems[itemIndex] = { ...item, name: newName }
                                  setItems(newItems)
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-500 transition-all"
                              title="Edit name"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-600">{currency} {item.price.toFixed(2)}</span>
                            <button
                              onClick={() => {
                                const newPrice = prompt('Enter new price:', item.price.toString())
                                if (newPrice && !isNaN(parseFloat(newPrice))) {
                                  const newItems = [...items]
                                  newItems[itemIndex] = { ...item, price: parseFloat(newPrice) }
                                  setItems(newItems)
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-500 transition-all"
                              title="Edit price"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => setItems(items.filter((_, i) => i !== itemIndex))}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
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
            {summary && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Per Person:</h3>
                    <div className="space-y-2">
                      {Object.entries(summary.perPerson).map(([name, amount]) => (
                        <div key={name} className="flex justify-between py-1 border-b border-gray-100">
                          <span>{name}</span>
                          <span className="font-medium">{currency} {(amount as number).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-lg">{currency} {summary.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={saveAndShare}
                    className="w-full btn-primary text-center py-3 mt-4"
                  >
                    Save & Share Split
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Save & Share Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4"
          >
            <h3 className="text-xl font-bold mb-4">Save & Share</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (optional)
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Leave empty for no password"
              />
              <p className="mt-1 text-sm text-gray-500">
                If set, people will need this password to edit the split later.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleConfirmSave} className="flex-1 btn-primary">
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Link Dialog */}
      {shareLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4"
          >
            <h3 className="text-xl font-bold mb-4">Share Link</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Copy this link to share the split:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="input-field flex-1"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink)
                    alert('Link copied!')
                  }}
                  className="btn-primary px-4"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setShareLink(null)}
              className="w-full btn-secondary"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default QuickSplitPage