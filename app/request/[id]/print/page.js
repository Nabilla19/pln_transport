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

    // Generate QR Code data sesuai permintaan
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
                        font-size: 9.5pt;
                        width: 100%;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            `}</style>

            <div className="mx-auto max-w-[21cm] p-2 print:p-0">
                {/* 1. KOP SURAT DENGAN LOGO */}
                <div className="flex items-center gap-4 border-b-4 border-black pb-2 mb-4">
                    <img src="/images/logo-pln.png" alt="Logo PLN" className="w-16 h-auto" />
                    <div className="flex-1">
                        <h1 className="text-sm font-bold leading-tight uppercase">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                        <p className="text-[11px] font-semibold">UNIT PELAKSANA PENGATUR DISTRIBUSI RIAU (UP2D)</p>
                        <p className="text-[9px] text-gray-600">Alamat: Jl. Setia Budi No. 96, Pekanbaru</p>
                    </div>
                </div>

                {/* JUDUL SESUAI PERMINTAAN */}
                <div className="text-center mb-4">
                    <h2 className="text-base font-bold uppercase underline decoration-2">PERMOHONAN ANGKUTAN</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5">UNTUK KEPERLUAN DINAS / SOSIAL</p>
                    <p className="text-[9px] font-semibold text-gray-500">Nomor: {String(id).padStart(4, '0')}/TRS/UP2D-RIAU/{new Date().getFullYear()}</p>
                </div>

                {/* 2. DATA PEMOHON LENGKAP */}
                <div className="border-2 border-black mb-3 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-1 flex items-center gap-2">
                        <span className="font-bold text-xs uppercase">I. Data Pemohon</span>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[10pt]">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-40 py-1 font-bold">Nama Lengkap</td><td className="w-4">:</td><td className="font-bold">{request.nama || request.user?.name}</td>
                                    <td className="w-40 py-1 font-bold pl-4">Jabatan</td><td className="w-4">:</td><td>{request.jabatan || request.user?.role}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold">Bagian/Bidang</td><td>:</td><td>{request.bagian}</td>
                                    <td className="py-1 font-bold pl-4">Macam Kendaraan</td><td>:</td><td>{request.macam_kendaraan || '-'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold">Tujuan Perjalanan</td><td>:</td><td className="uppercase font-semibold">{request.tujuan}</td>
                                    <td className="py-1 font-bold pl-4">Jumlah Penumpang</td><td>:</td><td>{request.jumlah_penumpang || '-'} orang</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold">Waktu Berangkat</td><td>:</td><td>{new Date(request.tanggal_jam_berangkat).toLocaleString('id-ID')} WIB</td>
                                    <td className="py-1 font-bold pl-4">Lama Pakai</td><td>:</td><td>{request.lama_pakai || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Keperluan</td><td>:</td><td colSpan="4" className="italic text-gray-700">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. SURAT PERINTAH JALAN */}
                <div className="border-2 border-black mb-3 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-1">
                        <span className="font-bold text-xs uppercase">II. Surat Perintah Jalan</span>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[10pt]">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-40 py-1 font-bold">Kendaraan / Unit</td><td className="w-4">:</td><td className="font-black uppercase">{fleet?.mobil || '.................................'}</td>
                                    <td className="w-40 py-1 font-bold pl-4">Nomor Polisi</td><td className="w-4">:</td><td className="font-black text-blue-800 tracking-widest">{fleet?.plat_nomor || '.................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Nama Pengemudi</td><td>:</td><td className="font-bold text-gray-800 uppercase italic">{fleet?.pengemudi || '.................................'}</td>
                                    <td className="py-1 font-bold pl-4">Admin Penetap</td><td>:</td><td>{fleet?.admin?.name || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. DATA SECURITY CHECK (LENGKAP: JARAK & LAMA) */}
                <div className="border-2 border-black mb-3 overflow-hidden shadow-sm">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-1">
                        <span className="font-bold text-xs uppercase">III. Data Operasional / Security Check</span>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[10pt]">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-40 py-1 font-bold">KM Awal</td><td className="w-4">:</td><td>{security?.km_awal ? `${security.km_awal} KM` : '.......... KM'}</td>
                                    <td className="w-40 py-1 font-bold pl-4">KM Akhir</td><td className="w-4">:</td><td>{security?.km_akhir ? `${security.km_akhir} KM` : '.......... KM'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold text-blue-700">Jarak Tempuh</td><td>:</td><td className="font-black text-blue-700">{security?.jarak_tempuh ? `${security.jarak_tempuh} KM` : '.......... KM'}</td>
                                    <td className="py-1 font-bold text-blue-700 pl-4">Lama Dipergunakan</td><td>:</td><td className="font-black text-blue-700">{security?.lama_waktu || '....................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Waktu Berangkat</td><td>:</td><td>{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleTimeString('id-ID') : '-'} WIB</td>
                                    <td className="py-1 font-bold pl-4">Waktu Kembali</td><td>:</td><td>{security?.jam_kembali ? new Date(security.jam_kembali).toLocaleTimeString('id-ID') : '-'} WIB</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. BARCODE / E-SIGNATURE */}
                <div className="border-2 border-black mb-3 p-2">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-bold mb-1 uppercase text-gray-500">Pemohon</p>
                            <div className="w-20 h-20 border border-black p-0.5 shadow-sm">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                            </div>
                            <p className="text-[10px] font-black mt-1 underline uppercase">{(request.nama || request.user?.name || '-').toUpperCase()}</p>
                            <p className="text-[8px] text-gray-500 leading-none">{request.jabatan || request.user?.role}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-bold mb-1 uppercase text-gray-500">Menyetujui,</p>
                            <div className="w-20 h-20 border border-black p-0.5 shadow-sm">
                                {approval?.barcode_asmen ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[7px] text-gray-300 italic">BELUM DISETUJUI</div>
                                )}
                            </div>
                            <p className="text-[10px] font-black mt-1 underline uppercase">{approval?.asmen?.name || '-'}</p>
                            <p className="text-[8px] text-gray-500 leading-none">ASMEN / KKU</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-bold mb-1 uppercase text-gray-500">Admin Fleet</p>
                            <div className="w-20 h-20 border border-black p-0.5 shadow-sm">
                                {fleet?.barcode_fleet ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[7px] text-gray-300 italic text-center">NOT ISSUED</div>
                                )}
                            </div>
                            <p className="text-[10px] font-black mt-1 underline uppercase">{fleet?.admin?.name || '-'}</p>
                            <p className="text-[8px] text-gray-500 leading-none">ADMIN SEKSI UMUM</p>
                        </div>
                    </div>
                </div>

                {/* 6. FOTO LAMPIRAN */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-gray-100 border-b-2 border-black px-2 py-0.5 text-center font-bold text-[9px] uppercase tracking-widest">
                        Lampiran Dokumentasi Foto Operasional (Security)
                    </div>
                    <div className="p-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center gap-1">
                                <p className="font-bold text-[8px] uppercase text-gray-400">Dokumentasi Berangkat</p>
                                <div className="grid grid-cols-2 gap-1 w-full">
                                    <div className="border border-black aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_driver_berangkat ? <img src={security.foto_driver_berangkat} className="w-full h-full object-cover" /> : <span className="text-[7px] text-gray-300 italic">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_km_berangkat ? <img src={security.foto_km_berangkat} className="w-full h-full object-cover" /> : <span className="text-[7px] text-gray-300 italic">KM</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="font-bold text-[8px] uppercase text-gray-400">Dokumentasi Kembali</p>
                                <div className="grid grid-cols-2 gap-1 w-full">
                                    <div className="border border-black aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_driver_kembali ? <img src={security.foto_driver_kembali} className="w-full h-full object-cover" /> : <span className="text-[7px] text-gray-300 italic">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {security?.foto_km_kembali ? <img src={security.foto_km_kembali} className="w-full h-full object-cover" /> : <span className="text-[7px] text-gray-300 italic">KM</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[7pt] text-gray-400 italic font-bold">Dokumen ini diterbitkan secara elektronik oleh Sistem E-Transport PLN UP2D Riau | {new Date().toLocaleString('id-ID')} WIB</p>
                </div>
            </div>

            <div className="mt-6 no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-black text-white font-bold py-3 px-12 rounded shadow-xl active:scale-95 transition-all">CETAK SURAT</button>
                <button onClick={() => window.history.back()} className="bg-white border-2 border-black text-black font-bold py-3 px-12 rounded hover:bg-gray-50 active:scale-95 transition-all">KEMBALI</button>
            </div>
        </div>
    );
}
