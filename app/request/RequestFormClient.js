"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Shell from '@/components/Shell';
import Toast from '@/components/Toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

// Daftarkan locale Indonesia untuk DatePicker
registerLocale('id', id);

/**
 * Komponen RequestFormClient
 * 
 * Deskripsi: Formulir untuk membuat atau mengedit pengajuan transportasi.
 * Menangani input data pemohon, detail perjalanan, dan validasi waktu lokal.
 */
export default function RequestFormClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit'); // Ambil ID permohonan jika sedang dalam mode EDIT
    const [selectedDate, setSelectedDate] = useState(null);
    const [toast, setToast] = useState(null);

    // State untuk menampung data formulir
    const [formData, setFormData] = useState({
        nama: '',
        jabatan: '',
        bagian: '',
        macam_kendaraan: '',
        jumlah_penumpang: 1,
        tujuan: '',
        keperluan: '',
        tanggal_jam_berangkat: '',
        lama_pakai: ''
    });

    // Effect untuk mengambil data lama jika sedang mode EDIT
    useEffect(() => {
        if (editId) {
            const fetchRequest = async () => {
                try {
                    const data = await api.get(`/api/requests/${editId}`);

                    // Konversi string tanggal dari DB ke objek Date untuk DatePicker
                    if (data.tanggal_jam_berangkat) {
                        setSelectedDate(new Date(data.tanggal_jam_berangkat));
                    }

                    // Sinkronisasi data ke state formData
                    setFormData({
                        nama: data.nama || '',
                        jabatan: data.jabatan || '',
                        bagian: data.bagian || '',
                        macam_kendaraan: data.macam_kendaraan || '',
                        jumlah_penumpang: data.jumlah_penumpang || 1,
                        tujuan: data.tujuan || '',
                        keperluan: data.keperluan || '',
                        tanggal_jam_berangkat: data.tanggal_jam_berangkat || '',
                        lama_pakai: data.lama_pakai || ''
                    });
                } catch (err) {
                    console.error(err);
                    showToast('⚠️ Gagal mengambil data permohonan untuk diedit', 'error');
                }
            };
            fetchRequest();
        }
    }, [editId]);

    /**
     * Menangani perubahan input teks, angka, dan select
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'jumlah_penumpang' ? parseInt(value) || 1 : value }));
    };

    /**
     * Menangani perubahan tanggal dari DatePicker
     * Memastikan waktu yang dipilih tersimpan dengan offset zona waktu lokal (WIB)
     */
    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date) {
            // Format manual ke ISO string dengan menyertakan offset zona waktu
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = "00";

            // Hitung offset zona waktu (WIB biasanya +07:00)
            const timezoneOffset = -date.getTimezoneOffset();
            const offsetHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
            const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');
            const offsetSign = timezoneOffset >= 0 ? '+' : '-';
            const timezoneString = `${offsetSign}${offsetHours}:${offsetMinutes}`;

            const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneString}`;
            setFormData(prev => ({ ...prev, tanggal_jam_berangkat: localDateTime }));
        } else {
            setFormData(prev => ({ ...prev, tanggal_jam_berangkat: '' }));
        }
    };

    /**
     * Menampilkan pesan notifikasi toast
     */
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    /**
     * Mengirim data formulir ke API (Create / Update)
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi: pastikan tanggal sudah dipilih
        if (!selectedDate) {
            showToast('⚠️ Silakan pilih tanggal dan waktu keberangkatan', 'warning');
            return;
        }

        // Cek login user
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('⚠️ Sesi Anda telah berakhir. Silakan login kembali.', 'error');
            setTimeout(() => router.push('/'), 2000);
            return;
        }

        try {
            if (editId) {
                // Proses Edit: data dikirim ke endpoint PUT
                await api.put(`/api/requests/${editId}`, { ...formData, status: 'Pending Asmen/KKU' });
                showToast('✅ Permohonan telah diperbarui dan akan direview kembali.', 'success');
            } else {
                // Proses Buat Baru: data dikirim ke endpoint POST
                await api.post('/api/requests', formData);
                showToast('✅ Permohonan kendaraan Anda telah dikirim! Permohonan akan segera diproses oleh Asmen/KKU.', 'success');
            }
            // Arahkan kembali ke riwayat permohonan setelah sukses
            setTimeout(() => router.push('/my-requests'), 1500);
        } catch (err) {
            if (err.message === 'Unauthorized') {
                showToast('⚠️ Sesi Anda telah berakhir. Silakan login kembali.', 'error');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/');
            } else {
                showToast(`❌ Gagal mengirim permohonan: ${err.message}`, 'error');
            }
        }
    };

    return (
        <Shell>
            <div className="min-h-screen p-4 pt-12 md:p-8 lg:p-12 bg-white font-primary">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {editId ? 'Edit Pengajuan Kendaraan' : 'Pengajuan Kendaraan'}
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                {editId ? 'Perbarui data perjalanan Anda di bawah ini.' : 'Lengkapi data perjalanan Anda dengan benar.'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* SEKSI 1: IDENTITAS PEMOHON */}
                        <div className="glass-card p-6 md:p-8 bg-white border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-sky-700 mb-6 flex items-center tracking-tight">
                                <span className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center mr-3 text-sm text-white shadow-sm font-bold">1</span>
                                Informasi Pemohon
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-medium"
                                        placeholder="Nama Lengkap"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Jabatan</label>
                                    <input
                                        type="text"
                                        name="jabatan"
                                        value={formData.jabatan}
                                        onChange={handleChange}
                                        className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-medium"
                                        placeholder="Contoh: Manager / Supervisor"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Bagian / Bidang</label>
                                    <select
                                        name="bagian"
                                        value={formData.bagian}
                                        onChange={handleChange}
                                        className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-bold"
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Bidang --</option>
                                        <option value="Perencanaan">Perencanaan</option>
                                        <option value="Pemeliharaan">Pemeliharaan</option>
                                        <option value="Operasi Sistem Distribusi">Operasi Sistem Distribusi</option>
                                        <option value="Fasilitas Operasi">Fasilitas Operasi</option>
                                        <option value="KKU">KKU</option>
                                        <option value="K3L & KAM">K3L & KAM</option>
                                        <option value="Pengadaan">Pengadaan</option>
                                        <option value="UP3">UP3</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Macam Kendaraan</label>
                                    <select
                                        name="macam_kendaraan"
                                        value={formData.macam_kendaraan}
                                        onChange={handleChange}
                                        className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-bold"
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Jenis --</option>
                                        <option value="Toyota">Toyota</option>
                                        <option value="Daihatsu">Daihatsu</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SEKSI 2: DETAIL PERJALANAN */}
                        <div className="glass-card p-6 md:p-8 bg-white border border-slate-100 shadow-sm">
                            <h2 className="text-lg font-bold text-sky-700 mb-6 flex items-center tracking-tight">
                                <span className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center mr-3 text-sm text-white shadow-sm font-bold">2</span>
                                Detail Perjalanan
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi Tujuan</label>
                                    <input
                                        type="text"
                                        name="tujuan"
                                        value={formData.tujuan}
                                        onChange={handleChange}
                                        className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-medium"
                                        placeholder="Contoh: Kantor Wilayah / PLN ULP..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Keperluan</label>
                                    <textarea
                                        name="keperluan"
                                        value={formData.keperluan}
                                        onChange={handleChange}
                                        rows="4"
                                        className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-medium"
                                        placeholder="Sebutkan alasan atau aktivitas yang akan dilakukan..."
                                        required
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Tanggal & Waktu Berangkat
                                        </label>
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={handleDateChange}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="Waktu"
                                            dateFormat="dd MMMM yyyy, HH:mm"
                                            locale="id"
                                            placeholderText="Pilih tanggal dan waktu"
                                            className="glass-input w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                                            wrapperClassName="w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Jumlah Penumpang
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, jumlah_penumpang: Math.max(1, prev.jumlah_penumpang - 1) }))}
                                                className="w-12 h-12 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xl transition-all active:scale-95 flex items-center justify-center shadow-sm"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                name="jumlah_penumpang"
                                                value={formData.jumlah_penumpang}
                                                onChange={handleChange}
                                                min="1"
                                                max="20"
                                                className="flex-1 glass-input p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold text-center focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                                                placeholder="1"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, jumlah_penumpang: Math.min(20, prev.jumlah_penumpang + 1) }))}
                                                className="w-12 h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xl transition-all active:scale-95 flex items-center justify-center shadow-lg"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Estimasi Durasi Pakai
                                    </label>
                                    <input
                                        type="text"
                                        name="lama_pakai"
                                        value={formData.lama_pakai}
                                        onChange={handleChange}
                                        className="glass-input w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                                        placeholder="Contoh: 3 Jam / 1 Hari / 2 Hari"
                                    />
                                    <p className="text-xs text-slate-500 mt-2 font-medium">
                                        Berapa lama kendaraan akan digunakan?
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* TOMBOL AKSI */}
                        <div className="flex items-center justify-end gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 py-3 rounded-xl text-slate-500 hover:text-slate-900 transition-all font-bold"
                            >
                                Batal
                            </button>
                            <button type="submit" className="btn-primary px-16 shadow-xl active:scale-95 transition-all text-lg">
                                {editId ? '📝 Simpan Perubahan' : '🛫 Kirim Permohonan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Notifikasi Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </Shell>
    );
}
