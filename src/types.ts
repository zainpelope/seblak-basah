export type Unit = 'BASAH' | 'KERING';
export type TipeTransaksi = 'MASUK' | 'KELUAR';

export const SUMBER_DANA_OPTIONS = [
  'Tunai',
  'Pulsa',
  'Voucher',
  'Minuman',
  'Seblak Kering',
  'Seblak Basah',
  'Lainnya...',
] as const;

export type SumberDana = (typeof SUMBER_DANA_OPTIONS)[number] | string;

export interface Transaksi {
  id: string;
  unit: Unit;
  tipe: TipeTransaksi;
  nominal: number;
  keterangan: string;
  status_pinjaman: string | null; // null for MASUK or Tunai
  is_lunas: boolean;
  created_at: string; // ISO date string
}
