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

    // Generate QR Code data dengan text yang informatif
    const generateQRData = (type) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const docId = String(id).padStart(4, '0');

        if (type === 'pemohon') {
            const tanggalSubmit = new Date(request.created_at || request.tanggal_jam_berangkat).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            return `PT PLN (PERSERO) UP2D RIAU\nVERIFIKASI TANDA TANGAN DIGITAL\n\n` +
                `ID PERMOHONAN: #${docId}\n` +
                `STATUS: TELAH DIAJUKAN\n` +
                `NAMA: ${request.nama || request.user?.name}\n` +
                `WAKTU: ${tanggalSubmit} WIB\n\n` +
                `Dokumen sah secara elektronik.`;
        }

        if (type === 'approver' && approval) {
            const tanggalApprove = new Date(approval.approved_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            const status = approval.is_approved ? 'DISETUJUI' : 'DITOLAK';
            return `PT PLN (PERSERO) UP2D RIAU\nVERIFIKASI TANDA TANGAN DIGITAL\n\n` +
                `ID PERMOHONAN: #${docId}\n` +
                `STATUS: ${status}\n` +
                `NAMA: ${approval.asmen?.name || 'ASMEN'}\n` +
                `WAKTU: ${tanggalApprove} WIB\n\n` +
                `Dokumen sah secara elektronik.`;
        }

        if (type === 'fleet' && fleet) {
            const tanggalFleet = new Date(fleet.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            return `PT PLN (PERSERO) UP2D RIAU\nVERIFIKASI TANDA TANGAN DIGITAL\n\n` +
                `ID PERMOHONAN: #${docId}\n` +
                `STATUS: KENDARAAN DITETAPKAN\n` +
                `MOBIL: ${fleet.mobil} (${fleet.plat_nomor})\n` +
                `NAMA: ${fleet.admin?.name || 'ADMIN FLEET'}\n` +
                `WAKTU: ${tanggalFleet} WIB\n\n` +
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
                    color: rgba(6, 182, 212, 0.05);
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

            <div className="watermark-c">C</div>

            <div className="content-layer">
                {/* KOP SURAT */}
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

                {/* DATA PEMOHON */}
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
                                    <td className="w-1/3 font-bold">{request.nama || request.user?.name}</td>
                                    <td className="w-32 py-0.5 font-semibold pl-4">Jabatan</td>
                                    <td className="w-3">:</td>
                                    <td>{request.jabatan || request.user?.role}</td>
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
                                    <td className="uppercase">{request.tujuan}</td>
                                    <td className="py-0.5 font-semibold pl-4">Jumlah Penumpang</td>
                                    <td>:</td>
                                    <td>{request.jumlah_penumpang || '-'} orang</td>
                                </tr>
                                <tr>
                                    <td className="py-0.5 font-semibold">Keperluan</td>
                                    <td>:</td>
                                    <td colSpan="4" className="italic">{request.keperluan}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PERINTAH JALAN */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Perintah Jalan</h3>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-32 py-1 font-semibold">Kendaraan</td>
                                    <td className="w-3">:</td>
                                    <td className="w-1/3 font-bold uppercase tracking-tight">{fleet?.mobil || '.................................'}</td>
                                    <td className="w-32 py-1 font-semibold pl-4">Nomor Polisi</td>
                                    <td className="w-3">:</td>
                                    <td className="font-bold text-blue-800">{fleet?.plat_nomor || '.................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">Nama Pengemudi</td>
                                    <td>:</td>
                                    <td colSpan="4" className="font-semibold uppercase italic">{fleet?.pengemudi || '.................................'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DATA SECURITY */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Data Operasional (Security)</h3>
                    </div>
                    <div className="p-2">
                        <table className="w-full text-[9px]">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="w-40 py-1 font-semibold">KM Awal (Berangkat)</td>
                                    <td className="w-3">:</td>
                                    <td className="w-1/3">{security?.km_awal} KM</td>
                                    <td className="w-40 py-1 font-semibold pl-4">KM Akhir (Kembali)</td>
                                    <td className="w-3">:</td>
                                    <td>{security?.km_akhir} KM</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-semibold">Waktu Berangkat</td>
                                    <td>:</td>
                                    <td>{security?.jam_berangkat ? new Date(security.jam_berangkat).toLocaleString('id-ID') : '-'}</td>
                                    <td className="py-1 font-semibold pl-4">Waktu Kembali</td>
                                    <td>:</td>
                                    <td>{security?.jam_kembali ? new Date(security.jam_kembali).toLocaleString('id-ID') : '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TANDA TANGAN DIGITAL */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white text-center">Tanda Tangan Digital (E-Signature)</h3>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {/* Barcode 1: Pemohon */}
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-bold mb-2">PEMOHON</p>
                                <div className="w-24 h-24 border-2 border-black p-0.5 bg-white">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('pemohon'))}`} alt="QR" className="w-full h-full" />
                                </div>
                                <p className="text-[10px] font-black mt-2 underline">{(request.nama || request.user?.name || '-').toUpperCase()}</p>
                            </div>

                            {/* Barcode 2: Asmen */}
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-bold mb-2">MENYETUJUI</p>
                                <div className="w-24 h-24 border-2 border-black p-0.5 bg-white">
                                    {approval?.barcode_asmen ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('approver'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-[8px] text-gray-400 italic">PENDING</div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black mt-2 underline">{(approval?.asmen?.name || 'BELUM DISETUJUI').toUpperCase()}</p>
                            </div>

                            {/* Barcode 3: Fleet */}
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-bold mb-2">ADMIN FLEET</p>
                                <div className="w-24 h-24 border-2 border-black p-0.5 bg-white">
                                    {fleet?.barcode_fleet ? (
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateQRData('fleet'))}`} alt="QR" className="w-full h-full" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-[8px] text-gray-400 italic">BELUM TERBIT</div>
                                    )}
                                </div>
                                <p className="text-[10px] font-black mt-2 underline">{(fleet?.admin?.name || 'BELUM DITETAPKAN').toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOKUMENTASI FOTO */}
                <div className="border-2 border-black mb-2">
                    <div className="bg-black px-2 py-0.5">
                        <h3 className="font-bold text-[10px] uppercase text-white">Dokumentasi Foto Operasional</h3>
                    </div>
                    <div className="p-2">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Berangkat */}
                            <div>
                                <p className="text-[9px] font-bold mb-1 text-center bg-gray-100 py-1 border border-black">BERANGKAT</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-black aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {security?.foto_driver_berangkat ? (
                                            <img src={security.foto_driver_berangkat} alt="Dvr" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[7px] text-gray-400">Foto Driver</span>
                                        )}
                                    </div>
                                    <div className="border border-black aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {security?.foto_km_berangkat ? (
                                            <img src={security.foto_km_berangkat} alt="KM" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[7px] text-gray-400">Foto KM</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Kembali */}
                            <div>
                                <p className="text-[9px] font-bold mb-1 text-center bg-gray-100 py-1 border border-black">KEMBALI</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="border border-black aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {security?.foto_driver_kembali ? (
                                            <img src={security.foto_driver_kembali} alt="Dvr" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[7px] text-gray-400">Foto Driver</span>
                                        )}
                                    </div>
                                    <div className="border border-black aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {security?.foto_km_kembali ? (
                                            <img src={security.foto_km_kembali} alt="KM" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[7px] text-gray-400">Foto KM</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-2">
                    <p className="text-[8px] text-gray-400 italic">Pencetakan: {new Date().toLocaleString('id-ID')} WIB | ID Dokumen: #{id}</p>
                </div>
            </div>

            <div className="mt-8 no-print flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-10 rounded-lg shadow-lg">CETAK SURAT</button>
                <button onClick={() => window.history.back()} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold py-3 px-10 rounded-lg">KEMBALI</button>
            </div>
        </div>
    );
}
