"use client";
import React from 'react';

/**
 * Komponen Toast (Popup Notifikasi)
 * 
 * Deskripsi: Menampilkan pesan info, sukses, peringatan, atau gagal dalam bentuk modal kecil
 * dengan animasi yang halus.
 * 
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe notifikasi ('success', 'error', 'warning', 'info')
 * @param {Function} onClose - Callback untuk menutup toast
 */
export default function Toast({ message, type = 'success', onClose }) {
    // Definisi ikon untuk setiap tipe
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    // Konfigurasi gradien warna sesuai tipe
    const colors = {
        success: 'from-green-500 to-green-600',
        error: 'from-red-500 to-red-600',
        warning: 'from-amber-500 to-amber-600',
        info: 'from-blue-500 to-blue-600'
    };

    // Warna background container
    const bgColors = {
        success: 'bg-green-50',
        error: 'bg-red-50',
        warning: 'bg-amber-50',
        info: 'bg-blue-50'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className={`${bgColors[type]} rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp`}>

                {/* Bagian Header dengan Ikon */}
                <div className={`bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-t-2xl flex items-center gap-3`}>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                        {icons[type]}
                    </div>
                    <h3 className="text-lg font-bold">
                        {type === 'success' && 'Berhasil!'}
                        {type === 'error' && 'Gagal!'}
                        {type === 'warning' && 'Peringatan!'}
                        {type === 'info' && 'Informasi'}
                    </h3>
                </div>

                {/* Isi Pesan */}
                <div className="px-6 py-6">
                    <p className="text-gray-800 text-base leading-relaxed">{message}</p>
                </div>

                {/* Tombol Aksi (Tutup) */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className={`w-full bg-gradient-to-r ${colors[type]} text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95`}
                    >
                        OK, Mengerti
                    </button>
                </div>
            </div>

            {/* Animasi Lokal CSS */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
