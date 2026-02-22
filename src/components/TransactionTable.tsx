'use client';

import { useState } from 'react';
import { Unit, Transaksi } from '@/types';
import { useTransaksiStore } from '@/store';
import { formatRupiah } from './SaldoCard';
import { CheckCircle2, Trash2, Clock, Edit, ChevronLeft, ChevronRight, Calendar, Search } from 'lucide-react';

interface TransactionTableProps {
    unit: Unit;
    filterTipe: 'MASUK' | 'KELUAR';
    onEdit: (t: Transaksi) => void;
}

export default function TransactionTable({ unit, filterTipe, onEdit }: TransactionTableProps) {
    const allTransaksi = useTransaksiStore((s) => s.transaksi);
    const lunasiHutang = useTransaksiStore((s) => s.lunasiHutang);
    const hapusTransaksi = useTransaksiStore((s) => s.hapusTransaksi);
    const baseTransaksi = allTransaksi.filter((t) => t.unit === unit && t.tipe === filterTipe);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [searchTerm, setSearchTerm] = useState('');

    const transaksi = baseTransaksi.filter(t =>
        t.keterangan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unpaidDebtsSummary = filterTipe === 'KELUAR'
        ? baseTransaksi.filter(t => t.status_pinjaman !== null && t.status_pinjaman !== 'Tunai' && !t.is_lunas)
            .reduce((acc, t) => {
                const status = t.status_pinjaman!;
                if (!acc[status]) acc[status] = { total: 0, count: 0, ids: [] };
                acc[status].total += t.nominal;
                acc[status].count += 1;
                acc[status].ids.push(t.id);
                return acc;
            }, {} as Record<string, { total: number, count: number, ids: string[] }>)
        : {};

    const isBasah = unit === 'BASAH';
    const accentBorder = isBasah ? 'border-red-800/30' : 'border-amber-800/30';
    const accentBg = isBasah
        ? 'bg-gradient-to-br from-red-950/30 to-red-900/10'
        : 'bg-gradient-to-br from-amber-950/30 to-amber-900/10';
    const buttonAccent = isBasah
        ? 'bg-red-500 hover:bg-red-400 active:bg-red-600'
        : 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600';

    const handleLunasi = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin melunasi hutang ini?')) {
            lunasiHutang(id);
        }
    };

    const handleLunasiSemua = async (status: string, ids: string[]) => {
        if (window.confirm(`Apakah Anda yakin ingin melunasi semua hutang ${status} (${ids.length} transaksi)?`)) {
            await Promise.all(ids.map(id => lunasiHutang(id)));
        }
    };

    const handleHapus = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data transaksi ini? Data yang dihapus tidak dapat dikembalikan.')) {
            hapusTransaksi(id);
        }
    };

    const handleEdit = (t: Transaksi) => {
        if (window.confirm('Anda akan mengedit data transaksi ini. Lanjutkan?')) {
            onEdit(t);
        }
    };

    if (baseTransaksi.length === 0) {
        return (
            <div className={`rounded-2xl border ${accentBorder} ${accentBg} p-8 text-center backdrop-blur-xl`}>
                <p className="text-white/40 text-sm">Belum ada transaksi</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Debt Summary Cards */}
            {filterTipe === 'KELUAR' && Object.keys(unpaidDebtsSummary).length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(unpaidDebtsSummary).map(([status, data]) => (
                        <div key={status} className={`p-3 rounded-xl border ${accentBorder} ${accentBg} flex flex-col gap-2 backdrop-blur-xl`}>
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-semibold text-orange-400">{status}</span>
                                <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{data.count}x</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-rose-400">{formatRupiah(data.total)}</span>
                            <button
                                onClick={() => handleLunasiSemua(status, data.ids)}
                                className={`text-[10px] py-1.5 mt-1 rounded-lg font-bold text-white transition-all active:scale-95 ${buttonAccent}`}
                            >
                                LUNASI SEMUA
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className={`rounded-2xl border ${accentBorder} ${accentBg} backdrop-blur-xl overflow-hidden`}>
                {/* Search Bar */}
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                </div>

                {transaksi.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-white/40 text-sm">Tidak ditemukan transaksi yang sesuai</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-center text-white/50 text-xs uppercase tracking-wider px-3 py-3 font-medium w-10">
                                            #
                                        </th>
                                        <th className="text-left text-white/50 text-xs uppercase tracking-wider px-5 py-3 font-medium">
                                            Tanggal
                                        </th>
                                        <th className="text-left text-white/50 text-xs uppercase tracking-wider px-5 py-3 font-medium">
                                            Keterangan
                                        </th>
                                        <th className="text-right text-white/50 text-xs uppercase tracking-wider px-5 py-3 font-medium">
                                            Nominal
                                        </th>
                                        {filterTipe === 'KELUAR' && (
                                            <th className="text-center text-white/50 text-xs uppercase tracking-wider px-5 py-3 font-medium">
                                                Status
                                            </th>
                                        )}
                                        <th className="text-center text-white/50 text-xs uppercase tracking-wider px-5 py-3 font-medium">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transaksi.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((t, index) => {
                                        const absoluteIndex = ((currentPage - 1) * ITEMS_PER_PAGE) + index + 1;
                                        const isMasuk = t.tipe === 'MASUK';
                                        const isPinjaman =
                                            t.tipe === 'KELUAR' &&
                                            t.status_pinjaman !== null &&
                                            t.status_pinjaman !== 'Tunai';

                                        const dateObj = new Date(t.created_at);
                                        const formattedDate = dateObj.toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        });

                                        return (
                                            <tr
                                                key={t.id}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-3 py-3 text-center text-white/40 text-xs font-mono">
                                                    {absoluteIndex}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-1.5 text-white/70">
                                                        <Calendar size={12} className="opacity-50" />
                                                        <span className="text-xs whitespace-nowrap">{formattedDate}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`w-2 h-2 rounded-full ${isMasuk ? 'bg-emerald-400' : 'bg-rose-400'
                                                                }`}
                                                        />
                                                        <span className="text-white/90 truncate max-w-[120px] md:max-w-none block" title={t.keterangan}>{t.keterangan}</span>
                                                    </div>
                                                </td>
                                                <td
                                                    className={`px-5 py-3 text-right font-mono font-semibold ${isMasuk ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}
                                                >
                                                    {isMasuk ? '+' : '-'}
                                                    {formatRupiah(t.nominal)}
                                                </td>
                                                {filterTipe === 'KELUAR' && (
                                                    <td className="px-5 py-3 text-center">
                                                        {isPinjaman ? (
                                                            t.is_lunas ? (
                                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                                                                    <CheckCircle2 size={12} />
                                                                    LUNAS
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full">
                                                                    <Clock size={12} />
                                                                    {t.status_pinjaman}
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="text-white/30 text-xs">
                                                                {t.tipe === 'KELUAR' ? 'Tunai' : '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="px-5 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {isPinjaman && !t.is_lunas && (
                                                            <button
                                                                onClick={() => handleLunasi(t.id)}
                                                                className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg ${buttonAccent} transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg`}
                                                            >
                                                                LUNASI
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEdit(t)}
                                                            className="text-white/30 hover:text-amber-400 transition-colors p-1"
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleHapus(t.id)}
                                                            className="text-white/30 hover:text-rose-400 transition-colors p-1"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-white/5">
                            {transaksi.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((t, index) => {
                                const absoluteIndex = ((currentPage - 1) * ITEMS_PER_PAGE) + index + 1;
                                const isMasuk = t.tipe === 'MASUK';
                                const isPinjaman =
                                    t.tipe === 'KELUAR' &&
                                    t.status_pinjaman !== null &&
                                    t.status_pinjaman !== 'Tunai';

                                const dateObj = new Date(t.created_at);
                                const formattedDate = dateObj.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                });

                                return (
                                    <div key={t.id} className="p-4 space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-white/30 text-xs font-mono w-4">{absoluteIndex}.</span>
                                                <span
                                                    className={`w-2 h-2 rounded-full shrink-0 ${isMasuk ? 'bg-emerald-400' : 'bg-rose-400'
                                                        }`}
                                                />
                                                <span className="text-white/90 text-sm truncate">{t.keterangan}</span>
                                                <span className="text-white/40 text-[10px] whitespace-nowrap px-1.5 py-0.5 border border-white/10 rounded-md shrink-0">{formattedDate}</span>
                                            </div>
                                            <div className="flex gap-1 items-center">
                                                <button
                                                    onClick={() => handleEdit(t)}
                                                    className="text-white/30 hover:text-amber-400 transition-colors p-1 shrink-0"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleHapus(t.id)}
                                                    className="text-white/30 hover:text-rose-400 transition-colors p-1 shrink-0"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`font-mono font-semibold text-sm ${isMasuk ? 'text-emerald-400' : 'text-rose-400'
                                                    }`}
                                            >
                                                {isMasuk ? '+' : '-'}
                                                {formatRupiah(t.nominal)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {filterTipe === 'KELUAR' && (
                                                    <>
                                                        {isPinjaman ? (
                                                            t.is_lunas ? (
                                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                                                    <CheckCircle2 size={12} />
                                                                    LUNAS
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                                                                        <Clock size={12} />
                                                                        {t.status_pinjaman}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleLunasi(t.id)}
                                                                        className={`text-xs font-bold text-white px-3 py-1 rounded-lg ${buttonAccent} transition-all active:scale-95`}
                                                                    >
                                                                        LUNASI
                                                                    </button>
                                                                </>
                                                            )
                                                        ) : (
                                                            <span className="text-white/30 text-xs">
                                                                {t.tipe === 'KELUAR' ? 'Tunai' : '—'}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {transaksi.length > ITEMS_PER_PAGE && (
                            <div className="border-t border-white/5 p-4 flex items-center justify-between">
                                <p className="text-white/50 text-xs">
                                    Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, transaksi.length)} dari {transaksi.length} transaksi
                                </p>
                                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1 px-2 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="px-3 py-1 text-sm text-white/90 font-mono font-medium border-x border-white/5">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(transaksi.length / ITEMS_PER_PAGE)))}
                                        disabled={currentPage >= Math.ceil(transaksi.length / ITEMS_PER_PAGE)}
                                        className="p-1 px-2 hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
