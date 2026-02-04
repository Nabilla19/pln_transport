"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, formatDisplayId } from '@/lib/api';

/**
 * Halaman Cetak Surat Jalan (Print Optimized)
 * 
 * Deskripsi: Halaman yang diformat khusus untuk pencetakan dokumen fisik.
 * Menyusun data teknis (KM, Foto, E-Signature) ke dalam format surat formal PLN.
 */
export default function PrintRequestPage() {
    const { id } = useParams();
    const router = useRouter();
    const [request, setRequest] = useState(null);
    const [minId, setMinId] = useState(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const data = await api.get(`/api/requests/${id}`);
                setRequest(data);
                // Memicu dialog cetak otomatis setelah data dimuat (delay 2.5 detik untuk render QR/Image)
                setTimeout(() => window.print(), 2500);
            } catch (err) {
                console.error(err);
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
                console.error('Error fetching minId:', err);
            }
        };

        fetchRequest();
        fetchMinId();
    }, [id]);

    if (!request) return <div className="p-8 text-center text-black font-sans">Memuat data cetak...</div>;

    const fleet = request.fleet?.[0];
    const security = request.securityLogs?.[0];
    const approval = request.approvals?.[0];

    const displayId = formatDisplayId(id, minId);

    /**
     * Helper: Memastikan format Base64 memiliki prefix yang benar untuk tag <img>
     */
    const formatBase64 = (str) => {
        if (!str) return null;
        if (str.startsWith('data:image')) return str;
        return `data:image/jpeg;base64,${str}`;
    };

    /**
     * Helper: Menghasilkan teks deskriptif untuk dimasukkan ke dalam QR Code Verifikasi
     */
    const generateQRData = (type) => {
        const docId = formatDisplayId(id, minId);

        if (type === 'pemohon') {
            const tgl = new Date(request.created_at || request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            const jam = new Date(request.created_at || request.tanggal_jam_berangkat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return `Surat ini sudah diajukan oleh PEMOHON ${request.nama || request.user?.name} pada tanggal ${tgl} dan waktu ${jam} WIB.`;
        }

        if (type === 'approver' && approval) {
            const tgl = new Date(approval.approved_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            const jam = new Date(approval.approved_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            let role = approval.asmen?.role || 'ASMEN';
            if (role === 'Admin Fleet') role = 'KKU';
            return `Surat ini sudah di-approve oleh ${role} ${approval.asmen?.name || '-'} pada tanggal ${tgl} dan waktu ${jam} WIB.`;
        }

        if (type === 'fleet' && fleet) {
            const tgl = new Date(fleet.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            const jam = new Date(fleet.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return `Surat ini sudah di-approve oleh KKU ${fleet.admin?.name || '-'} pada tanggal ${tgl} dan waktu ${jam} WIB.`;
        }

        return `DOKUMEN E-TRANSPORT ID: #${displayId}`;
    };

    return (
        <div className="print-view-wrapper bg-white min-h-screen p-4 relative" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { 
                        background: white !important; 
                        color: black !important; 
                        margin: 0;
                        padding: 0;
                    }
                    @page {
                        size: A4;
                        margin: 0.5cm;
                    }
                }
                
                .document-body, .document-body * {
                    color: black !important;
                    border-color: black !important;
                }

                /* Watermark C merah di tengah */
                .watermark-c {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 500px;
                    font-weight: 900;
                    color: rgba(220, 38, 38, 0.08);
                    z-index: 0;
                    pointer-events: none;
                    font-family: 'Arial Black', sans-serif;
                    user-select: none;
                }

                .document-body {
                    position: relative;
                    z-index: 1;
                }
            `}</style>

            {/* Watermark C */}
            <div className="watermark-c">C</div>

            <div className="mx-auto max-w-[21cm] document-body border border-gray-100 p-4 print:border-0 print:p-0">
                {/* 1. KOP SURAT (Header PLN) */}
                <div className="flex items-center gap-4 border-b-4 border-black pb-2 mb-4">
                    <img src="/images/logo-pln.png" alt="Logo PLN" className="w-14 h-auto" />
                    <div className="flex-1">
                        <h1 className="text-[12px] font-bold leading-tight uppercase">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                        <div className="h-px bg-black my-0.5"></div>
                        <p className="text-[10px] font-semibold">UNIT PELAKSANA PENGATUR DISTRIBUSI RIAU (UP2D)</p>
                        <p className="text-[8px]">Alamat: Jl. Setia Budi No. 96, Pekanbaru</p>
                    </div>
                </div>

                {/* JUDUL DOKUMEN */}
                <div className="text-center mb-6">
                    <h2 className="text-lg font-bold uppercase underline decoration-2">SURAT JALAN KENDARAAN DINAS</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1">
                        NOMOR SURAT: #{displayId}/{new Date(request.created_at || request.tanggal_jam_berangkat).toLocaleString('id-ID', { month: 'short' }).toUpperCase().slice(0, 3)}/UP2D-RIAU/{new Date(request.created_at || request.tanggal_jam_berangkat).getFullYear()}
                    </p>
                </div>

                {/* 2. DATA PEMOHON */}
                <div className="border border-black mb-2">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-[10pt] uppercase">I. DATA PEMOHON</div>
                    <div className="p-3">
                        <table className="w-full text-[11pt]">
                            <tbody>
                                <tr>
                                    <td className="w-32 py-1 font-bold">Nama</td><td className="w-3">:</td><td className="py-1">{request.nama || request.user?.name}</td>
                                    <td className="w-32 py-1 font-bold pl-4">Jabatan</td><td className="w-3">:</td><td className="py-1">{request.jabatan || request.user?.role}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Bidang</td><td>:</td><td className="py-1">{request.bagian}</td>
                                    <td className="py-1 font-bold pl-4">Unit Kendaraan</td><td>:</td><td className="py-1">{request.macam_kendaraan || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Tujuan</td><td>:</td><td className="py-1 uppercase">{request.tujuan}</td>
                                    <td className="py-1 font-bold pl-4">Penumpang</td><td>:</td><td className="py-1">{request.jumlah_penumpang || '-'} orang</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Berangkat</td><td>:</td><td className="py-1">
                                        {new Date(request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="py-1 font-bold pl-4">Etimasi Pakai</td><td>:</td><td className="py-1">{request.lama_pakai || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold align-top">Keperluan</td><td className="align-top">:</td><td colSpan="4" className="py-1">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. SURAT PERINTAH JALAN (Data Armada) */}
                <div className="border border-black mb-2">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-[10pt] uppercase">II. SURAT PERINTAH JALAN</div>
                    <div className="p-3">
                        <table className="w-full text-[11pt]">
                            <tbody>
                                <tr>
                                    <td className="w-32 py-1 font-bold">Kendaraan</td><td className="w-3">:</td><td className="py-1 uppercase">{fleet?.mobil || '.....................'}</td>
                                    <td className="w-32 py-1 font-bold pl-4">No. Polisi</td><td className="w-3">:</td><td className="py-1 tracking-wider">{fleet?.plat_nomor || '............'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Pengemudi</td><td>:</td><td className="py-1 uppercase">{fleet?.pengemudi || '.....................'}</td>
                                    <td className="py-1 font-bold pl-4">Dispatcher</td><td>:</td><td className="py-1">{fleet?.admin?.name || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. DATA SECURITY CHECK (Monitoring KM) */}
                <div className="border border-black mb-2">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-[10pt] uppercase">III. MONITORING POS SECURITY</div>
                    <div className="p-3">
                        <table className="w-full text-[11pt]">
                            <tbody>
                                <tr>
                                    <td className="w-32 py-1 font-bold">KM Awal</td><td className="w-3">:</td><td className="py-1">{security?.km_awal} KM</td>
                                    <td className="w-32 py-1 font-bold pl-4">KM Akhir</td><td className="w-3">:</td><td className="py-1">{security?.km_akhir ? `${security.km_akhir} KM` : '..........'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Jarak</td><td>:</td><td className="py-1">{(security?.jarak_tempuh !== null && security?.jarak_tempuh !== undefined) ? `${security.jarak_tempuh} KM` : '..........'}</td>
                                    <td className="py-1 font-bold pl-4">Waktu Pakai</td><td>:</td><td className="py-1">{security?.lama_waktu || '............'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Jam Keluar</td><td>:</td><td className="py-1">{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="py-1 font-bold pl-4">Jam Masuk</td><td>:</td><td className="py-1">{security?.jam_kembali ? new Date(security.jam_kembali).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. TANDA TANGAN DIGITAL (E-SIGNATURE) */}
                <div className="border border-black mb-2 p-3">
                    <div className="grid grid-cols-3 gap-12 text-center">
                        {/* TTD Pemohon */}
                        <div className="flex flex-col items-center">
                            <p className="text-[8px] font-bold mb-1 uppercase text-gray-400 font-sans">Pemohon</p>
                            <div className="w-20 h-20 border border-black p-0.5 mb-1">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                            </div>
                            <p className="text-[9px] underline uppercase">{request.nama || request.user?.name}</p>
                        </div>
                        {/* TTD Approver (Asmen/KKU) */}
                        <div className="flex flex-col items-center">
                            <p className="text-[8px] font-bold mb-1 uppercase text-gray-400 font-sans">Menyetujui,</p>
                            <div className="w-20 h-20 border border-black p-0.5 mb-1">
                                {approval?.barcode_asmen ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[6px] italic text-gray-300">WAITING</div>
                                )}
                            </div>
                            <p className="text-[9px] underline uppercase">{approval?.asmen?.name || '-'}</p>
                        </div>
                        {/* TTD Bagian Fleet/KKU */}
                        <div className="flex flex-col items-center">
                            <p className="text-[8px] font-bold mb-1 uppercase text-gray-400 font-sans">KKU</p>
                            <div className="w-20 h-20 border border-black p-0.5 mb-1">
                                {fleet?.barcode_fleet ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[6px] italic text-gray-300">WAITING</div>
                                )}
                            </div>
                            <p className="text-[9px] underline uppercase">{fleet?.admin?.name || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* 6. DOKUMENTASI FOTO (Lampiran Keberangkatan & Kepulangan) */}
                <div className="border border-black overflow-hidden mb-1">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 text-center font-bold text-[8px] uppercase tracking-[3px] italic">Lampiran Dokumentasi Foto</div>
                    <div className="p-1.5">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Dokumentasi Berangkat */}
                            <div className="space-y-1">
                                <p className="text-center font-bold text-[7px] uppercase text-gray-500">Foto Saat Berangkat</p>
                                <div className="grid grid-cols-2 gap-1 px-4">
                                    <div className="border border-black aspect-[3/4] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_driver_berangkat ? <img src={formatBase64(security.foto_driver_berangkat)} className="w-full h-full object-cover" alt="Dvr" /> : <span className="text-[6px] italic font-normal text-gray-300">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-[3/4] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_km_berangkat ? <img src={formatBase64(security.foto_km_berangkat)} className="w-full h-full object-cover" alt="KM" /> : <span className="text-[6px] italic font-normal text-gray-300">Odo</span>}
                                    </div>
                                </div>
                            </div>
                            {/* Dokumentasi Kembali */}
                            <div className="space-y-1">
                                <p className="text-center font-bold text-[7px] uppercase text-gray-500">Foto Saat Kembali</p>
                                <div className="grid grid-cols-2 gap-1 px-4">
                                    <div className="border border-black aspect-[3/4] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_driver_kembali ? <img src={formatBase64(security.foto_driver_kembali)} className="w-full h-full object-cover" alt="Dvr" /> : <span className="text-[6px] italic font-normal text-gray-300">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-[3/4] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_km_kembali ? <img src={formatBase64(security.foto_km_kembali)} className="w-full h-full object-cover" alt="KM" /> : <span className="text-[6px] italic font-normal text-gray-300">Odo</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[6pt] italic font-bold text-gray-300">Sistem E-Transport UP2D Riau | Doc Created: {new Date().toLocaleString('id-ID')} WIB</p>
                </div>
            </div>

            {/* Tombol Print (Hanya tampak di layar, tidak saat dicetak) */}
            <div className="flex justify-center print:hidden mt-8 mb-12">
                <button
                    onClick={() => window.print()}
                    className="px-10 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl"
                >
                    🖨️ PRINT SEKARANG
                </button>
            </div>
        </div>
    );
}
