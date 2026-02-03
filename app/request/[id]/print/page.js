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
                setTimeout(() => window.print(), 2000);
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

    // URL to show the document (View/Print page)
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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
                
                /* Force Black Text for everything inside the document */
                .document-body, .document-body * {
                    color: black !important;
                    border-color: black !important;
                }
                
                /* Reset for buttons to be visible on screen */
                .no-print button {
                    color: white !important;
                }
                .no-print .bg-white {
                    color: black !important;
                }
            `}</style>

            <div className="mx-auto max-w-[21cm] document-body border border-gray-100 p-4 print:border-0 print:p-0">
                {/* TOP BARCODE (Seberang Kop) */}
                <div className="flex justify-end mb-4 h-24">
                    <div className="flex flex-col items-center border border-black p-1 bg-white">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(currentUrl)}`} alt="ScanDoc" className="w-20 h-20" />
                        <span className="text-[7px] font-bold mt-0.5">SCAN DOKUMEN</span>
                    </div>
                </div>

                {/* 1. KOP SURAT */}
                <div className="flex items-center gap-4 border-b-4 border-black pb-2 mb-4 -mt-24">
                    <img src="/images/logo-pln.png" alt="Logo PLN" className="w-16 h-auto" />
                    <div className="flex-1">
                        <h1 className="text-sm font-bold leading-tight uppercase">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                        <div className="h-px bg-black my-0.5"></div>
                        <p className="text-[11px] font-semibold">UNIT PELAKSANA PENGATUR DISTRIBUSI RIAU (UP2D)</p>
                        <p className="text-[9px]">Alamat: Jl. Setia Budi No. 96, Pekanbaru</p>
                    </div>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-4">
                    <h2 className="text-base font-bold uppercase underline decoration-1">PERMOHONAN ANGKUTAN</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5">UNTUK KEPERLUAN DINAS / SOSIAL</p>
                    <p className="text-[9px] font-semibold">Nomor: {String(id).padStart(4, '0')}/TRS/UP2D-RIAU/{new Date().getFullYear()}</p>
                </div>

                {/* 2. DATA PEMOHON */}
                <div className="border border-black mb-3">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-xs uppercase italic">I. Data Pemohon</div>
                    <div className="p-2">
                        <table className="w-full text-[10pt]">
                            <tbody>
                                <tr className="border-b border-gray-100 italic">
                                    <td className="w-40 py-1 font-bold">Nama Lengkap</td><td className="w-4">:</td><td className="font-normal">{request.nama || request.user?.name}</td>
                                    <td className="w-40 py-1 font-bold pl-4">Jabatan</td><td className="w-4">:</td><td className="font-normal">{request.jabatan || request.user?.role}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold">Bagian/Bidang</td><td>:</td><td className="font-normal">{request.bagian}</td>
                                    <td className="py-1 font-bold pl-4">Macam Kendaraan</td><td>:</td><td className="font-normal">{request.macam_kendaraan || '-'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold">Tujuan Perjalanan</td><td>:</td><td className="uppercase font-normal">{request.tujuan}</td>
                                    <td className="py-1 font-bold pl-4">Jumlah Penumpang</td><td>:</td><td className="font-normal">{request.jumlah_penumpang || '-'} orang</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold">Waktu Berangkat</td><td>:</td><td className="font-normal">{new Date(request.tanggal_jam_berangkat).toLocaleString('id-ID')} WIB</td>
                                    <td className="py-1 font-bold pl-4">Lama Pakai</td><td>:</td><td className="font-normal">{request.lama_pakai || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Keperluan</td><td>:</td><td colSpan="4" className="font-normal italic text-[9pt]">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. SURAT PERINTAH JALAN */}
                <div className="border border-black mb-3">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-xs uppercase italic">II. Surat Perintah Jalan</div>
                    <div className="p-2 text-[10pt]">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-40 py-1 font-bold">Kendaraan / Unit</td><td className="w-4">:</td><td className="font-normal uppercase">{fleet?.mobil || '.................................'}</td>
                                    <td className="w-40 py-1 font-bold pl-4">Nomor Polisi</td><td className="w-4">:</td><td className="font-normal">{fleet?.plat_nomor || '.................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Nama Pengemudi</td><td>:</td><td className="font-normal uppercase italic">{fleet?.pengemudi || '.................................'}</td>
                                    <td className="py-1 font-bold pl-4">Admin Penetap</td><td>:</td><td className="font-normal">{fleet?.admin?.name || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. DATA SECURITY CHECK */}
                <div className="border border-black mb-3">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 font-bold text-xs uppercase italic">III. Data Operasional / Security Check</div>
                    <div className="p-2 text-[10pt]">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="w-40 py-1 font-bold">KM Awal</td><td className="w-4">:</td><td className="font-normal">{security?.km_awal || '1'} KM</td>
                                    <td className="w-40 py-1 font-bold pl-4">KM Akhir</td><td className="w-4">:</td><td className="font-normal">{security?.km_akhir ? `${security.km_akhir} KM` : '.......... KM'}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1 font-bold">Jarak Tempuh</td><td>:</td><td className="font-normal font-bold">{security?.jarak_tempuh ? `${security.jarak_tempuh} KM` : '.......... KM'}</td>
                                    <td className="py-1 font-bold pl-4">Lama Dipergunakan</td><td>:</td><td className="font-normal font-bold">{security?.lama_waktu || '....................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold">Waktu Berangkat</td><td>:</td><td className="font-normal">{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleTimeString('id-ID') : '-'} WIB</td>
                                    <td className="py-1 font-bold pl-4">Waktu Kembali</td><td>:</td><td className="font-normal">{security?.jam_kembali ? `${new Date(security.jam_kembali).toLocaleTimeString('id-ID')} WIB` : '- WIB'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. BARCODE ESIGNATURE */}
                <div className="border border-black mb-3 p-4">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-bold mb-1 uppercase">Pemohon</p>
                            <div className="w-20 h-20 border border-black p-0.5">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                            </div>
                            <p className="text-[10px] mt-1 underline uppercase font-normal">{request.nama || request.user?.name}</p>
                            <p className="text-[8px] leading-none font-normal">{request.jabatan || 'PEGAWAI'}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-bold mb-1 uppercase">Menyetujui,</p>
                            <div className="w-20 h-20 border border-black p-0.5">
                                {approval?.barcode_asmen ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[7px] italic font-normal text-gray-300">BELUM DISETUJUI</div>
                                )}
                            </div>
                            <p className="text-[10px] mt-1 underline uppercase font-normal">{approval?.asmen?.name || '-'}</p>
                            <p className="text-[8px] leading-none font-normal">ASMEN / KKU</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-[9px] font-bold mb-1 uppercase">Admin Fleet</p>
                            <div className="w-20 h-20 border border-black p-0.5">
                                {fleet?.barcode_fleet ? (
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[7px] italic font-normal text-gray-300 text-center">NOT ISSUED</div>
                                )}
                            </div>
                            <p className="text-[10px] mt-1 underline uppercase font-normal">{fleet?.admin?.name || '-'}</p>
                            <p className="text-[8px] leading-none font-normal">ADMIN TRANSPORT</p>
                        </div>
                    </div>
                </div>

                {/* 6. DOKUMENTASI FOTO */}
                <div className="border border-black mb-2 overflow-hidden">
                    <div className="bg-gray-100 border-b border-black px-2 py-0.5 text-center font-bold text-[9px] uppercase tracking-widest italic">Dokumentasi Lampiran (Keamanan)</div>
                    <div className="p-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-center font-bold text-[8px] uppercase">Keberangkatan</p>
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="border border-black aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_driver_berangkat ? <img src={security.foto_driver_berangkat} className="w-full h-full object-cover" /> : <span className="text-[7px] italic font-normal text-gray-300">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_km_berangkat ? <img src={security.foto_km_berangkat} className="w-full h-full object-cover" /> : <span className="text-[7px] italic font-normal text-gray-300">Speedo</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-center font-bold text-[8px] uppercase">Kepulangan</p>
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="border border-black aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_driver_kembali ? <img src={security.foto_driver_kembali} className="w-full h-full object-cover" /> : <span className="text-[7px] italic font-normal text-gray-300">Driver</span>}
                                    </div>
                                    <div className="border border-black aspect-[4/3] bg-white flex items-center justify-center overflow-hidden">
                                        {security?.foto_km_kembali ? <img src={security.foto_km_kembali} className="w-full h-full object-cover" /> : <span className="text-[7px] italic font-normal text-gray-300">Speedo</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[7pt] italic font-bold">Penerbitan Digital E-Transport UP2D Riau | {new Date().toLocaleString('id-ID')} WIB</p>
                </div>
            </div>

            <div className="mt-8 no-print flex justify-center gap-4">
                <button
                    onClick={() => window.print()}
                    className="bg-black text-white px-10 py-3 rounded font-bold shadow-lg"
                >
                    CETAK SURAT
                </button>
                <button
                    onClick={() => router.back()}
                    className="bg-white border-2 border-black text-black px-10 py-3 rounded font-bold"
                >
                    KEMBALI
                </button>
            </div>
        </div>
    );
}
