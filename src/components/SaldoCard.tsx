'use client';

import { useMemo } from 'react';
import { Unit } from '@/types';
import { useTransaksiStore } from '@/store';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle,
} from 'lucide-react';

interface SaldoCardProps {
    unit: Unit;
}

function formatRupiah(n: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

export { formatRupiah };

export default function SaldoCard({ unit }: SaldoCardProps) {
    const allTransaksi = useTransaksiStore((s) => s.transaksi);

    const saldo = useMemo(() => {
        const items = allTransaksi.filter((t) => t.unit === unit);
        const totalPendapatan = items
            .filter((t) => t.tipe === 'MASUK')
            .reduce((sum, t) => sum + t.nominal, 0);
        const totalPengeluaranTunai = items
            .filter((t) => t.tipe === 'KELUAR' && (t.status_pinjaman === 'Tunai' || t.status_pinjaman === null))
            .reduce((sum, t) => sum + t.nominal, 0);
        const totalHutangLunas = items
            .filter((t) => t.tipe === 'KELUAR' && t.status_pinjaman !== null && t.status_pinjaman !== 'Tunai' && t.is_lunas)
            .reduce((sum, t) => sum + t.nominal, 0);
        const totalHutangBelumLunas = items
            .filter((t) => t.tipe === 'KELUAR' && t.status_pinjaman !== null && t.status_pinjaman !== 'Tunai' && !t.is_lunas)
            .reduce((sum, t) => sum + t.nominal, 0);
        return {
            totalPendapatan,
            totalPengeluaranTunai,
            totalHutangLunas,
            totalHutangBelumLunas,
            hasilAkhir: totalPendapatan - totalPengeluaranTunai - totalHutangLunas,
        };
    }, [allTransaksi, unit]);

    const isBasah = unit === 'BASAH';
    const accent = isBasah ? 'from-red-500 to-rose-600' : 'from-amber-500 to-yellow-500';
    const accentLight = isBasah ? 'text-red-400' : 'text-amber-400';
    const bgCard = isBasah
        ? 'bg-gradient-to-br from-red-950/40 to-red-900/20 border-red-800/30'
        : 'bg-gradient-to-br from-amber-950/40 to-amber-900/20 border-amber-800/30';

    return (
        <div className={`rounded-2xl border p-5 backdrop-blur-xl ${bgCard}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white/90">
                    Seblak {isBasah ? 'Basah' : 'Kering'}
                </h2>
                <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${accent} text-white`}
                >
                    {unit}
                </span>
            </div>

            {/* Hasil Akhir */}
            <div className="mb-5">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Hasil Akhir</p>
                <p className={`text-3xl font-extrabold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
                    {formatRupiah(saldo.hasilAkhir)}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[11px] text-white/50 uppercase">Pendapatan</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">
                        {formatRupiah(saldo.totalPendapatan)}
                    </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown size={14} className="text-rose-400" />
                        <span className="text-[11px] text-white/50 uppercase">Keluar Tunai</span>
                    </div>
                    <p className="text-sm font-bold text-rose-400">
                        {formatRupiah(saldo.totalPengeluaranTunai)}
                    </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet size={14} className={accentLight} />
                        <span className="text-[11px] text-white/50 uppercase">Hutang Lunas</span>
                    </div>
                    <p className={`text-sm font-bold ${accentLight}`}>
                        {formatRupiah(saldo.totalHutangLunas)}
                    </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-orange-400" />
                        <span className="text-[11px] text-white/50 uppercase">Belum Lunas</span>
                    </div>
                    <p className="text-sm font-bold text-orange-400">
                        {formatRupiah(saldo.totalHutangBelumLunas)}
                    </p>
                </div>
            </div>
        </div>
    );
}
