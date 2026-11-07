'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Package,
  DollarSign,
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle,
} from 'lucide-react';

export interface SourcingItem {
  id: string;
  name: string;
  category: 'gadgets' | 'toys' | 'jewellery' | 'packaging';
  supplier: string;
  sourceUrl?: string;
  unitCostCNY: number;
  estLandedBDT: number;
  moq: number;
  status: 'researching' | 'sample_ordered' | 'bulk_ordered' | 'in_transit' | 'received';
  trackingNumber?: string;
  notes?: string;
}

export interface BusinessExpense {
  id: string;
  title: string;
  category: 'packaging' | 'courier_deposit' | 'marketing' | 'logistics' | 'other';
  amountBDT: number;
  date: string;
  notes?: string;
}

export interface BusinessTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const DEFAULT_SOURCING: SourcingItem[] = [
  {
    id: 'src-1',
    name: 'Astronaut Ambient Galaxy Desk Lamp',
    category: 'gadgets',
    supplier: 'Shenzhen Yisheng Tech (1688)',
    sourceUrl: 'https://1688.com',
    unitCostCNY: 28,
    estLandedBDT: 650,
    moq: 20,
    status: 'sample_ordered',
    trackingNumber: 'CN-894124982',
    notes: 'Sample coming via air courier for photoshoot and video reels.',
  },
  {
    id: 'src-2',
    name: 'Magnetic Titanium Fidget Slider Toy',
    category: 'toys',
    supplier: 'Dongguan Precision EDC Toys',
    sourceUrl: 'https://1688.com',
    unitCostCNY: 18,
    estLandedBDT: 420,
    moq: 30,
    status: 'researching',
    notes: 'Very high engagement on TikTok/Instagram Reels. Target retail: ৳850.',
  },
  {
    id: 'src-3',
    name: 'Transparent Silicone Earring Cushions (Bulk)',
    category: 'jewellery',
    supplier: 'Yiwu Jewelry Findings Co.',
    unitCostCNY: 0.6,
    estLandedBDT: 20,
    moq: 500,
    status: 'received',
    notes: 'Standard painless cushion pads included with every MELO ear clip pair.',
  },
];

const DEFAULT_EXPENSES: BusinessExpense[] = [
  {
    id: 'exp-1',
    title: 'Custom Gold-Foil Velvet Jewellery Pouches (500 pcs)',
    category: 'packaging',
    amountBDT: 8500,
    date: '2026-11-01',
    notes: 'Packaging supplier in Old Dhaka',
  },
  {
    id: 'exp-2',
    title: 'Steadfast Courier COD Advance Deposit',
    category: 'courier_deposit',
    amountBDT: 5000,
    date: '2026-11-03',
    notes: 'Merchant balance for nationwide shipments',
  },
  {
    id: 'exp-3',
    title: 'Meta Ads Launch Campaign (Instagram & Facebook)',
    category: 'marketing',
    amountBDT: 6500,
    date: '2026-11-05',
    notes: 'Targeting Dhaka, Chittagong & Sylhet',
  },
];

const DEFAULT_TASKS: BusinessTask[] = [
  {
    id: 'tsk-1',
    title: 'Unbox and inspect galaxy lamp gadget samples upon arrival',
    priority: 'high',
    completed: false,
  },
  {
    id: 'tsk-2',
    title: 'Finalize pricing matrix for fidget toys and desk novelties',
    priority: 'high',
    completed: false,
  },
  {
    id: 'tsk-3',
    title: 'Design custom MELO unboxing thank-you card in Canva',
    priority: 'medium',
    completed: true,
  },
  {
    id: 'tsk-4',
    title: 'Negotiate volume discount on 316L stainless steel rings with supplier',
    priority: 'low',
    completed: false,
  },
];

const DEFAULT_NOTES = `MELO BUSINESS STRATEGY & OPERATIONS NOTES
==========================================
1. Brand Verticals:
   - Dainty French Light Luxury Jewellery (painless clips & 316L steel)
   - Aesthetic Desk Gadgets (ambient lamps, novelty tech, chargers)
   - Tactile Toys & Collectibles (fidget sliders, blind boxes)

2. Shipping & Delivery Guidelines:
   - Inside Dhaka: ৳70 (Steadfast 24h delivery)
   - Outside Dhaka: ৳130 (2-4 days)
   - Packaging rule: All fragile gadgets get double bubble wrap.
   - All jewelry gets velvet pouch + seal.

3. Supplier WeChat / Contacts:
   - Yiwu Findings Agent: wxid_yiwujewels99
   - Shenzhen Electronics Agent: sales@yishengtech.cn
   - Local Packaging Vendor: 01711-XXXXXX (Old Dhaka)`;

export function AdminOperationsTab() {
  const [subTab, setSubTab] = useState<'sourcing' | 'expenses' | 'tasks' | 'notes'>('sourcing');

  // Sourcing State
  const [sourcingItems, setSourcingItems] = useState<SourcingItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SOURCING;
    try {
      const stored = localStorage.getItem('melo_business_sourcing');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_SOURCING;
  });

  // Expense State
  const [expenses, setExpenses] = useState<BusinessExpense[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_EXPENSES;
    try {
      const stored = localStorage.getItem('melo_business_expenses');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_EXPENSES;
  });

  // Task State
  const [tasks, setTasks] = useState<BusinessTask[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_TASKS;
    try {
      const stored = localStorage.getItem('melo_business_tasks');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_TASKS;
  });

  // Notes State
  const [notes, setNotes] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_NOTES;
    return localStorage.getItem('melo_business_notes') || DEFAULT_NOTES;
  });
  const [notesSaved, setNotesSaved] = useState(false);

  // New Sourcing Modal / Inline Form
  const [isAddingSourcing, setIsAddingSourcing] = useState(false);
  const [newSrcName, setNewSrcName] = useState('');
  const [newSrcCat, setNewSrcCat] = useState<SourcingItem['category']>('gadgets');
  const [newSrcSupplier, setNewSrcSupplier] = useState('');
  const [newSrcCny, setNewSrcCny] = useState('');
  const [newSrcBdt, setNewSrcBdt] = useState('');
  const [newSrcMoq, setNewSrcMoq] = useState('10');
  const [newSrcStatus, setNewSrcStatus] = useState<SourcingItem['status']>('researching');
  const [newSrcNotes, setNewSrcNotes] = useState('');

  // New Expense Form
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCat, setNewExpCat] = useState<BusinessExpense['category']>('packaging');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpNotes, setNewExpNotes] = useState('');

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<BusinessTask['priority']>('medium');

  // Persistence effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('melo_business_sourcing', JSON.stringify(sourcingItems));
    }
  }, [sourcingItems]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('melo_business_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('melo_business_tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleSaveNotes = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('melo_business_notes', notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    }
  };

  // Add Sourcing Item
  const handleAddSourcing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrcName.trim()) return;

    const newItem: SourcingItem = {
      id: `src-${Date.now()}`,
      name: newSrcName.trim(),
      category: newSrcCat,
      supplier: newSrcSupplier.trim() || 'Unknown Supplier',
      unitCostCNY: Number(newSrcCny) || 0,
      estLandedBDT: Number(newSrcBdt) || 0,
      moq: Number(newSrcMoq) || 1,
      status: newSrcStatus,
      notes: newSrcNotes.trim(),
    };

    setSourcingItems([newItem, ...sourcingItems]);
    setNewSrcName('');
    setNewSrcSupplier('');
    setNewSrcCny('');
    setNewSrcBdt('');
    setNewSrcNotes('');
    setIsAddingSourcing(false);
  };

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpAmount) return;

    const newExp: BusinessExpense = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      category: newExpCat,
      amountBDT: Math.round(Number(newExpAmount)),
      date: new Date().toISOString().slice(0, 10),
      notes: newExpNotes.trim(),
    };

    setExpenses([newExp, ...expenses]);
    setNewExpTitle('');
    setNewExpAmount('');
    setNewExpNotes('');
    setIsAddingExpense(false);
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: BusinessTask = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const deleteSourcingItem = (id: string) => {
    if (confirm('Delete this sourcing item?')) {
      setSourcingItems(sourcingItems.filter((i) => i.id !== id));
    }
  };

  const deleteExpense = (id: string) => {
    if (confirm('Delete this expense entry?')) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  const totalExpenseBDT = expenses.reduce((sum, e) => sum + e.amountBDT, 0);

  return (
    <div className="space-y-6">
      {/* Overview Info Header */}
      <div className="bg-[#FAF7F2] border border-[#E7E0D6] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#9A7B3E]" />
              <h2 className="font-serif-display text-xl font-medium text-[#1C1917]">
                Internal Business &amp; Operations Hub
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#78716C] max-w-xl">
              Manage product sourcing for toys &amp; gadgets, operating overhead, supplier contacts,
              and internal execution — completely separate from customer storefront orders.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-[#E7E0D6] px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-semibold text-[#78716C] block">
                Sourced Items
              </span>
              <span className="font-serif-display text-lg font-bold text-[#1C1917]">
                {sourcingItems.length}
              </span>
            </div>
            <div className="bg-white border border-[#E7E0D6] px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-semibold text-[#78716C] block">
                Logged Overhead
              </span>
              <span className="font-serif-display text-lg font-bold text-[#9A7B3E]">
                ৳{totalExpenseBDT.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 border-t border-[#E7E0D6] mt-4 pt-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSubTab('sourcing')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              subTab === 'sourcing'
                ? 'bg-[#1C1917] text-white'
                : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Sourcing &amp; Suppliers ({sourcingItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('expenses')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              subTab === 'expenses'
                ? 'bg-[#1C1917] text-white'
                : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Overhead &amp; Expenses (৳{totalExpenseBDT.toLocaleString()})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('tasks')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              subTab === 'tasks'
                ? 'bg-[#1C1917] text-white'
                : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>
              Internal Tasks ({tasks.filter((t) => !t.completed).length}/{tasks.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('notes')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
              subTab === 'notes'
                ? 'bg-[#1C1917] text-white'
                : 'bg-white border border-[#E7E0D6] text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Strategy &amp; Notes</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SOURCING & SUPPLIERS                                                   */}
      {/* ========================================================================= */}
      {subTab === 'sourcing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-lg font-medium text-[#1C1917]">
              Product Sourcing Pipeline (Toys, Gadgets &amp; Jewellery)
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingSourcing(!isAddingSourcing)}
              className="inline-flex items-center gap-1.5 boutique-btn-primary px-3.5 py-2 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingSourcing ? 'Close Form' : 'Log Sourced Item'}</span>
            </button>
          </div>

          {/* Add Sourcing Form */}
          {isAddingSourcing && (
            <form
              onSubmit={handleAddSourcing}
              className="bg-white border border-[#C5A059] p-4 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                New Sourced Item Record
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Product / Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robot Desktop Fidget Toy"
                    value={newSrcName}
                    onChange={(e) => setNewSrcName(e.target.value)}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Vertical / Category
                  </label>
                  <select
                    value={newSrcCat}
                    onChange={(e) => setNewSrcCat(e.target.value as SourcingItem['category'])}
                    className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs"
                  >
                    <option value="gadgets">Gadgets &amp; Desk Tech</option>
                    <option value="toys">Toys &amp; Collectibles</option>
                    <option value="jewellery">French Jewellery &amp; Clips</option>
                    <option value="packaging">Packaging &amp; Pouches</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Supplier / Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1688 Factory / Shenzhen"
                    value={newSrcSupplier}
                    onChange={(e) => setNewSrcSupplier(e.target.value)}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Unit Cost (CNY)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25.0"
                    value={newSrcCny}
                    onChange={(e) => setNewSrcCny(e.target.value)}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Est. Landed Cost (BDT)
                  </label>
                  <input
                    type="number"
                    placeholder="580"
                    value={newSrcBdt}
                    onChange={(e) => setNewSrcBdt(e.target.value)}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    MOQ &amp; Status
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="MOQ"
                      value={newSrcMoq}
                      onChange={(e) => setNewSrcMoq(e.target.value)}
                      className="w-20 border border-[#D6CFC5] px-3 py-2 text-xs"
                    />
                    <select
                      value={newSrcStatus}
                      onChange={(e) => setNewSrcStatus(e.target.value as SourcingItem['status'])}
                      className="flex-1 border border-[#D6CFC5] bg-white px-2 py-2 text-xs"
                    >
                      <option value="researching">Researching</option>
                      <option value="sample_ordered">Sample Ordered</option>
                      <option value="bulk_ordered">Bulk Ordered</option>
                      <option value="in_transit">In Transit</option>
                      <option value="received">Received / In Stock</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                  Notes / Supplier Specs
                </label>
                <input
                  type="text"
                  placeholder="e.g. Needs USB-C charging cable, test packaging size..."
                  value={newSrcNotes}
                  onChange={(e) => setNewSrcNotes(e.target.value)}
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSourcing(false)}
                  className="boutique-btn-outline px-4 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="boutique-btn-primary px-4 py-1.5 text-xs">
                  Save Sourcing Item
                </button>
              </div>
            </form>
          )}

          {/* Sourcing Items Table */}
          <div className="bg-white border border-[#E7E0D6] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[10px] font-semibold uppercase tracking-wider text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Item &amp; Vertical</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Est. Landed (BDT)</th>
                  <th className="py-3 px-4">MOQ</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D6]/60">
                {sourcingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1C1917]">{item.name}</div>
                      <span className="inline-block mt-0.5 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 bg-stone-100 text-[#78716C]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#78716C]">
                      {item.supplier}
                      {item.trackingNumber && (
                        <div className="text-[10px] font-mono text-[#9A7B3E]">
                          Trk: {item.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#1C1917]">
                      ¥{item.unitCostCNY}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#9A7B3E]">
                      ৳{item.estLandedBDT}
                    </td>
                    <td className="py-3.5 px-4 text-[#78716C]">{item.moq} pcs</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${
                          item.status === 'received'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.status === 'in_transit'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : item.status === 'sample_ordered'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#78716C] max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteSourcingItem(item.id)}
                        className="text-stone-400 hover:text-red-700 transition p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OVERHEAD & OPERATING EXPENSES                                          */}
      {/* ========================================================================= */}
      {subTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-display text-lg font-medium text-[#1C1917]">
                Operating Expenses &amp; Overhead Log
              </h3>
              <p className="text-xs text-[#78716C]">
                Track courier deposits, advertising spend, packaging boxes, and non-inventory business costs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingExpense(!isAddingExpense)}
              className="inline-flex items-center gap-1.5 boutique-btn-primary px-3.5 py-2 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingExpense ? 'Close Form' : 'Log Expense'}</span>
            </button>
          </div>

          {/* Add Expense Form */}
          {isAddingExpense && (
            <form
              onSubmit={handleAddExpense}
              className="bg-white border border-[#C5A059] p-4 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Record Business Overhead Expense
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Expense Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Courier advance balance"
                    value={newExpTitle}
                    onChange={(e) => setNewExpTitle(e.target.value)}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Category
                  </label>
                  <select
                    value={newExpCat}
                    onChange={(e) => setNewExpCat(e.target.value as BusinessExpense['category'])}
                    className="w-full border border-[#D6CFC5] bg-white px-3 py-2 text-xs"
                  >
                    <option value="packaging">Packaging &amp; Boxes</option>
                    <option value="courier_deposit">Courier COD Advance</option>
                    <option value="marketing">Social Media Ads &amp; Marketing</option>
                    <option value="logistics">Air / Sea Freight &amp; Customs</option>
                    <option value="other">General Office / Studio Overhead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                    Amount (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#78716C] mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Receipt number or details..."
                  value={newExpNotes}
                  onChange={(e) => setNewExpNotes(e.target.value)}
                  className="w-full border border-[#D6CFC5] px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="boutique-btn-outline px-4 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="boutique-btn-primary px-4 py-1.5 text-xs">
                  Save Expense
                </button>
              </div>
            </form>
          )}

          {/* Expenses List */}
          <div className="bg-white border border-[#E7E0D6] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E7E0D6] text-[10px] font-semibold uppercase tracking-wider text-[#78716C]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount (BDT)</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D6]/60">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF7F2]/40 transition">
                    <td className="py-3.5 px-4 font-mono text-[#78716C]">{exp.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1C1917]">{exp.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 bg-stone-100 text-[#78716C]">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1C1917]">
                      ৳{exp.amountBDT.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#78716C]">{exp.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteExpense(exp.id)}
                        className="text-stone-400 hover:text-red-700 transition p-1"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTERNAL TASKS                                                         */}
      {/* ========================================================================= */}
      {subTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-display text-lg font-medium text-[#1C1917]">
              Internal Business Execution &amp; Reminders
            </h3>
          </div>

          {/* Quick Add Task */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Add an internal task or operational reminder..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 border border-[#D6CFC5] bg-white px-3.5 py-2 text-xs"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as BusinessTask['priority'])}
              className="border border-[#D6CFC5] bg-white px-3 py-2 text-xs"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <button
              type="submit"
              className="boutique-btn-primary px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              Add Task
            </button>
          </form>

          {/* Tasks List */}
          <div className="bg-white border border-[#E7E0D6] divide-y divide-[#E7E0D6]">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 hover:bg-[#FAF7F2]/50 transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="accent-[#9A7B3E] h-4 w-4 cursor-pointer"
                  />
                  <span
                    className={`text-xs ${
                      task.completed
                        ? 'line-through text-stone-400'
                        : 'text-[#1C1917] font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 ${
                      task.priority === 'high'
                        ? 'bg-red-50 text-red-700'
                        : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="text-stone-400 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BUSINESS NOTES & STRATEGY                                              */}
      {/* ========================================================================= */}
      {subTab === 'notes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-display text-lg font-medium text-[#1C1917]">
                Business Strategy, Suppliers &amp; Knowledge Base
              </h3>
              <p className="text-xs text-[#78716C]">
                Internal notes, supplier WhatsApp numbers, China forwarder addresses, and packaging specs.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveNotes}
              className="inline-flex items-center gap-1.5 boutique-btn-primary px-4 py-2 text-xs cursor-pointer"
            >
              {notesSaved ? <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
              <span>{notesSaved ? 'Notes Saved!' : 'Save Notes'}</span>
            </button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={16}
            className="w-full border border-[#D6CFC5] bg-white p-4 font-mono text-xs text-[#1C1917] leading-relaxed focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      )}
    </div>
  );
}
