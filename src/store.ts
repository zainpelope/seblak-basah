import { create } from 'zustand';
import { Transaksi, Unit } from './types';
import { db } from './lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface TransaksiStore {
    transaksi: Transaksi[];
    init: () => () => void;
    addTransaksi: (t: Omit<Transaksi, 'id'>) => Promise<void>;
    editTransaksi: (id: string, t: Omit<Transaksi, 'id'>) => Promise<void>;
    lunasiHutang: (id: string) => Promise<void>;
    hapusTransaksi: (id: string) => Promise<void>;
    getTransaksiByUnit: (unit: Unit) => Transaksi[];
    getSaldo: (unit: Unit) => {
        totalPendapatan: number;
        totalPengeluaranTunai: number;
        totalHutangLunas: number;
        hasilAkhir: number;
        totalHutangBelumLunas: number;
    };
}

export const useTransaksiStore = create<TransaksiStore>((set, get) => ({
    transaksi: [],

    init: () => {
        const q = query(collection(db, 'transaksi'), orderBy('created_at', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Transaksi[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Transaksi);
            });
            set({ transaksi: data });
        });
        return unsubscribe;
    },

    addTransaksi: async (t) => {
        const payload = {
            ...t,
            created_at: t.created_at || new Date().toISOString(),
        };
        await addDoc(collection(db, 'transaksi'), payload);
    },

    editTransaksi: async (id, t) => {
        const docRef = doc(db, 'transaksi', id);
        await updateDoc(docRef, { ...t });
    },

    lunasiHutang: async (id) => {
        const docRef = doc(db, 'transaksi', id);
        await updateDoc(docRef, { is_lunas: true });
    },

    hapusTransaksi: async (id) => {
        const docRef = doc(db, 'transaksi', id);
        await deleteDoc(docRef);
    },

    getTransaksiByUnit: (unit) => {
        return get().transaksi.filter((t) => t.unit === unit);
    },

    getSaldo: (unit) => {
        const items = get().transaksi.filter((t) => t.unit === unit);

        const totalPendapatan = items
            .filter((t) => t.tipe === 'MASUK')
            .reduce((sum, t) => sum + t.nominal, 0);

        const totalPengeluaranTunai = items
            .filter(
                (t) =>
                    t.tipe === 'KELUAR' &&
                    (t.status_pinjaman === 'Tunai' || t.status_pinjaman === null)
            )
            .reduce((sum, t) => sum + t.nominal, 0);

        const totalHutangLunas = items
            .filter(
                (t) =>
                    t.tipe === 'KELUAR' &&
                    t.status_pinjaman !== null &&
                    t.status_pinjaman !== 'Tunai' &&
                    t.is_lunas === true
            )
            .reduce((sum, t) => sum + t.nominal, 0);

        const totalHutangBelumLunas = items
            .filter(
                (t) =>
                    t.tipe === 'KELUAR' &&
                    t.status_pinjaman !== null &&
                    t.status_pinjaman !== 'Tunai' &&
                    t.is_lunas === false
            )
            .reduce((sum, t) => sum + t.nominal, 0);

        const hasilAkhir =
            totalPendapatan - totalPengeluaranTunai - totalHutangLunas;

        return {
            totalPendapatan,
            totalPengeluaranTunai,
            totalHutangLunas,
            hasilAkhir,
            totalHutangBelumLunas,
        };
    },
}));
