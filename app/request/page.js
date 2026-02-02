"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Shell from '@/components/Shell';
import Toast from '@/components/Toast';
import DatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('id', id);

export default function RequestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const [selectedDate, setSelectedDate] = useState(null);
    const [toast, setToast] = useState(null);
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

    useEffect(() => {
        if (editId) {
            const fetchRequest = async () => {
                try {
                    const data = await api.get(`/api/requests/${editId}`);

                    // Parse date for DatePicker
                    if (data.tanggal_jam_berangkat) {
                        setSelectedDate(new Date(data.tanggal_jam_berangkat));
                    }

                    // Format the date for datetime-local input
                    if (data.tanggal_jam_berangkat) {
                        data.tanggal_jam_berangkat = new Date(data.tanggal_jam_berangkat)
                            .toISOString().slice(0, 16);
                    }
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'jumlah_penumpang' ? parseInt(value) || 1 : value }));
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date) {
            // Format date to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = '00';

            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            setFormData(prev => ({ ...prev, tanggal_jam_berangkat: formattedDate }));
        } else {
            setFormData(prev => ({ ...prev, tanggal_jam_berangkat: '' }));
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate date is selected
        if (!selectedDate) {
            showToast('⚠️ Silakan pilih tanggal dan waktu keberangkatan', 'warning');
            return;
        }

        // Validate date is not in the past
        const now = new Date();
        if (selectedDate < now) {
            showToast('⚠️ Tanggal dan waktu keberangkatan tidak boleh di masa lalu!', 'error');
            return;
        }

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('⚠️ Sesi Anda telah berakhir. Silakan login kembali.', 'error');
            setTimeout(() => router.push('/'), 2000);
            return;
        }

        try {
            if (editId) {
                // When editing, also reset status to pending for re-approval
                await api.put(`/api/requests/${editId}`, { ...formData, status: 'Pending Asmen/KKU' });
                showToast('✅ Permohonan telah diperbarui dan akan direview kembali.', 'success');
            } else {
                await api.post('/api/requests', formData);
                showToast('✅ Permohonan kendaraan Anda telah dikirim! Permohonan akan segera diproses oleh Asmen/KKU.', 'success');
            }
            setTimeout(() => router.push('/my-requests'), 1500);
        } catch (err) {
            // Handle specific error cases
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
            <div className="min-h-screen p-4 md:p-8 lg:p-12 bg-white font-primary">
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
                                        <option value="Operasi">Operasi</option>
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
                                            📅 Tanggal & Waktu Berangkat
                                        </label>
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={handleDateChange}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="Waktu"
                                            dateFormat="dd MMMM yyyy, HH:mm"
                                            minDate={new Date()}
                                            locale="id"
                                            placeholderText="Pilih tanggal dan waktu"
                                            className="glass-input w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                                            wrapperClassName="w-full"
                                            required
                                        />
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            ⏰ Minimal H-1 dari hari ini
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Jumlah Penumpang
                                        </label>
                                        <input
                                            type="number"
                                            name="jumlah_penumpang"
                                            value={formData.jumlah_penumpang}
                                            onChange={handleChange}
                                            min="1"
                                            max="20"
                                            className="glass-input w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                                            placeholder="Jumlah penumpang"
                                            required
                                        />
                                        <p className="text-xs text-slate-500 mt-2 font-medium">
                                            👥 Maksimal 20 orang
                                        </p>
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
                                        ⏱️ Berapa lama kendaraan akan digunakan?
                                    </p>
                                </div>
                            </div>
                        </div>

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

            {/* Toast Notification */}
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
