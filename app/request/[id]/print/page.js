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

    const generateQRData = (type) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const docId = String(id).padStart(4, '0');

        if (type === 'pemohon') {
            const tgl = new Date(request.created_at).toLocaleString('id-ID');
            return `E-TRANSPORT UP2D RIAU\nID: #${docId}\nPemohon: ${request.nama || request.user?.name}\nWaktu: ${tgl}`;
        }
        if (type === 'approver' && approval) {
            return `APPROVAL ASMEN\nID: #${docId}\nStatus: APPROVED\nOleh: ${approval.asmen?.name}`;
        }
        if (type === 'fleet' && fleet) {
            return `FLEET ASSIGNMENT\nID: #${docId}\nKendaraan: ${fleet.mobil}\nDriver: ${fleet.pengemudi}`;
        }
        return `E-TRANSPORT #${docId}`;
    };

    return (
        <div className="print-container bg-white text-slate-900 min-h-screen p-10 font-sans">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    background: #f8fafc;
                }

                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .print-container { padding: 1cm !important; width: 100% !important; margin: 0 !important; }
                    @page { size: A4; margin: 0; }
                }

                .border-navy { border-color: #1e3a8a; }
                .bg-navy { background-color: #1e3a8a; }
                .text-navy { color: #1e3a8a; }
            `}</style>

            <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm print:shadow-none print:p-0">
                {/* HEADER - MODERN CLEAN */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">P</div>
                        <div>
                            <h1 className="text-sm font-extrabold text-navy tracking-tight leading-none uppercase">PT PLN (PERSERO)</h1>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">UP2D RIAU - UNIT PELAKSANA PENGATUR DISTRIBUSI</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-100 px-3 py-1 rounded-md text-[10px] font-bold text-slate-600 inline-block mb-1">DOKUMEN OPERASIONAL</div>
                        <p className="text-xs font-mono text-slate-400">REF: #{String(id).padStart(4, '0')}</p>
                    </div>
                </div>

                {/* TITLE AREA */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Surat Izin Penggunaan Kendaraan</h2>
                    <div className="w-16 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
                </div>

                {/* CONTENT GRID */}
                <div className="space-y-6 text-sm">
                    {/* SECTION 1: PERMOHONAN */}
                    <div className="grid grid-cols-12 gap-0 border rounded-xl overflow-hidden border-slate-200 shadow-sm">
                        <div className="col-span-12 bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> I. Rincian Permohonan
                            </span>
                        </div>
                        <div className="col-span-6 p-4 border-r border-slate-100">
                            <table className="w-full">
                                <tbody>
                                    <tr><td className="w-24 text-slate-400 text-[10px] uppercase font-bold py-1">Nama</td><td className="font-bold text-slate-800">{request.nama || request.user?.name}</td></tr>
                                    <tr><td className="text-slate-400 text-[10px] uppercase font-bold py-1">Jabatan</td><td className="text-slate-700">{request.jabatan || request.user?.role}</td></tr>
                                    <tr><td className="text-slate-400 text-[10px] uppercase font-bold py-1">Bagian</td><td className="text-slate-700">{request.bagian}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-span-6 p-4">
                            <table className="w-full">
                                <tbody>
                                    <tr><td className="w-24 text-slate-400 text-[10px] uppercase font-bold py-1">Tujuan</td><td className="font-bold text-navy uppercase">{request.tujuan}</td></tr>
                                    <tr><td className="text-slate-400 text-[10px] uppercase font-bold py-1">Keperluan</td><td className="text-slate-600 italic leading-tight">{request.keperluan}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 2: KENDARAAN & DRIVER */}
                    <div className="grid grid-cols-12 gap-0 border rounded-xl overflow-hidden border-slate-200 shadow-sm">
                        <div className="col-span-12 bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> II. Penetapan Kendaraan
                            </span>
                        </div>
                        <div className="col-span-12 p-4 grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-tighter">Mobil & Unit</p>
                                <p className="font-extrabold text-slate-800 text-base">{fleet?.mobil || 'PENDING'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-tighter">Plat Nomor</p>
                                <p className="font-black text-blue-700 text-base tracking-widest">{fleet?.plat_nomor || '-'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-tighter">Nama Pengemudi</p>
                                <p className="font-bold text-slate-800 uppercase text-base">{fleet?.pengemudi || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: FOTO DOKUMENTASI */}
                    <div className="border rounded-xl border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> III. Dokumentasi Security Check
                            </span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-8">
                            {/* Berangkat */}
                            <div>
                                <p className="text-[9px] font-black text-slate-400 mb-3 border-b-2 border-slate-100 pb-1">SAAT BERANGKAT (CHECK-IN)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 shadow-inner overflow-hidden flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] bg-white rounded flex items-center justify-center overflow-hidden mb-1">
                                            {security?.foto_driver_berangkat ? <img src={security.foto_driver_berangkat} className="w-full h-full object-cover" /> : <p className="text-[8px] text-slate-300">No Photo</p>}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Foto Driver</span>
                                    </div>
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 shadow-inner overflow-hidden flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] bg-white rounded flex items-center justify-center overflow-hidden mb-1">
                                            {security?.foto_km_berangkat ? <img src={security.foto_km_berangkat} className="w-full h-full object-cover" /> : <p className="text-[8px] text-slate-300">No Photo</p>}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">KM: {security?.km_awal || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Kembali */}
                            <div>
                                <p className="text-[9px] font-black text-slate-400 mb-3 border-b-2 border-slate-100 pb-1">SAAT KEMBALI (CHECK-OUT)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 shadow-inner overflow-hidden flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] bg-white rounded flex items-center justify-center overflow-hidden mb-1">
                                            {security?.foto_driver_kembali ? <img src={security.foto_driver_kembali} className="w-full h-full object-cover" /> : <p className="text-[8px] text-slate-300">No Photo</p>}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Foto Driver</span>
                                    </div>
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 shadow-inner overflow-hidden flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] bg-white rounded flex items-center justify-center overflow-hidden mb-1">
                                            {security?.foto_km_kembali ? <img src={security.foto_km_kembali} className="w-full h-full object-cover" /> : <p className="text-[8px] text-slate-300">No Photo</p>}
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">KM: {security?.km_akhir || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: DIGITAL SIGNATURES */}
                    <div className="pt-6 border-t border-slate-200">
                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center group">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Pemohon</p>
                                <div className="inline-block p-1 bg-white border rounded-xl shadow-sm mb-3">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} className="w-24 h-24" />
                                </div>
                                <p className="font-bold text-slate-800 text-xs border-b border-blue-100 inline-block px-2 mb-0.5">{(request.nama || request.user?.name || '').toUpperCase()}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{(request.jabatan || request.user?.role || '').toUpperCase()}</p>
                            </div>

                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Menyetujui</p>
                                <div className="inline-block p-1 bg-white border rounded-xl shadow-sm mb-3">
                                    {approval?.barcode_asmen ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} className="w-24 h-24" />
                                    ) : (
                                        <div className="w-24 h-24 flex items-center justify-center text-[10px] text-slate-200 border-2 border-dashed rounded-lg">BELUM DIAKUI</div>
                                    )}
                                </div>
                                <p className="font-bold text-slate-800 text-xs border-b border-blue-100 inline-block px-2 mb-0.5">{(approval?.asmen?.name || 'BELUM DISETUJUI').toUpperCase()}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{(approval?.asmen?.role || 'ASMEN / KKU').toUpperCase()}</p>
                            </div>

                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Surat Jalan</p>
                                <div className="inline-block p-1 bg-white border rounded-xl shadow-sm mb-3">
                                    {fleet?.barcode_fleet ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} className="w-24 h-24" />
                                    ) : (
                                        <div className="w-24 h-24 flex items-center justify-center text-[10px] text-slate-200 border-2 border-dashed rounded-lg">BELUM TERBIT</div>
                                    )}
                                </div>
                                <p className="font-bold text-slate-800 text-xs border-b border-blue-100 inline-block px-2 mb-0.5">{(fleet?.admin?.name || 'BELUM DITETAPKAN').toUpperCase()}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{(fleet?.admin?.role || 'ADMIN FLEET').toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 text-center border-t border-slate-50">
                        <p className="text-[10px] text-slate-400 font-semibold tracking-wide italic">Dokumen digital ini diterbitkan secara otomatis dan memiliki kekuatan hukum yang setara dengan dokumen fisik.\nDicetak pada: {new Date().toLocaleString()} WIB</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">CETAK SEKARANG</button>
                <button onClick={() => window.history.back()} className="bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all active:scale-95">KEMBALI</button>
            </div>
        </div>
    );
}
