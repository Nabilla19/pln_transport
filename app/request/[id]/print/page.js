"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function PrintRequestPage() {
    const { id } = useParams();
    const [request, setRequest] = useState(null);

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const data = await api.get(`/api/requests/${id}`);
                setRequest(data);
                // Trigger print after a short delay to allow rendering
                setTimeout(() => window.print(), 2000);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRequest();
    }, [id]);

    if (!request) return <div className="p-8 text-center text-slate-500">Memuat data cetak...</div>;

    const fleet = request.fleet?.[0];
    const security = request.securityLogs?.[0];
    const approval = request.approvals?.[0];

    // Generate QR Code data sesuai permintaan: menampilkan text approval detail
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
            return `Surat ini sudah di-approve oleh ASMEN ${approval.asmen?.name || '-'} pada tanggal ${tgl} dan waktu ${jam} WIB.`;
        }

        if (type === 'fleet' && fleet) {
            const tgl = new Date(fleet.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
            });
            const jam = new Date(fleet.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return `Surat ini sudah di-approve oleh ADMIN FLEET ${fleet.admin?.name || '-'} pada tanggal ${tgl} dan waktu ${jam} WIB.`;
        }

        return `DOKUMEN E-TRANSPORT ID: #${docId}`;
    };

    return (
        <div className="print-container relative bg-white text-black min-h-screen p-6 font-serif">
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { 
                        background: white !important; 
                        color: black !important; 
                        margin: 0;
                        padding: 0;
                    }
                    .print-container { 
                        padding: 0.5cm !important;
                        font-size: 10pt;
                        width: 100%;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            `}</style>

            <div className="mx-auto max-w-[21cm] border border-gray-100 p-2 print:border-0 print:p-0">
                {/* 1. KOP SURAT DENGAN LOGO */}
                <div className="flex items-center gap-4 border-b-4 border-black pb-2 mb-4">
                    <img src="/images/logo-pln.png" alt="Logo PLN" className="w-16 h-auto" />
                    <div className="flex-1">
                        <h1 className="text-sm font-bold leading-tight uppercase">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                        <p className="text-[11px] font-semibold">UNIT PELAKSANA PENGATUR DISTRIBUSI RIAU (UP2D)</p>
                        <p className="text-[9px] text-gray-600">Alamat: Jl. Setia Budi No. 96, Pekanbaru</p>
                    </div>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold uppercase underline decoration-2">PERMOHONAN ANGKUTAN DINAS</h2>
                    <p className="text-xs font-semibold">ID Permohonan: #{String(id).padStart(4, '0')}</p>
                </div>

                {/* 2. DATA PEMOHON */}
                <div className="border-2 border-black mb-4 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-1 flex items-center gap-2">
                        <span className="font-bold text-xs">A. DATA PEMOHON</span>
                    </div>
                    <div className="p-3">
                        <table className="w-full text-xs">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-40 py-1.5 font-bold">Nama Lengkap</td><td className="w-4">:</td><td>{request.nama || request.user?.name}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1.5 font-bold">Jabatan / Bagian</td><td>:</td><td>{request.jabatan} / {request.bagian}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1.5 font-bold">Tujuan Perjalanan</td><td>:</td><td className="uppercase">{request.tujuan}</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 font-bold">Keperluan</td><td>:</td><td className="italic text-gray-700">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. SURAT PERINTAH JALAN */}
                <div className="border-2 border-black mb-4 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-1">
                        <span className="font-bold text-xs uppercase">B. Surat Perintah Jalan (Admin Fleet)</span>
                    </div>
                    <div className="p-3">
                        <table className="w-full text-xs">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-40 py-1.5 font-bold">Kendaraan / Unit</td><td className="w-4">:</td><td className="font-black uppercase">{fleet?.mobil || '-'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1.5 font-bold">Nomor Polisi</td><td>:</td><td className="font-black text-blue-800 tracking-widest">{fleet?.plat_nomor || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 font-bold">Nama Pengemudi</td><td>:</td><td className="font-bold text-gray-800 uppercase">{fleet?.pengemudi || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. DATA SECURITY CHECK */}
                <div className="border-2 border-black mb-4 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-1">
                        <span className="font-bold text-xs uppercase">C. Data Operasional / Security Check</span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-4">
                        <table className="w-full text-xs border-r border-gray-200 pr-2">
                            <tbody>
                                <tr><td colSpan="3" className="pb-1 underline font-bold uppercase text-gray-500 text-[9px]">Berangkat</td></tr>
                                <tr><td className="w-20 py-1">KM Awal</td><td className="w-3">:</td><td className="font-bold">{security?.km_awal || '-'} KM</td></tr>
                                <tr><td className="py-1">Jam Keluar</td><td>:</td><td>{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleTimeString('id-ID') : '-'} WIB</td></tr>
                            </tbody>
                        </table>
                        <table className="w-full text-xs pl-2">
                            <tbody>
                                <tr><td colSpan="3" className="pb-1 underline font-bold uppercase text-gray-500 text-[9px]">Kembali</td></tr>
                                <tr><td className="w-20 py-1">KM Akhir</td><td className="w-3">:</td><td className="font-bold">{security?.km_akhir || '-'} KM</td></tr>
                                <tr><td className="py-1">Jam Masuk</td><td>:</td><td>{security?.jam_kembali ? new Date(security.jam_kembali).toLocaleTimeString('id-ID') : '-'} WIB</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. BARCODE / E-SIGNATURE */}
                <div className="border-2 border-black mb-4 p-4">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-bold mb-2">PEMOHON</p>
                            <div className="w-24 h-24 border border-black p-1">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                            </div>
                            <p className="text-[10px] font-bold mt-2 underline uppercase">{request.nama || request.user?.name}</p>
                            <p className="text-[8px] text-gray-500">{request.jabatan}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-bold mb-2 uppercase tracking-tighter">Asmen (Approval)</p>
                            <div className="w-24 h-24 border border-black p-1">
                                {approval?.barcode_asmen ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[8px] text-gray-300 italic">PENDING</div>
                                )}
                            </div>
                            <p className="text-[10px] font-bold mt-2 underline uppercase">{approval?.asmen?.name || 'BELUM DISETUJUI'}</p>
                            <p className="text-[8px] text-gray-500">ASMEN / KKU</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-bold mb-2">ADMIN FLEET</p>
                            <div className="w-24 h-24 border border-black p-1">
                                {fleet?.barcode_fleet ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[8px] text-gray-300 italic text-center">MENUNGGU<br />ADMIN</div>
                                )}
                            </div>
                            <p className="text-[10px] font-bold mt-2 underline uppercase">{fleet?.admin?.name || 'BELUM DITETAPKAN'}</p>
                            <p className="text-[8px] text-gray-500">ADMIN SEKSI UMUM</p>
                        </div>
                    </div>
                </div>

                {/* 6. FOTO LAMPIRAN (DOCUMENTASI) */}
                <div className="border-2 border-black mb-4">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-1 text-center font-bold text-xs">
                        LAMPIRAN DOKUMENTASI FOTO OPERASIONAL
                    </div>
                    <div className="p-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <p className="text-center font-bold text-[9px] border-b border-gray-300 pb-1">DOKUMENTASI BERANGKAT</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-black aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_driver_berangkat ? <img src={security.foto_driver_berangkat} className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-300">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_km_berangkat ? <img src={security.foto_km_berangkat} className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-300">Speedometer</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-center font-bold text-[9px] border-b border-gray-300 pb-1">DOKUMENTASI KEMBALI</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-black aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_driver_kembali ? <img src={security.foto_driver_kembali} className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-300">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_km_kembali ? <img src={security.foto_km_kembali} className="w-full h-full object-cover" /> : <span className="text-[8px] text-gray-300">Speedometer</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="text-center pt-2">
                    <p className="text-[8px] italic text-gray-500 font-bold uppercase tracking-widest">Sistem E-Transport PT PLN (Persero) UP2D Riau | Dicetak: {new Date().toLocaleString('id-ID')} WIB</p>
                </div>
            </div>

            <div className="mt-8 no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded shadow-lg transition-all active:scale-95">CETAK SURAT</button>
                <button onClick={() => window.history.back()} className="bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 px-10 rounded hover:bg-blue-50 transition-all">KEMBALI</button>
            </div>
        </div>
    );
}
