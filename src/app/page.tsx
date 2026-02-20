'use client';

import { useState, useEffect } from 'react';
import SaldoCard from '@/components/SaldoCard';
import TransactionTable from '@/components/TransactionTable';
import TransactionForm from '@/components/TransactionForm';
import { useTransaksiStore } from '@/store';
import { Unit, TipeTransaksi, Transaksi } from '@/types';
import { Plus, Minus } from 'lucide-react';

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [formUnit, setFormUnit] = useState<Unit>('BASAH');
  const [formTipe, setFormTipe] = useState<TipeTransaksi>('MASUK');
  const [editData, setEditData] = useState<Transaksi | null>(null);

  const initStore = useTransaksiStore((s) => s.init);

  useEffect(() => {
    const unsubscribe = initStore();
    return () => unsubscribe();
  }, [initStore]);

  const openForm = (unit: Unit, tipe: TipeTransaksi) => {
    setFormUnit(unit);
    setFormTipe(tipe);
    setEditData(null);
    setFormOpen(true);
  };

  const openEditForm = (t: Transaksi) => {
    setFormUnit(t.unit);
    setFormTipe(t.tipe);
    setEditData(t);
    setFormOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-lg font-bold shadow-lg">
                🔥
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
                  Seblak Smart
                </h1>
                <p className="text-xs text-white/40">Manajemen Keuangan</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dual Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* === SEBLAK BASAH === */}
          <UnitDashboard unit="BASAH" onAddTransaction={openForm} onEditTransaction={openEditForm} />

          {/* === SEBLAK KERING === */}
          <UnitDashboard unit="KERING" onAddTransaction={openForm} onEditTransaction={openEditForm} />
        </div>
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        key={`${formUnit}-${formTipe}-${formOpen}-${editData?.id || 'new'}`}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        defaultUnit={formUnit}
        defaultTipe={formTipe}
        editData={editData}
      />
    </main>
  );
}

function UnitDashboard({
  unit,
  onAddTransaction,
  onEditTransaction,
}: {
  unit: Unit;
  onAddTransaction: (unit: Unit, tipe: TipeTransaksi) => void;
  onEditTransaction: (t: Transaksi) => void;
}) {
  const isBasah = unit === 'BASAH';
  const sectionBg = isBasah
    ? 'from-red-500/5 to-transparent border-red-500/10'
    : 'from-amber-500/5 to-transparent border-amber-500/10';

  return (
    <section
      className={`bg-gradient-to-b ${sectionBg} rounded-3xl border p-4 sm:p-6 space-y-5`}
    >
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isBasah ? '🌶️' : '🔥'}</span>
          <h2 className="text-base font-bold text-white/80">
            Seblak {isBasah ? 'Basah' : 'Kering'}
          </h2>
        </div>
        <div
          className={`h-1 w-12 rounded-full bg-gradient-to-r ${isBasah ? 'from-red-500 to-rose-600' : 'from-amber-500 to-yellow-500'
            }`}
        />
      </div>

      {/* Saldo Card */}
      <SaldoCard unit={unit} />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAddTransaction(unit, 'MASUK')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Pendapatan
        </button>
        <button
          onClick={() => onAddTransaction(unit, 'KELUAR')}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-all active:scale-95"
        >
          <Minus size={16} /> Pengeluaran
        </button>
      </div>

      {/* Transaction Table */}
      <TransactionTable unit={unit} onEdit={onEditTransaction} />
    </section>
  );
}
