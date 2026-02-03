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
                setTimeout(() => window.print(), 1500);
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

    // Generate QR Code data with more professional, structured text
    const generateQRData = (type) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const docId = String(id).padStart(4, '0');

        if (type === 'pemohon') {
            const tgl = new Date(request.created_at || request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            return `PT PLN (PERSERO) UP2D RIAU\nVERIFIKASI TANDA TANGAN DIGITAL\n\n` +
                `ID PERMOHONAN: #${docId}\n` +
                `STATUS: TELAH DIAJUKAN\n` +
                `NAMA: ${request.nama || request.user?.name}\n` +
                `JABATAN: ${request.jabatan || request.user?.role}\n` +
                `WAKTU: ${tgl} WIB\n\n` +
                `Dokumen sah secara elektronik.`;
        }

        if (type === 'approver' && approval) {
            const tgl = new Date(approval.approved_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const status = approval.is_approved ? 'DISETUJUI' : 'DITOLAK';
            return `PT PLN (PERSERO) UP2D RIAU\nVERIFIKASI TANDA TANGAN DIGITAL\n\n` +
                `ID PERMOHONAN: #${docId}\n` +
                `STATUS: ${status}\n` +
                `NAMA: ${approval.asmen?.name || 'ASMEN'}\n` +
                `ROLE: ${approval.asmen?.role || 'Asmen'}\n` +
                `WAKTU: ${tgl} WIB\n\n` +
                `Dokumen sah secara elektronik.`;
        }

        if (type === 'fleet' && fleet) {
            const tgl = new Date(fleet.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            return `PT PLN (PERSERO) UP2D RIAU\nVERIFIKASI TANDA TANGAN DIGITAL\n\n` +
                `ID PERMOHONAN: #${docId}\n` +
                `STATUS: KENDARAAN DITETAPKAN\n` +
                `MOBIL: ${fleet.mobil} (${fleet.plat_nomor})\n` +
                `PENGEMUDI: ${fleet.pengemudi}\n` +
                `OLEH: ${fleet.admin?.name || 'ADMIN FLEET'}\n` +
                `WAKTU: ${tgl} WIB\n\n` +
                `Dokumen sah secara elektronik.`;
        }

        return `VERIFIKASI PENDING`;
    };

    return (
        <div className="print-container relative bg-white text-black min-h-screen p-8">
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
                        padding: 1.5cm !important;
                        font-size: 10pt;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
                
                .content-layer { position: relative; z-index: 1; }
            `}</style>

            <div className="content-layer">
                {/* KOP SURAT */}
                <div className="mb-4 pb-2 border-b-4 border-black">
                    <h1 className="text-xs font-bold uppercase tracking-tight">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                    <div className="h-[2px] bg-black my-1"></div>
                    <p className="text-[11px] font-semibold">Unit Pelaksana Pengatur Distribusi Riau (UP2D)</p>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-4 py-1 border-y-2 border-black">
                    <h2 className="text-lg font-bold uppercase tracking-widest">PERMOHONAN ANGKUTAN</h2>
                    <p className="text-xs mt-0.5 font-semibold">UNTUK KEPERLUAN DINAS / SOSIAL</p>
                </div>

                {/* DATA TABLE SECTION */}
                <div className="border-2 border-black mb-4 overflow-hidden">
                    <div className="bg-black px-2 py-1"><h3 className="font-bold text-xs uppercase text-white tracking-widest">Data Pemohon</h3></div>
                    <div className="p-2">
                        <table className="w-full text-[10pt]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-1 font-semibold">Nama Lengkap</td><td className="w-3">:</td><td>{request.nama || request.user?.name}</td>
                                    <td className="w-32 py-1 font-semibold pl-4">Jabatan</td><td className="w-3">:</td><td>{request.jabatan || request.user?.role}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-1 font-semibold">Bagian/Bidang</td><td>:</td><td>{request.bagian}</td>
                                    <td className="py-1 font-semibold pl-4">Macam Kendaraan</td><td>:</td><td>{request.macam_kendaraan || '-'}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-1 font-semibold">Lokasi Tujuan</td><td>:</td><td className="uppercase">{request.tujuan}</td>
                                    <td className="py-1 font-semibold pl-4">Jumlah Penumpang</td><td>:</td><td>{request.jumlah_penumpang} orang</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">Keperluan</td><td>:</td><td colSpan="4" className="italic">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PERINTAH JALAN */}
                <div className="border-2 border-black mb-4">
                    <div className="bg-black px-2 py-1"><h3 className="font-bold text-xs uppercase text-white tracking-widest">Perintah Jalan</h3></div>
                    <div className="p-2">
                        <table className="w-full text-[10pt]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-1 font-semibold">Kendaraan</td><td>:</td><td className="font-bold uppercase tracking-tight">{fleet?.mobil || '..................'}</td>
                                    <td className="w-32 py-1 font-semibold pl-4">Nomor Polisi</td><td>:</td><td className="font-bold text-blue-800">{fleet?.plat_nomor || '..................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">Pengemudi</td><td>:</td><td colSpan="4" className="font-bold uppercase italic">{fleet?.pengemudi || '..................'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DATA SECURITY */}
                <div className="border-2 border-black mb-4">
                    <div className="bg-black px-2 py-1"><h3 className="font-bold text-xs uppercase text-white tracking-widest">Data Operasional (Security)</h3></div>
                    <div className="p-2">
                        <table className="w-full text-[10pt]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-1 font-semibold">KM Berangkat</td><td>:</td><td>{security?.km_awal} KM</td>
                                    <td className="w-32 py-1 font-semibold pl-4">KM Kembali</td><td>:</td><td>{security?.km_akhir} KM</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">Waktu Berangkat</td><td>:</td><td>{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleTimeString() : '-'}</td>
                                    <td className="py-1 font-semibold pl-4">Waktu Kembali</td><td>:</td><td>{security?.jam_kembali ? new Date(security.jam_kembali).toLocaleTimeString() : '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DOKUMENTASI FOTO */}
                <div className="border-2 border-black mb-4">
                    <div className="bg-black px-2 py-1"><h3 className="font-bold text-xs uppercase text-white tracking-widest">Dokumentasi Foto</h3></div>
                    <div className="p-2">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Foto Berangkat */}
                            <div>
                                <p className="text-[10px] font-bold mb-1 text-center bg-gray-100 py-1 border border-black">SAAT BERANGKAT</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_driver_berangkat ? (
                                            <img src={security.foto_driver_berangkat} alt="Dvr" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto Driver</span>
                                        )}
                                    </div>
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_km_berangkat ? (
                                            <img src={security.foto_km_berangkat} alt="KM" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto KM</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Foto Kembali */}
                            <div>
                                <p className="text-[10px] font-bold mb-1 text-center bg-gray-100 py-1 border border-black">SAAT KEMBALI</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_driver_kembali ? (
                                            <img src={security.foto_driver_kembali} alt="Dvr" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto Driver</span>
                                        )}
                                    </div>
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_km_kembali ? (
                                            <img src={security.foto_km_kembali} alt="KM" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto KM</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TANDA TANGAN DIGITAL SECTION */}
                <div className="border-2 border-black mb-4">
                    <div className="bg-slate-100 border-b-2 border-black px-2 py-1 text-center">
                        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800 italic">E-Signature & Authentication Section</h3>
                    </div>
                    <div className="p-4 bg-white">
                        <div className="grid grid-cols-3 gap-4 text-center items-start">
                            {/* Pemohon */}
                            <div className="flex flex-col items-center">
                                <p className="text-[11px] font-bold mb-2 text-slate-700">PEMOHON</p>
                                <div className="w-24 h-24 border-2 border-black p-1 bg-white shadow-sm rounded-lg">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                                </div>
                                <p className="text-[11px] font-black mt-2 text-sky-800 underline decoration-sky-300">{(request.nama || request.user?.name || '-').toUpperCase()}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{(request.jabatan || request.user?.role || '-').toUpperCase()}</p>
                            </div>

                            {/* Menyetujui */}
                            <div className="flex flex-col items-center">
                                <p className="text-[11px] font-bold mb-2 text-slate-700">MENYETUJUI</p>
                                <div className="w-24 h-24 border-2 border-black p-1 bg-white shadow-sm rounded-lg">
                                    {approval?.barcode_asmen ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 italic">PENDING</div>
                                    )}
                                </div>
                                <p className="text-[11px] font-black mt-2 text-sky-800 underline decoration-sky-300">{(approval?.asmen?.name || 'BELUM DISETUJUI').toUpperCase()}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{(approval?.asmen?.role || 'ASMEN / KKU').toUpperCase()}</p>
                            </div>

                            {/* Surat Jalan */}
                            <div className="flex flex-col items-center">
                                <p className="text-[11px] font-bold mb-2 text-slate-700">SURAT JALAN</p>
                                <div className="w-24 h-24 border-2 border-black p-1 bg-white shadow-sm rounded-lg">
                                    {fleet?.barcode_fleet ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 italic">BELUM TERBIT</div>
                                    )}
                                </div>
                                <p className="text-[11px] font-black mt-2 text-sky-800 underline decoration-sky-300">{(fleet?.admin?.name || 'BELUM DITETAPKAN').toUpperCase()}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{(fleet?.admin?.role || 'ADMIN FLEET / KKU').toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 text-center">
                    <p className="text-[9px] text-slate-400 font-medium italic">Dokumen ini sah secara elektronik melalui E-Transport UP2D Riau | {new Date().toLocaleString()} WIB</p>
                </div>
            </div>

            <div className="mt-8 no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">CETAK SURAT</button>
                <button onClick={() => window.history.back()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow transition-all active:scale-95">KEMBALI</button>
            </div>
        </div>
    );
}
