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

    // Generate QR Code data dengan text yang informatif
    const generateQRData = (type) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

        if (type === 'pemohon') {
            const tanggalSubmit = new Date(request.created_at || request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return `Surat Permohonan Angkutan ini diajukan oleh ${request.nama} (${request.jabatan}) pada tanggal ${tanggalSubmit} WIB. ID Permohonan: ${id}. Verifikasi: ${baseUrl}/verify/${request.barcode_pemohon}`;
        }

        if (type === 'approver' && approval) {
            const tanggalApprove = new Date(approval.approved_at).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const status = approval.is_approved ? 'disetujui' : 'ditolak';
            return `Surat ini sudah ${status} oleh ${approval.role || 'Asmen/KKU'} pada tanggal ${tanggalApprove} WIB. ID Permohonan: ${id}. Verifikasi: ${baseUrl}/verify/${approval.barcode_asmen}`;
        }

        if (type === 'fleet' && fleet) {
            const tanggalFleet = new Date(fleet.created_at).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return `Kendaraan ${fleet.mobil} (${fleet.plat_nomor}) dengan pengemudi ${fleet.pengemudi} telah ditetapkan oleh Admin Fleet/KKU pada tanggal ${tanggalFleet} WIB. ID Permohonan: ${id}. Verifikasi: ${baseUrl}/verify/${fleet.barcode_fleet}`;
        }

        return `${baseUrl}/verify/pending`;
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
                
                /* Watermark C Background - Lurus */
                .watermark-c {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 550px;
                    font-weight: 900;
                    color: rgba(220, 38, 38, 0.08);
                    z-index: 0;
                    pointer-events: none;
                    font-family: 'Arial Black', sans-serif;
                    line-height: 1;
                }
                
                .content-layer {
                    position: relative;
                    z-index: 1;
                }
            `}</style>

            {/* Watermark C - Lurus */}
            <div className="watermark-c">C</div>

            {/* Content Layer */}
            <div className="content-layer">
                {/* KOP SURAT - KIRI ATAS */}
                <div className="mb-2 pb-2 border-b-4 border-black">
                    <h1 className="text-xs font-bold leading-tight uppercase">PT PLN (PERSERO) DISTRIBUSI RIAU DAN KEPULAUAN RIAU</h1>
                    <div className="h-px bg-black my-0.5"></div>
                    <p className="text-[10px] font-semibold">PT PLN (PERSERO) - Unit Pelaksana Pengatur Distribusi Riau (UP2D)</p>
                </div>

                {/* JUDUL SURAT */}
                <div className="text-center mb-2 py-1 border-y-2 border-black">
                    <h2 className="text-base font-bold uppercase tracking-wide">PERMOHONAN ANGKUTAN</h2>
                    <p className="text-[10px] mt-0.5 font-semibold">UNTUK KEPERLUAN DINAS / SOSIAL</p>
                </div>

                {/* DATA PEMOHON - 2 KOLOM */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Data Pemohon</h3>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-0.5 font-semibold">Nama Lengkap</td>
                                    <td className="w-3">:</td>
                                    <td className="w-1/3">{request.nama}</td>
                                    <td className="w-32 py-0.5 font-semibold pl-4">Jabatan</td>
                                    <td className="w-3">:</td>
                                    <td>{request.jabatan}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-0.5 font-semibold">Bagian/Bidang</td>
                                    <td>:</td>
                                    <td>{request.bagian}</td>
                                    <td className="py-0.5 font-semibold pl-4">Macam Kendaraan</td>
                                    <td>:</td>
                                    <td>{request.macam_kendaraan || '-'}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-0.5 font-semibold">Lokasi Tujuan</td>
                                    <td>:</td>
                                    <td>{request.tujuan}</td>
                                    <td className="py-0.5 font-semibold pl-4">Jumlah Penumpang</td>
                                    <td>:</td>
                                    <td>{request.jumlah_penumpang || '-'} orang</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-0.5 font-semibold">Keperluan</td>
                                    <td>:</td>
                                    <td colSpan="4">{request.keperluan}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-semibold">Tanggal & Waktu</td>
                                    <td>:</td>
                                    <td>{new Date(request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })} WIB</td>
                                    <td className="py-0.5 font-semibold pl-4">Estimasi Durasi</td>
                                    <td>:</td>
                                    <td>{request.lama_pakai || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PERINTAH JALAN - 2 KOLOM (TANPA STATUS PERSETUJUAN) */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Perintah Jalan</h3>
                    </div>
                    <div className="bg-gray-50 px-2 py-0.5 border-b border-black">
                        <p className="text-[8px] italic font-semibold">(DIISI OLEH SEKSI KEUANGAN DAN UMUM)</p>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-0.5 font-semibold">Kendaraan</td>
                                    <td className="w-3">:</td>
                                    <td className="w-1/3">{fleet?.mobil || '.................................'}</td>
                                    <td className="w-32 py-0.5 font-semibold pl-4">Nomor Polisi</td>
                                    <td className="w-3">:</td>
                                    <td className="font-bold">{fleet?.plat_nomor || '.................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-semibold">Nama Pengemudi</td>
                                    <td>:</td>
                                    <td colSpan="4">{fleet?.pengemudi || '.................................'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DATA SECURITY - 2 KOLOM */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Data Operasional (Security)</h3>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-0.5 font-semibold">KM Awal (Berangkat)</td>
                                    <td className="w-3">:</td>
                                    <td className="w-1/3">{security?.km_awal || '.................................'} KM</td>
                                    <td className="w-32 py-0.5 font-semibold pl-4">KM Akhir (Kembali)</td>
                                    <td className="w-3">:</td>
                                    <td>{security?.km_akhir || '.................................'} KM</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-0.5 font-semibold">Jarak Tempuh</td>
                                    <td>:</td>
                                    <td className="font-bold">{security?.jarak_tempuh ? `${security.jarak_tempuh} KM` : '.................................'}</td>
                                    <td className="py-0.5 font-semibold pl-4">Lama Waktu</td>
                                    <td>:</td>
                                    <td>{security?.lama_waktu || '.................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-semibold">Jam Berangkat</td>
                                    <td>:</td>
                                    <td>{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleTimeString('id-ID') + ' WIB' : '.................................'}</td>
                                    <td className="py-0.5 font-semibold pl-4">Jam Kembali</td>
                                    <td>:</td>
                                    <td>{security?.jam_kembali ? new Date(security.jam_kembali).toLocaleTimeString('id-ID') + ' WIB' : '.................................'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* BARCODE 3 SECTION - DENGAN TANGGAL SUBMIT */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Tanda Tangan Digital (QR Code)</h3>
                    </div>
                    <div className="p-2">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {/* Barcode 1: Pemohon */}
                            <div className="flex flex-col items-center">
                                <p className="text-[9px] font-bold mb-1 uppercase">Pemohon</p>
                                <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center p-0.5">
                                    {request.barcode_pemohon ? (
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`}
                                            alt="QR Pemohon"
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <div className="text-[7px] text-gray-400">BELUM</div>
                                    )}
                                </div>
                                <p className="text-[8px] font-semibold mt-1">{request.nama}</p>
                                <p className="text-[7px] text-gray-600 mt-0.5">
                                    Diajukan: {new Date(request.created_at || request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })} WIB
                                </p>
                            </div>

                            {/* Barcode 2: Asmen/KKU */}
                            <div className="flex flex-col items-center">
                                <p className="text-[9px] font-bold mb-1 uppercase">Menyetujui</p>
                                <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center p-0.5">
                                    {approval?.barcode_asmen ? (
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`}
                                            alt="QR Approver"
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <div className="text-[7px] text-gray-400">BELUM</div>
                                    )}
                                </div>
                                <p className="text-[8px] font-semibold mt-1">Asmen / KKU</p>
                                <p className="text-[7px] text-gray-600 mt-0.5">
                                    {approval?.approved_at ? (
                                        <>Disetujui: {new Date(approval.approved_at).toLocaleString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} WIB</>
                                    ) : '-'}
                                </p>
                            </div>

                            {/* Barcode 3: Admin Fleet */}
                            <div className="flex flex-col items-center">
                                <p className="text-[9px] font-bold mb-1 uppercase">Admin Fleet</p>
                                <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center p-0.5">
                                    {fleet?.barcode_fleet ? (
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`}
                                            alt="QR Fleet"
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <div className="text-[7px] text-gray-400">BELUM</div>
                                    )}
                                </div>
                                <p className="text-[8px] font-semibold mt-1">KKU / Admin Fleet</p>
                                <p className="text-[7px] text-gray-600 mt-0.5">
                                    {fleet?.created_at ? (
                                        <>Ditetapkan: {new Date(fleet.created_at).toLocaleString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })} WIB</>
                                    ) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOKUMENTASI FOTO */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Dokumentasi Foto</h3>
                    </div>
                    <div className="p-2">
                        <div className="grid grid-cols-2 gap-2">
                            {/* Foto Berangkat */}
                            <div>
                                <p className="text-[8px] font-bold mb-1 text-center bg-gray-100 py-0.5 border border-black">SAAT BERANGKAT</p>
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_driver_berangkat ? (
                                            <img src={security.foto_driver_berangkat} alt="Driver Berangkat" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto Driver</span>
                                        )}
                                    </div>
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_km_berangkat ? (
                                            <img src={security.foto_km_berangkat} alt="KM Berangkat" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto KM</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Foto Kembali */}
                            <div>
                                <p className="text-[8px] font-bold mb-1 text-center bg-gray-100 py-0.5 border border-black">SAAT KEMBALI</p>
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_driver_kembali ? (
                                            <img src={security.foto_driver_kembali} alt="Driver Kembali" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto Driver</span>
                                        )}
                                    </div>
                                    <div className="border border-black aspect-square flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {security?.foto_km_kembali ? (
                                            <img src={security.foto_km_kembali} alt="KM Kembali" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[8px] text-gray-400">Foto KM</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - DALAM 1 HALAMAN */}
                <div className="pt-1 border-t border-gray-300 text-center">
                    <p className="text-[7px] text-gray-600">
                        Dokumen dicetak dari Sistem E-Transport PLN UP2D Riau |
                        Waktu: {new Date().toLocaleString('id-ID')} WIB |
                        ID: #{String(id).padStart(4, '0')}
                    </p>
                </div>
            </div>

            {/* Print Button */}
            <div className="mt-8 no-print text-center space-y-3">
                <button
                    onClick={() => window.print()}
                    className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-lg shadow-xl transition-all"
                >
                    Cetak Surat Sekarang
                </button>
                <p className="text-xs text-gray-500">Format: A4 Portrait | 1 Halaman | QR Code dengan Text Informatif</p>
            </div>
        </div>
    );
}
