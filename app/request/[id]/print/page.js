"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function PrintRequestPage() {
    const { id } = useParams();
    const router = useRouter();
    const [request, setRequest] = useState(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const data = await api.get(`/api/requests/${id}`);
                setRequest(data);
                // Trigger print
                setTimeout(() => window.print(), 2500);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRequest();
    }, [id]);

    if (!request) return <div className="p-8 text-center text-black font-sans">Memuat data cetak...</div>;

    const fleet = request.fleet?.[0];
    const security = request.securityLogs?.[0];
    const approval = request.approvals?.[0];

    // Helper to ensure base64 has correct prefix for <img> tag
    const formatBase64 = (str) => {
        if (!str) return null;
        if (str.startsWith('data:image')) return str;
        // Fallback assuming it's a raw base64 jpeg if no prefix
        return `data:image/jpeg;base64,${str}`;
    };

    const generateQRData = (type) => {
        const docId = String(id).padStart(4, '0');

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
            const role = approval.asmen?.role || 'ASMEN';
            return `Surat ini sudah di-approve oleh ${role} ${approval.asmen?.name || '-'} pada tanggal ${tgl} dan waktu ${jam} WIB.`;
        }

        if (type === 'fleet' && fleet) {
            const tgl = new Date(fleet.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            const jam = new Date(fleet.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return `Surat ini sudah di-approve oleh KKU ${fleet.admin?.name || '-'} pada tanggal ${tgl} dan waktu ${jam} WIB.`;
        }

        return `DOKUMEN E-TRANSPORT ID: #${docId}`;
    };

    return (
        <div className="print-view-wrapper bg-white min-h-screen p-4 font-serif relative">
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
                
                .no-print button {
                    color: white !important;
                }
                .no-print .bg-white {
                    color: black !important;
                }
            `}</style>

            <div className="mx-auto max-w-[21cm] document-body border border-gray-100 p-4 print:border-0 print:p-0">
                {/* 1. KOP SURAT */}
                <div className="flex items-center gap-4 border-b-4 border-black pb-2 mb-4">
                    <img src="/images/logo-pln.png" alt="Logo PLN" className="w-14 h-auto" />
                    <div className="flex-1">
                        <h1 className="text-[12px] font-bold leading-tight uppercase">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                        <div className="h-px bg-black my-0.5"></div>
                        <p className="text-[10px] font-semibold">UNIT PELAKSANA PENGATUR DISTRIBUSI RIAU (UP2D)</p>
                        <p className="text-[8px]">Alamat: Jl. Setia Budi No. 96, Pekanbaru</p>
                    </div>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-3">
                    <h2 className="text-sm font-bold uppercase underline decoration-1">PERMOHONAN ANGKUTAN</h2>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5">UNTUK KEPERLUAN DINAS / SOSIAL</p>
                    <p className="text-[8px] font-semibold">No: {String(id).padStart(4, '0')}/TRS/UP2D-RIAU/{new Date().getFullYear()}</p>
                </div>

                {/* 2. DATA PEMOHON */}
                <div className="border border-black mb-2">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-[9px] uppercase italic">I. Data Pemohon</div>
                    <div className="p-1.5">
                        <table className="w-full text-[9pt]">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-32 py-0.5 font-bold text-gray-700">Nama</td><td className="w-3">:</td><td className="font-normal">{request.nama || request.user?.name}</td>
                                    <td className="w-32 py-0.5 font-bold pl-4 text-gray-700">Jabatan</td><td className="w-3">:</td><td className="font-normal">{request.jabatan || request.user?.role}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-0.5 font-bold text-gray-700">Bidang</td><td>:</td><td className="font-normal">{request.bagian}</td>
                                    <td className="py-0.5 font-bold pl-4 text-gray-700">Unit Kendaraan</td><td>:</td><td className="font-normal">{request.macam_kendaraan || '-'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-0.5 font-bold text-gray-700">Tujuan</td><td>:</td><td className="uppercase font-normal">{request.tujuan}</td>
                                    <td className="py-0.5 font-bold pl-4 text-gray-700">Penumpang</td><td>:</td><td className="font-normal">{request.jumlah_penumpang || '-'} orang</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-0.5 font-bold text-gray-700">Berangkat</td><td>:</td><td className="font-normal">{new Date(request.tanggal_jam_berangkat).toLocaleString('id-ID')}</td>
                                    <td className="py-0.5 font-bold pl-4 text-gray-700">Etimasi Pakai</td><td>:</td><td className="font-normal">{request.lama_pakai || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-700">Keperluan</td><td>:</td><td colSpan="4" className="font-normal italic text-[8pt]">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. SURAT PERINTAH JALAN */}
                <div className="border border-black mb-2">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-[9px] uppercase italic">II. Surat Perintah Jalan</div>
                    <div className="p-1.5 text-[9pt]">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-32 py-0.5 font-bold text-gray-700">Kendaraan</td><td className="w-3">:</td><td className="font-normal uppercase">{fleet?.mobil || '.....................'}</td>
                                    <td className="w-32 py-0.5 font-bold pl-4 text-gray-700">No. Polisi</td><td className="w-3">:</td><td className="font-normal tracking-wider">{fleet?.plat_nomor || '............'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-700">Pengemudi</td><td>:</td><td className="font-normal uppercase italic">{fleet?.pengemudi || '.....................'}</td>
                                    <td className="py-0.5 font-bold pl-4 text-gray-700">Dispatcher</td><td>:</td><td className="font-normal">{fleet?.admin?.name || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. DATA SECURITY CHECK */}
                <div className="border border-black mb-2">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-[9px] uppercase italic">III. Monitoring Pos Security</div>
                    <div className="p-1.5 text-[9pt]">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-32 py-0.5 font-bold text-gray-700">KM Awal</td><td className="w-3">:</td><td className="font-normal">{security?.km_awal} KM</td>
                                    <td className="w-32 py-0.5 font-bold pl-4 text-gray-700">KM Akhir</td><td className="w-3">:</td><td className="font-normal">{security?.km_akhir ? `${security.km_akhir} KM` : '..........'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-0.5 font-bold text-gray-700">Jarak</td><td>:</td><td className="font-normal">{security?.jarak_tempuh ? `${security.jarak_tempuh} KM` : '..........'}</td>
                                    <td className="py-0.5 font-bold pl-4 text-gray-700">Waktu Pakai</td><td>:</td><td className="font-normal">{security?.lama_waktu || '............'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-bold text-gray-700">Jam Keluar</td><td>:</td><td className="font-normal">{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleTimeString('id-ID') : '-'}</td>
                                    <td className="py-0.5 font-bold pl-4 text-gray-700">Jam Masuk</td><td>:</td><td className="font-normal">{security?.jam_kembali ? new Date(security.jam_kembali).toLocaleTimeString('id-ID') : '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. E-SIGNATURE */}
                <div className="border border-black mb-2 p-3">
                    <div className="grid grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <p className="text-[8px] font-bold mb-1 uppercase text-gray-400 font-sans">Pemohon</p>
                            <div className="w-20 h-20 border border-black p-0.5 mb-1">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                            </div>
                            <p className="text-[9px] underline uppercase">{request.nama || request.user?.name}</p>
                        </div>
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

                {/* 6. DOKUMENTASI FOTO */}
                <div className="border border-black overflow-hidden mb-1">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 text-center font-bold text-[8px] uppercase tracking-[3px] italic">Lampiran Dokumentasi Foto</div>
                    <div className="p-1.5">
                        <div className="grid grid-cols-2 gap-4">
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

            <div className="mt-8 no-print flex justify-center gap-4">
                <button
                    onClick={() => window.print()}
                    className="bg-black text-white px-10 py-3 rounded-lg font-bold shadow-xl active:scale-95 transition-all"
                >
                    PRINT SEKARANG
                </button>
                <button
                    onClick={() => router.back()}
                    className="bg-white border border-black text-black px-10 py-3 rounded-lg font-bold shadow hover:bg-gray-50 active:scale-95 transition-all"
                >
                    KEMBALI
                </button>
            </div>
        </div>
    );
}
