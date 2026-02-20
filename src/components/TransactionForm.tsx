'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Unit, TipeTransaksi, SUMBER_DANA_OPTIONS, Transaksi } from '@/types';
import { useTransaksiStore } from '@/store';
import { X, Plus, Minus, Calendar } from 'lucide-react';

interface TransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    defaultUnit: Unit;
    defaultTipe?: TipeTransaksi;
    editData?: Transaksi | null;
}

interface FormData {
    tipe: TipeTransaksi;
    nominal: string;
    keterangan: string;
    tanggal: string;
    sumber_dana: string;
    sumber_dana_manual: string;
}

function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function TransactionForm({
    isOpen,
    onClose,
    defaultUnit,
    defaultTipe = 'MASUK',
    editData = null,
}: TransactionFormProps) {
    const addTransaksi = useTransaksiStore((s) => s.addTransaksi);
    const editTransaksi = useTransaksiStore((s) => s.editTransaksi);

    let initialSumberDana = 'Tunai';
    let initialSumberDanaManual = '';

    if (editData && editData.tipe === 'KELUAR' && editData.status_pinjaman && editData.status_pinjaman !== 'Tunai') {
        if (SUMBER_DANA_OPTIONS.includes(editData.status_pinjaman as any)) {
            initialSumberDana = editData.status_pinjaman;
        } else {
            initialSumberDana = 'Lainnya...';
            initialSumberDanaManual = editData.status_pinjaman;
        }
    }

    const [showManual, setShowManual] = useState(initialSumberDana === 'Lainnya...');

    const unit = defaultUnit;
    const isBasah = unit === 'BASAH';

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: editData ? {
            tipe: editData.tipe,
            nominal: editData.nominal.toString(),
            keterangan: editData.keterangan,
            tanggal: new Date(editData.created_at).toISOString().split('T')[0],
            sumber_dana: initialSumberDana,
            sumber_dana_manual: initialSumberDanaManual,
        } : {
            tipe: defaultTipe,
            nominal: '',
            keterangan: '',
            tanggal: getTodayString(),
            sumber_dana: 'Tunai',
            sumber_dana_manual: '',
        },
    });

    const tipe = watch('tipe');
    const sumberDana = watch('sumber_dana');

    const handleSumberDanaChange = (value: string) => {
        setValue('sumber_dana', value);
        if (value === 'Lainnya...') {
            setShowManual(true);
        } else {
            setShowManual(false);
            setValue('sumber_dana_manual', '');
        }
    };

    const onSubmit = (data: FormData) => {
        let statusPinjaman: string | null = null;

        if (data.tipe === 'KELUAR') {
            if (data.sumber_dana === 'Lainnya...') {
                statusPinjaman = data.sumber_dana_manual || 'Lainnya';
            } else if (data.sumber_dana !== 'Tunai') {
                statusPinjaman = data.sumber_dana;
            } else {
                statusPinjaman = 'Tunai';
            }
        }

        const payload = {
            unit,
            tipe: data.tipe,
            nominal: parseInt(data.nominal.replace(/\D/g, ''), 10),
            keterangan: data.keterangan,
            status_pinjaman: data.tipe === 'MASUK' ? null : statusPinjaman,
            is_lunas:
                (data.tipe === 'MASUK' || (data.tipe === 'KELUAR' && data.sumber_dana === 'Tunai'))
                    ? true
                    : (editData ? editData.is_lunas : false),
            created_at: new Date(data.tanggal).toISOString(),
        };

        if (editData) {
            editTransaksi(editData.id, payload);
        } else {
            addTransaksi(payload);
        }

        reset();
        setShowManual(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in">
                {/* Header */}
                <div
                    className={`p-5 border-b border-white/10 bg-gradient-to-r ${isBasah
                        ? 'from-red-500/20 to-transparent'
                        : 'from-amber-500/20 to-transparent'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                {editData ? 'Edit Transaksi' : 'Tambah Transaksi'}
                            </h3>
                            <p className={`text-xs mt-0.5 ${isBasah ? 'text-red-400' : 'text-amber-400'}`}>
                                {isBasah ? '🌶️' : '🔥'} Seblak {isBasah ? 'Basah' : 'Kering'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white transition-colors p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    {/* Tipe Toggle */}
                    <div>
                        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                            Tipe Transaksi
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setValue('tipe', 'MASUK')}
                                className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tipe === 'MASUK'
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                <Plus size={16} /> Pendapatan
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('tipe', 'KELUAR')}
                                className={`py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tipe === 'KELUAR'
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                            >
                                <Minus size={16} /> Pengeluaran
                            </button>
                        </div>
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                            <span className="inline-flex items-center gap-1"><Calendar size={12} /> Tanggal</span>
                        </label>
                        <input
                            type="date"
                            {...register('tanggal', {
                                required: 'Tanggal wajib diisi',
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all [color-scheme:dark]"
                        />
                        {errors.tanggal && (
                            <p className="text-rose-400 text-xs mt-1">{errors.tanggal.message}</p>
                        )}
                    </div>

                    {/* Nominal */}
                    <div>
                        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                            Nominal (Rp)
                        </label>
                        <input
                            type="number"
                            {...register('nominal', {
                                required: 'Nominal wajib diisi',
                                min: { value: 1, message: 'Nominal harus lebih dari 0' },
                            })}
                            placeholder="Contoh: 50000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all text-lg font-mono"
                        />
                        {errors.nominal && (
                            <p className="text-rose-400 text-xs mt-1">{errors.nominal.message}</p>
                        )}
                    </div>

                    {/* Keterangan */}
                    <div>
                        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                            Keterangan
                        </label>
                        <input
                            type="text"
                            {...register('keterangan', {
                                required: 'Keterangan wajib diisi',
                            })}
                            placeholder="Contoh: Jualan Pagi"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                        />
                        {errors.keterangan && (
                            <p className="text-rose-400 text-xs mt-1">{errors.keterangan.message}</p>
                        )}
                    </div>

                    {/* Sumber Dana - only for KELUAR */}
                    {tipe === 'KELUAR' && (
                        <div>
                            <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                                Sumber Dana
                            </label>
                            <select
                                value={sumberDana}
                                onChange={(e) => handleSumberDanaChange(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                            >
                                {SUMBER_DANA_OPTIONS.map((opt) => (
                                    <option
                                        key={opt}
                                        value={opt}
                                        className="bg-gray-900 text-white"
                                    >
                                        {opt}
                                    </option>
                                ))}
                            </select>

                            {/* Manual Input */}
                            {showManual && (
                                <div className="mt-3 animate-in">
                                    <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">
                                        Ketik Sumber Pinjaman
                                    </label>
                                    <input
                                        type="text"
                                        {...register('sumber_dana_manual', {
                                            required:
                                                sumberDana === 'Lainnya...'
                                                    ? 'Sumber pinjaman wajib diisi'
                                                    : false,
                                        })}
                                        placeholder="Contoh: Pinjam Kas RT"
                                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all ${isBasah
                                            ? 'border-red-500/30 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20'
                                            : 'border-amber-500/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20'
                                            }`}
                                    />
                                    {errors.sumber_dana_manual && (
                                        <p className="text-rose-400 text-xs mt-1">
                                            {errors.sumber_dana_manual.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl ${isBasah
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/25 hover:shadow-red-500/40'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/25 hover:shadow-amber-500/40'
                            }`}
                    >
                        {editData ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .animate-in {
                    animation: slideUp 0.2s ease-out;
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
