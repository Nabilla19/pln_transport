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
                `NAMA: ${request.nama}\n` +
                `JABATAN: ${request.jabatan}\n` +
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
                `NAMA: ${approval.asmen?.name}\n` +
                `ROLE: ${approval.asmen?.role}\n` +
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
                `OLEH: ${fleet.admin?.name} (${fleet.admin?.role})\n` +
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
                        font-size: 9pt;
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
                    color: rgba(6, 182, 212, 0.04); /* Sky blue watermark */
                    z-index: 0;
                    pointer-events: none;
                    font-family: 'Arial Black', sans-serif;
                }
                
                .content-layer { position: relative; z-index: 1; }
            `}</style>

            <div className="watermark-c">C</div>

            <div className="content-layer">
                {/* KOP SURAT */}
                <div className="mb-2 pb-2 border-b-4 border-black">
                    <h1 className="text-xs font-bold uppercase">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                    <div className="h-px bg-black"></div>
                    <p className="text-[10px] font-semibold">PT PLN (PERSERO) - Unit Pelaksana Pengatur Distribusi Riau (UP2D)</p>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-2 py-1 border-y-2 border-black">
                    <h2 className="text-base font-bold uppercase tracking-widest">PERMOHONAN ANGKUTAN</h2>
                    <p className="text-[10px] mt-0.5 font-semibold">UNTUK KEPERLUAN DINAS / SOSIAL</p>
                </div>

                {/* DATA TABLE SECTION */}
                <div className="border-2 border-black mb-2 overflow-hidden">
                    <div className="bg-black px-2 py-0.5"><h3 className="font-bold text-[10px] uppercase text-white tracking-widest">Data Pemohon</h3></div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-1 font-semibold">Nama Lengkap</td><td className="w-3">:</td><td>{request.nama}</td>
                                    <td className="w-32 py-1 font-semibold pl-4">Jabatan</td><td className="w-3">:</td><td>{request.jabatan}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-1 font-semibold">Bagian/Bidang</td><td>:</td><td>{request.bagian}</td>
                                    <td className="py-1 font-semibold pl-4">Macam Kendaraan</td><td>:</td><td>{request.macam_kendaraan || '-'}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-1 font-semibold">Lokasi Tujuan</td><td>:</td><td>{request.tujuan}</td>
                                    <td className="py-1 font-semibold pl-4">Jumlah Penumpang</td><td>:</td><td>{request.jumlah_penumpang} orang</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">Keperluan</td><td>:</td><td colSpan="4">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PERINTAH JALAN */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5"><h3 className="font-bold text-[10px] uppercase text-white tracking-widest">Perintah Jalan</h3></div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-1 font-semibold">Kendaraan</td><td>:</td><td className="font-bold">{fleet?.mobil || '..................'}</td>
                                    <td className="w-32 py-1 font-semibold pl-4">Nomor Polisi</td><td>:</td><td className="font-bold">{fleet?.plat_nomor || '..................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">Pengemudi</td><td>:</td><td colSpan="4" className="font-bold uppercase italic">{fleet?.pengemudi || '..................'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DATA SECURITY */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5"><h3 className="font-bold text-[10px] uppercase text-white tracking-widest">Data Operasional (Security)</h3></div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
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

                {/* TANDA TANGAN DIGITAL SECTION */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-slate-100 border-b-2 border-black px-2 py-1 text-center">
                        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-slate-800">Tanda Tangan Digital (E-Signature)</h3>
                    </div>
                    <div className="p-4 bg-white">
                        <div className="grid grid-cols-3 gap-4 text-center items-start">
                            {/* Pemohon */}
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-bold mb-2 text-slate-700">PEMOHON</p>
                                <div className="w-24 h-24 border-2 border-black p-1 bg-white shadow-sm">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                                </div>
                                <p className="text-[10px] font-black mt-2 text-sky-800 underline decoration-sky-300">{request.nama.toUpperCase()}</p>
                                <p className="text-[7px] font-bold text-slate-500">{request.jabatan.toUpperCase()}</p>
                            </div>

                            {/* Menyetujui */}
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-bold mb-2 text-slate-700">MENYETUJUI</p>
                                <div className="w-24 h-24 border-2 border-black p-1 bg-white shadow-sm">
                                    {approval?.barcode_asmen ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 italic">PENDING</div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black mt-2 text-sky-800 underline decoration-sky-300">{approval?.asmen?.name?.toUpperCase() || 'BELUM DISETUJUI'}</p>
                                <p className="text-[7px] font-bold text-slate-500">{approval?.asmen?.role?.toUpperCase() || 'ASMEN / KKU'}</p>
                            </div>

                            {/* Surat Jalan */}
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-bold mb-2 text-slate-700">SURAT JALAN</p>
                                <div className="w-24 h-24 border-2 border-black p-1 bg-white shadow-sm">
                                    {fleet?.barcode_fleet ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 italic">BELUM TERBIT</div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black mt-2 text-sky-800 underline decoration-sky-300">{fleet?.admin?.name?.toUpperCase() || 'BELUM DITETAPKAN'}</p>
                                <p className="text-[7px] font-bold text-slate-500">{fleet?.admin?.role?.toUpperCase() || 'ADMIN FLEET / KKU'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 text-center">
                    <p className="text-[8px] text-slate-400 font-medium">Dokumen dicetak dari Aplikasi E-Transport UP2D Riau | {new Date().toLocaleString()} WIB</p>
                </div>
            </div>

            <div className="mt-8 no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">CETAK SURAT</button>
                <button onClick={() => window.history.back()} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow transition-all active:scale-95">KEMBALI</button>
            </div>
        </div>
    );
}
