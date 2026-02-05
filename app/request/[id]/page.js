"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, formatDisplayId } from '@/lib/api';
import Link from 'next/link';
import CameraCapture from '@/components/CameraCapture';
import Shell from '@/components/Shell';
import Toast from '@/components/Toast';

/**
 * Halaman Detail Permohonan (Dynamic Route)
 * 
 * Deskripsi: Halaman pusat untuk memantau siklus hidup satu permohonan.
 * Menampilkan fungsionalitas berbeda berdasarkan Role:
 * - Pemohon: Lihat detail & status.
 * - Asmen/KKU: Melakukan Approval (Persetujuan).
 * - Fleet Admin: Penugasan Unit & Pengemudi.
 * - Security: Melakukan Check-in/out di gerbang.
 */
export default function RequestDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [vehicles, setVehicles] = useState([]);

    // State untuk rejection approval
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // State untuk rejection fleet
    const [isRejectingFleet, setIsRejectingFleet] = useState(false);
    const [fleetRejectionReason, setFleetRejectionReason] = useState('');

    // State untuk form penugasan armada (Fleet)
    const [fleetData, setFleetData] = useState({
        mobil: '',
        platNomor: '',
        pengemudi: ''
    });

    // State untuk data keamanan (Security)
    const [securityData, setSecurityData] = useState({
        km: '',
        jam: new Date().toISOString().slice(0, 16),
        fotoDriver: null,
        fotoKm: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [minId, setMinId] = useState(null); // Untuk display ID sequential

    const [isEditingApprover, setIsEditingApprover] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    /**
     * Mengambil data inisial: Data User dan Detail Permohonan
     */
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const fetchRequest = async () => {
            if (!id) return;
            try {
                const data = await api.get(`/api/requests/${id}`);
                setRequest(data);
            } catch (err) {
                console.error("Detail Fetch Error:", err);
                showToast(`⚠️ Gagal mengambil data permohonan: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };

        const fetchVehicles = async () => {
            const isWaitingFleet = ['Menunggu Surat Jalan', 'Pending Fleet'].includes(request?.status);
            console.log('[Request Detail] Fetching vehicles. Status:', request?.status, 'Brand:', request?.macam_kendaraan);

            // Jika status membutuhkan penugasan armada, ambil daftar kendaraan tersedia
            if (isWaitingFleet && request?.macam_kendaraan) {
                try {
                    const data = await api.get(`/api/fleet?brand=${request.macam_kendaraan}`);
                    console.log('[Request Detail] Vehicles received:', data.length, data);
                    setVehicles(data);
                } catch (err) {
                    console.error('[Request Detail] Error fetching vehicles:', err);
                }
            }
        };

        const fetchMinId = async () => {
            try {
                const allRequests = await api.get('/api/requests');
                if (allRequests.length > 0) {
                    const min = Math.min(...allRequests.map(r => r.id));
                    setMinId(min);
                }
            } catch (err) {
                console.error('[Request Detail] Error fetching minId:', err);
            }
        };

        fetchRequest();
        fetchMinId();
        fetchVehicles();
    }, [id, request?.status, request?.macam_kendaraan]);

    /**
     * Fungsi handle Persetujuan (Approval)
     */
    const handleApproval = async () => {
        try {
            const payload = {
                requestId: id,
                action: 'approve',
                catatan,
                ...(editForm || {}) // Jika ada perubahan data perjalanan oleh Asmen
            };
            await api.post('/api/approval', payload);
            showToast('✅ Berhasil: Permohonan telah diperiksa dan disetujui', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error');
        }
    };

    /**
     * Fungsi handle Penolakan (Rejection)
     */
    const handleRejection = async () => {
        if (!rejectionReason.trim()) {
            showToast('❌ Alasan penolakan harus diisi!', 'error');
            return;
        }

        try {
            const payload = {
                requestId: id,
                action: 'reject',
                rejection_reason: rejectionReason,
                catatan
            };
            await api.post('/api/approval', payload);
            showToast('✅ Permohonan telah ditolak', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error');
        }
    };

    /**
     * Fungsi handle Penugasan Armada (Fleet Assignment)
     */
    const handleFleetAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/fleet', {
                requestId: id,
                ...fleetData
            });
            showToast('✅ Berhasil: Armada telah ditugaskan', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error');
        }
    };

    /**
     * Fungsi handle Penolakan Fleet
     */
    const handleFleetRejection = async () => {
        if (!fleetRejectionReason) {
            showToast('❌ Pilih alasan penolakan terlebih dahulu!', 'error');
            return;
        }

        try {
            await api.put('/api/fleet', {
                requestId: id,
                rejection_reason: fleetRejectionReason
            });
            showToast('✅ Penugasan fleet ditolak', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error');
        }
    };

    /**
     * Fungsi handle Pencatatan Security (Check-in/out)
     */
    const handleSecurityLog = async (type) => {
        // Prevent double submission
        if (isSubmitting) {
            console.log('[Security] Already submitting, ignoring duplicate request');
            return;
        }

        try {
            setIsSubmitting(true);

            // Validasi: KM harus diisi
            if (!securityData.km || securityData.km.trim() === '') {
                showToast('❌ Kilometer (KM) harus diisi!', 'error');
                setIsSubmitting(false);
                return;
            }

            // Validasi: KM harus angka positif
            const kmValue = parseInt(securityData.km);
            if (isNaN(kmValue) || kmValue < 0) {
                showToast('❌ Kilometer harus berupa angka positif!', 'error');
                setIsSubmitting(false);
                return;
            }

            const now = new Date();
            // Format waktu khusus GMT+7 untuk ketaatan database
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const offset = "+07:00";
            const jamGMT7 = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offset}`;

            await api.post('/api/security', {
                requestId: id,
                type,
                km: securityData.km,
                jam: jamGMT7,
                fotoDriver: securityData.fotoDriver,
                fotoKm: securityData.fotoKm
            });
            showToast(`✅ Berhasil: Data ${type === 'checkin' ? 'Keberangkatan' : 'Kepulangan'} tercatat`, 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            console.error('[Security Submit Error]:', err);
            showToast(`❌ ${err.message || 'Terjadi kesalahan saat submit'}`, 'error');
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Memuat...</div>;
    if (!request) return <div className="min-h-screen flex items-center justify-center text-white">Data tidak ditemukan</div>;

    /**
     * Helper: Mendapatkan skema warna label status
     */
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Asmen/KKU':
            case 'Perlu Revisi': return 'text-amber-700 bg-amber-50 border border-amber-200';
            case 'Menunggu Surat Jalan': return 'text-sky-700 bg-sky-50 border border-sky-200';
            case 'Ready': return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
            case 'In Progress': return 'text-purple-700 bg-purple-50 border border-purple-200';
            case 'Selesai': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
            default: return 'text-slate-600 bg-slate-50 border border-slate-200';
        }
    };

    /**
     * Helper: Memeriksa apakah user berwenang menyetujui bidang tertentu
     */
    const isAuthorizedApprover = () => {
        if (!user || !request) return false;

        const mapping = {
            'Asmen Perencanaan': 'Perencanaan',
            'Asmen Pemeliharaan': 'Pemeliharaan',
            'Asmen Operasi': 'Operasi Sistem Distribusi',
            'Asmen Fasop': 'Fasilitas Operasi'
        };

        const asmenFields = Object.values(mapping);

        // Jika user adalah Asmen di bidang yang sama dengan pengajuan
        if (mapping[user.role] === request.bagian) return true;

        // Jika user adalah KKU dan pengajuan bukan dari 4 bidang asmen di atas (misal: pengajuan umum/SDM)
        if (user.role === 'KKU' && !asmenFields.includes(request.bagian)) return true;

        return false;
    };

    const handleEditChange = (name, value) => {
        if (!editForm) {
            setEditForm({ ...request, [name]: value });
        } else {
            setEditForm({ ...editForm, [name]: value });
        }
    };

    return (
        <Shell>
            <div className="min-h-screen p-4 md:p-8 lg:p-12 bg-white font-primary">
                <div className="max-w-4xl mx-auto">
                    {/* Header: Judul & Status */}
                    <div className="flex items-center justify-between mb-8 overflow-x-auto">
                        <div>
                            <button onClick={() => window.location.href = '/my-requests'} className="text-slate-500 hover:text-slate-900 mb-2 inline-block font-bold">← Kembali</button>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Detail Permohonan #{formatDisplayId(id, minId)}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-slate-500 font-medium">Status: <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(request.status)}`}>{request.status}</span></p>
                                {request.status === 'Pending Asmen/KKU' && (
                                    <span className="text-slate-400 text-xs font-medium italic">Menunggu pemeriksaan Bidang {request.bagian}</span>
                                )}
                            </div>
                        </div>
                        {/* Tombol Cetak (Hanya jika sudah ada penetapan armada) */}
                        {['Ready', 'In Progress', 'Selesai'].includes(request.status) && (
                            <Link
                                href={`/request/${id}/print`}
                                target="_blank"
                                className="btn-primary bg-slate-700 hover:bg-slate-600 animate-in fade-in slide-in-from-right-2 duration-300"
                            >
                                🖨️ Cetak Surat Jalan
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Bagian: Informasi Pemohon */}
                        <div className="glass-card p-6 bg-white shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-sky-700 mb-4 tracking-tight">Informasi Pemohon</h2>
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between"><span className="text-slate-400">Nama</span> <span className="text-slate-900 font-bold">{request.nama}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Jabatan</span> <span className="text-slate-800">{request.jabatan}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Bagian</span> <span className="text-slate-800">{request.bagian}</span></div>
                            </div>
                        </div>

                        {/* Bagian: Detail Perjalanan (Bisa diedit oleh Asmen saat approval) */}
                        <div className="glass-card p-6 bg-white shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-sky-700 tracking-tight">Detail Perjalanan</h2>
                                {['Pending Asmen/KKU', 'Perlu Revisi'].includes(request.status) && isAuthorizedApprover() && (
                                    <button
                                        onClick={() => setIsEditingApprover(!isEditingApprover)}
                                        className="text-sky-600 hover:text-sky-800 text-xs font-bold"
                                    >
                                        {isEditingApprover ? 'Batal Edit' : '📝 Edit Data'}
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex flex-col">
                                    <span className="text-slate-400 mb-1">Tujuan</span>
                                    {isEditingApprover ? (
                                        <input
                                            value={editForm?.tujuan ?? request.tujuan}
                                            onChange={(e) => handleEditChange('tujuan', e.target.value)}
                                            className="p-2 border rounded bg-slate-50 text-slate-900 font-bold"
                                        />
                                    ) : (
                                        <span className="text-slate-900 font-bold">{request.tujuan}</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-slate-400 mb-1">Keperluan</span>
                                    {isEditingApprover ? (
                                        <textarea
                                            value={editForm?.keperluan ?? request.keperluan}
                                            onChange={(e) => handleEditChange('keperluan', e.target.value)}
                                            className="p-2 border rounded bg-slate-50 text-slate-800"
                                            rows="2"
                                        />
                                    ) : (
                                        <span className="text-slate-800">{request.keperluan}</span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Waktu</span>
                                    <span className="text-slate-900 font-mono font-bold capitalize">
                                        {new Date(request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Logistik */}
                    <div className="glass-card p-6 mb-6 bg-white shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-sky-700 mb-4 tracking-tight">Logistik & Armada</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-medium">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-widest mb-1">Jenis Kendaraan</span>
                                {isEditingApprover ? (
                                    <select
                                        value={editForm?.macam_kendaraan ?? request.macam_kendaraan}
                                        onChange={(e) => handleEditChange('macam_kendaraan', e.target.value)}
                                        className="w-full bg-transparent font-bold text-slate-900 border-b border-sky-300 focus:outline-none"
                                    >
                                        <option value="Toyota">Toyota</option>
                                        <option value="Daihatsu">Daihatsu</option>
                                    </select>
                                ) : (
                                    <span className="text-slate-900 font-bold">{request.macam_kendaraan || '-'}</span>
                                )}
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-widest mb-1">Penumpang</span>
                                {isEditingApprover ? (
                                    <input
                                        type="number"
                                        value={editForm?.jumlah_penumpang ?? request.jumlah_penumpang}
                                        onChange={(e) => handleEditChange('jumlah_penumpang', e.target.value)}
                                        className="w-full bg-transparent font-bold text-slate-900 border-b border-sky-300 focus:outline-none"
                                    />
                                ) : (
                                    <span className="text-slate-900 font-bold">{request.jumlah_penumpang} Orang</span>
                                )}
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-widest mb-1">Estimasi Pakai</span>
                                <span className="text-slate-900 font-bold">{request.lama_pakai || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Alur Kerja (Workflow Steps) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Status Persetujuan */}
                        <div className={`glass-card p-4 border-l-4 bg-white shadow-sm border-slate-100 ${request.approvals?.[0]?.is_approved ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Persetujuan Asmen</h3>
                            <p className="text-slate-900 text-sm font-bold">{request.approvals?.[0]?.is_approved ? 'Disetujui' : 'Menunggu'}</p>
                            {request.approvals?.[0]?.catatan && <p className="text-xs text-slate-500 mt-1 italic font-medium">"{request.approvals[0].catatan}"</p>}
                        </div>

                        {/* Status Armada */}
                        <div className={`glass-card p-4 border-l-4 bg-white shadow-sm border-slate-100 ${request.fleet?.[0] ? 'border-l-sky-500' : 'border-l-slate-200'}`}>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Penugasan Kendaraan</h3>
                            {request.fleet?.[0] ? (
                                <div className="text-xs space-y-1 font-medium">
                                    <p className="text-slate-900 font-bold">{request.fleet[0].mobil} ({request.fleet[0].plat_nomor})</p>
                                    <p className="text-slate-500">Driver: {request.fleet[0].pengemudi}</p>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm italic font-medium">Belum ditentukan</p>
                            )}
                        </div>

                        {/* Status Keamanan */}
                        <div className={`glass-card p-4 border-l-4 bg-white shadow-sm border-slate-100 ${request.securityLogs?.[0]?.jam_berangkat ? 'border-l-purple-500' : 'border-l-slate-200'}`}>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Keamanan (Log KM)</h3>
                            {request.securityLogs?.[0] ? (
                                <div className="text-xs space-y-1 font-medium">
                                    <p className="text-slate-900 font-bold">KM Awal: {request.securityLogs[0].km_awal || '-'}</p>
                                    <p className="text-slate-900 font-bold">KM Akhir: {request.securityLogs[0].km_akhir || '-'}</p>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm italic font-medium">Belum tercatat</p>
                            )}
                        </div>
                    </div>

                    {/* AKSI: Persetujuan (Hanya muncul untuk role Asmen/KKU yang berwenang) */}
                    {['Pending Asmen/KKU', 'Perlu Revisi'].includes(request.status) && isAuthorizedApprover() && (
                        <div className="glass-card p-6 mt-8 border-t-4 border-emerald-500 bg-white shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Pemeriksaan & Persetujuan</h2>
                                {isEditingApprover && <span className="text-rose-500 text-xs font-bold animate-pulse">● Sedang Mengubah Data Perjalanan</span>}
                            </div>
                            <p className="text-slate-500 text-sm mb-4">Sebagai <strong>{user?.role}</strong>, Anda bertanggung jawab atas kebenaran data di atas sebelum menyetujui.</p>

                            {!isRejecting ? (
                                <>
                                    <textarea
                                        value={catatan}
                                        onChange={(e) => setCatatan(e.target.value)}
                                        className="glass-input w-full p-4 rounded-xl mb-4 bg-slate-50 border-slate-200"
                                        placeholder="Tambahkan catatan untuk pemohon..."
                                        rows="3"
                                    ></textarea>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <button
                                            onClick={handleApproval}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                                        >
                                            ✅ Simpan & Setujui Permohonan
                                        </button>
                                        <button
                                            onClick={() => setIsRejecting(true)}
                                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                                        >
                                            ❌ Tolak Permohonan
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 sm:p-4 mb-4">
                                        <h3 className="text-rose-700 font-bold mb-2 text-sm sm:text-base">Alasan Penolakan</h3>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full p-3 border border-rose-300 rounded-lg bg-white text-sm sm:text-base"
                                            placeholder="Jelaskan alasan penolakan permohonan ini..."
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <button
                                            onClick={() => setIsRejecting(false)}
                                            className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleRejection}
                                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                                        >
                                            ❌ Konfirmasi Penolakan
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* AKSI: Penugasan Unit (Hanya muncul untuk KKU/Admin) */}
                    {['Menunggu Surat Jalan', 'Pending Fleet'].includes(request.status) && user && (['KKU', 'Admin'].includes(user.role)) && (
                        <div className="glass-card p-4 sm:p-6 mt-8 border-t-4 border-sky-500 bg-white shadow-xl">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 tracking-tight">Penerbitan Surat Jalan</h2>

                            {!isRejectingFleet ? (
                                <>
                                    <form onSubmit={handleFleetAssignment} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Kendaraan ({request.macam_kendaraan})</label>
                                            <select
                                                className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-bold"
                                                required
                                                onChange={(e) => {
                                                    const v = vehicles.find(v => v.plat_nomor === e.target.value);
                                                    setFleetData(prev => ({ ...prev, mobil: v ? `${v.brand} ${v.model}` : '', platNomor: e.target.value }));
                                                }}
                                            >
                                                <option value="">-- Pilih Unit Tersedia --</option>
                                                {vehicles.map(v => (
                                                    <option key={v.id} value={v.plat_nomor}>{v.brand} {v.model} - {v.plat_nomor}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pengemudi</label>
                                            <input
                                                type="text"
                                                className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-bold"
                                                placeholder="Masukkan nama driver..."
                                                required
                                                value={fleetData.pengemudi}
                                                onChange={(e) => setFleetData(prev => ({ ...prev, pengemudi: e.target.value }))}
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <button type="submit" className="flex-1 btn-primary py-3 sm:py-4 rounded-xl shadow-lg font-bold text-sm sm:text-lg active:scale-[0.98] transition-all">
                                                🚀 Konfirmasi & Terbitkan Surat Jalan
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsRejectingFleet(true)}
                                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                                            >
                                                ❌ Tolak Penugasan
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 sm:p-4 mb-4">
                                        <h3 className="text-rose-700 font-bold mb-2 text-sm sm:text-base">Alasan Penolakan Fleet</h3>
                                        <select
                                            value={fleetRejectionReason}
                                            onChange={(e) => setFleetRejectionReason(e.target.value)}
                                            className="w-full p-3 border border-rose-300 rounded-lg bg-white font-bold text-sm sm:text-base"
                                        >
                                            <option value="">-- Pilih Alasan --</option>
                                            <option value="BBM Habis/Kritis">BBM Habis/Kritis</option>
                                            <option value="Mobil lagi service">Mobil lagi service</option>
                                            <option value="Mobil lagi dipakai Manager">Mobil lagi dipakai Manager</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <button
                                            onClick={() => setIsRejectingFleet(false)}
                                            className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleFleetRejection}
                                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                                        >
                                            ❌ Konfirmasi Penolakan
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* AKSI: Pos Security (Check-in/out KM & Foto) */}
                    {(['Ready', 'In Progress'].includes(request.status)) && user && (user.role === 'Security') && (
                        <div className="glass-card p-6 mt-8 border-t-4 border-slate-900 bg-white shadow-xl">
                            <h2 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                                {request.status === 'Ready' ? 'Pos Security: Keberangkatan' : 'Pos Security: Kepulangan'}
                            </h2>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Dokumentasikan KM dan Pengemudi sebelum kendaraan bergerak.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <CameraCapture
                                    label="Foto Pengemudi"
                                    onCapture={(img) => setSecurityData(prev => ({ ...prev, fotoDriver: img }))}
                                />
                                <CameraCapture
                                    label="Foto Odometer (KM)"
                                    onCapture={(img) => setSecurityData(prev => ({ ...prev, fotoKm: img }))}
                                />
                            </div>

                            {/* Tombol Konfirmasi muncul jika kedua foto sudah diambil */}
                            {securityData.fotoDriver && securityData.fotoKm ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Kilometer (Lari KM)</label>
                                        <input
                                            type="number"
                                            className="glass-input w-full p-4 rounded-xl bg-slate-50 border-slate-200 text-slate-900 font-bold"
                                            placeholder="Masukkan angka KM..."
                                            value={securityData.km}
                                            onChange={(e) => setSecurityData(prev => ({ ...prev, km: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSecurityLog(request.status === 'Ready' ? 'checkin' : 'checkout')}
                                        disabled={isSubmitting}
                                        className={`btn-primary w-full py-5 text-xl rounded-xl shadow-xl font-bold transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                                    >
                                        {isSubmitting ? '⏳ Memproses...' : (request.status === 'Ready' ? '✅ Konfirmasi Keberangkatan' : '🏁 Konfirmasi Kedatangan')}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-sm font-bold">
                                    📸 Harap ambil DATA FOTO untuk memunculkan formulir input.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Komponen Toast Notifikasi */}
            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }
        </Shell >
    );
}
