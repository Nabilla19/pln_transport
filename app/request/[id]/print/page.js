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
                `Dokumen sah secara elektronik.\nVerify: ${baseUrl}/verify/${request.barcode_pemohon}`;
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
                `Dokumen sah secara elektronik.\nVerify: ${baseUrl}/verify/${approval.barcode_asmen}`;
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
                        padding: 1cm !important;
                        font-size: 8.5pt;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
                
                .watermark-c {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 550px;
                    font-weight: 900;
                    color: rgba(6, 182, 212, 0.04);
                    z-index: 0;
                    pointer-events: none;
                    font-family: 'Arial Black', sans-serif;
                }
                
                .content-layer { position: relative; z-index: 1; }
                .label-cell { width: 120px; font-weight: 600; padding: 2px 0; }
                .separator-cell { width: 10px; text-align: center; }
                .value-cell { border-bottom: 1px solid #eee; padding: 2px 4px; }
            `}</style>

            <div className="watermark-c">C</div>

            <div className="content-layer">
                {/* KOP SURAT */}
                <div className="mb-2 pb-2 border-b-4 border-black flex justify-between items-end">
                    <div>
                        <h1 className="text-[10px] font-black uppercase tracking-tighter">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                        <p className="text-[9px] font-bold">Unit Pelaksana Pengatur Distribusi Riau (UP2D)</p>
                    </div>
                    <div className="text-right text-[8px] font-mono text-slate-400">
                        DOC-ID: #{String(id).padStart(4, '0')}
                    </div>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-4 py-2 border-y-2 border-slate-300 bg-slate-50">
                    <h2 className="text-lg font-black uppercase tracking-[0.3em] text-slate-800">PERMOHONAN ANGKUTAN</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">SURAT JALAN OPERASIONAL KENDARAAN DINAS</p>
                </div>

                {/* DATA GRID */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Data Pemohon */}
                    <div className="border-2 border-slate-800 rounded-lg overflow-hidden">
                        <div className="bg-slate-800 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">I. DATA PEMOHON</div>
                        <div className="p-2 space-y-1">
                            <table className="w-full text-[9px]">
                                <tbody>
                                    <tr><td className="label-cell">Nama</td><td className="separator-cell">:</td><td className="value-cell font-bold">{request.nama || request.user?.name}</td></tr>
                                    <tr><td className="label-cell">Jabatan</td><td className="separator-cell">:</td><td className="value-cell">{request.jabatan}</td></tr>
                                    <tr><td className="label-cell">Bagian</td><td className="separator-cell">:</td><td className="value-cell">{request.bagian}</td></tr>
                                    <tr><td className="label-cell">Tujuan</td><td className="separator-cell">:</td><td className="value-cell uppercase">{request.tujuan}</td></tr>
                                    <tr><td className="label-cell">Keperluan</td><td className="separator-cell">:</td><td className="value-cell italic text-slate-600">{request.keperluan}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Perintah Jalan */}
                    <div className="border-2 border-slate-800 rounded-lg overflow-hidden">
                        <div className="bg-slate-800 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">II. PERINTAH JALAN</div>
                        <div className="p-2 space-y-1">
                            <table className="w-full text-[9px]">
                                <tbody>
                                    <tr><td className="label-cell">Kendaraan</td><td className="separator-cell">:</td><td className="value-cell font-bold">{fleet?.mobil || '..................'}</td></tr>
                                    <tr><td className="label-cell">Nomor Polisi</td><td className="separator-cell">:</td><td className="value-cell font-black text-blue-700">{fleet?.plat_nomor || '..................'}</td></tr>
                                    <tr><td className="label-cell">Pengemudi</td><td className="separator-cell">:</td><td className="value-cell uppercase">{fleet?.pengemudi || '..................'}</td></tr>
                                    <tr><td className="label-cell">KM Awal</td><td className="separator-cell">:</td><td className="value-cell">{security?.km_awal ? `${security.km_awal} KM` : '..................'}</td></tr>
                                    <tr><td className="label-cell">KM Akhir</td><td className="separator-cell">:</td><td className="value-cell">{security?.km_akhir ? `${security.km_akhir} KM` : '..................'}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* DOKUMENTASI FOTO - INI YANG TADI HILANG */}
                <div className="border-2 border-slate-800 rounded-lg overflow-hidden mb-4">
                    <div className="bg-slate-800 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest">III. DOKUMENTASI FOTO (SECURITY CHECK)</div>
                    <div className="p-2">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Berangkat */}
                            <div>
                                <p className="text-[8px] font-bold text-slate-500 mb-1 border-b border-slate-200 uppercase tracking-tighter">A. SAAT BERANGKAT (CHECK-IN)</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] border border-slate-300 rounded flex items-center justify-center bg-slate-50 overflow-hidden shadow-inner">
                                            {security?.foto_driver_berangkat ? (
                                                <img src={security.foto_driver_berangkat} alt="Dvr" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-[7px] text-slate-300 italic text-center">No Photo<br />Driver</div>
                                            )}
                                        </div>
                                        <span className="text-[7px] font-bold mt-1 text-slate-400">FOTO DRIVER</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] border border-slate-300 rounded flex items-center justify-center bg-slate-50 overflow-hidden shadow-inner">
                                            {security?.foto_km_berangkat ? (
                                                <img src={security.foto_km_berangkat} alt="KM" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-[7px] text-slate-300 italic text-center">No Photo<br />Speedometer</div>
                                            )}
                                        </div>
                                        <span className="text-[7px] font-bold mt-1 text-slate-400">FOTO KM AWAL</span>
                                    </div>
                                </div>
                            </div>

                            {/* Kembali */}
                            <div>
                                <p className="text-[8px] font-bold text-slate-500 mb-1 border-b border-slate-200 uppercase tracking-tighter">B. SAAT KEMBALI (CHECK-OUT)</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] border border-slate-300 rounded flex items-center justify-center bg-slate-50 overflow-hidden shadow-inner">
                                            {security?.foto_driver_kembali ? (
                                                <img src={security.foto_driver_kembali} alt="Dvr" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-[7px] text-slate-300 italic text-center">No Photo<br />Driver</div>
                                            )}
                                        </div>
                                        <span className="text-[7px] font-bold mt-1 text-slate-400">FOTO DRIVER</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-full aspect-[4/3] border border-slate-300 rounded flex items-center justify-center bg-slate-50 overflow-hidden shadow-inner">
                                            {security?.foto_km_kembali ? (
                                                <img src={security.foto_km_kembali} alt="KM" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-[7px] text-slate-300 italic text-center">No Photo<br />Speedometer</div>
                                            )}
                                        </div>
                                        <span className="text-[7px] font-bold mt-1 text-slate-400">FOTO KM AKHIR</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TANDA TANGAN DIGITAL SECTION */}
                <div className="border-2 border-slate-800 rounded-lg overflow-hidden mb-2">
                    <div className="bg-slate-100 border-b border-slate-800 px-2 py-1 text-center">
                        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-800 italic">E-Signature & Authentication Section</h3>
                    </div>
                    <div className="p-4 bg-white">
                        <div className="grid grid-cols-3 gap-8 text-center items-start">
                            {/* Pemohon */}
                            <div className="flex flex-col items-center">
                                <p className="text-[9px] font-bold mb-2 text-slate-600">DIAJUKAN OLEH,</p>
                                <div className="w-24 h-24 border border-slate-300 p-1 bg-white shadow-sm rounded-lg">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                                </div>
                                <p className="text-[10px] font-black mt-2 text-sky-800 underline decoration-sky-300">{(request.nama || request.user?.name || 'BELUM ADA NAMA').toUpperCase()}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{(request.jabatan || request.user?.role || 'PEGAWAI').toUpperCase()}</p>
                            </div>

                            {/* Menyetujui */}
                            <div className="flex flex-col items-center">
                                <p className="text-[9px] font-bold mb-2 text-slate-600">DISETUJUI OLEH,</p>
                                <div className="w-24 h-24 border border-slate-300 p-1 bg-white shadow-sm rounded-lg">
                                    {approval?.barcode_asmen ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 italic font-mono bg-slate-50">NOT SIGNED</div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black mt-2 text-sky-800 underline decoration-sky-300">{(approval?.asmen?.name || 'BELUM DISETUJUI').toUpperCase()}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{(approval?.asmen?.role || 'ASMEN / KKU').toUpperCase()}</p>
                            </div>

                            {/* Surat Jalan */}
                            <div className="flex flex-col items-center">
                                <p className="text-[9px] font-bold mb-2 text-slate-600">DITETAPKAN OLEH,</p>
                                <div className="w-24 h-24 border border-slate-300 p-1 bg-white shadow-sm rounded-lg">
                                    {fleet?.barcode_fleet ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 italic font-mono bg-slate-50">UNAVAILABLE</div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black mt-2 text-sky-800 underline decoration-sky-300">{(fleet?.admin?.name || 'BELUM DITETAPKAN').toUpperCase()}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{(fleet?.admin?.role || 'ADMIN FLEET').toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 text-center">
                    <p className="text-[7px] text-slate-400 font-medium">Dokumen ini sah dan valid secara elektronik melalui Aplikasi E-Transport UP2D Riau | Cetak: {new Date().toLocaleString('id-ID')} WIB</p>
                </div>
            </div>

            <div className="mt-8 no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">CETAK ULANG</button>
                <button onClick={() => window.history.back()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow transition-all active:scale-95">KEMBALI</button>
            </div>
        </div>
    );
}
