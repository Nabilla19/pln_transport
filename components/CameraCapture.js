"use client";
import React, { useRef, useState } from 'react';

/**
 * Komponen CameraCapture
 * 
 * Deskripsi: Komponen untuk mengambil foto secara langsung menggunakan WebRTC API (Kamera Laptop/HP)
 * atau mengunggah file gambar dari penyimpanan perangkat.
 * 
 * @param {Function} onCapture - Callback yang dipanggil saat gambar berhasil diambil
 * @param {string} label - Label teks untuk input
 */
export default function CameraCapture({ onCapture, label }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // Default: kamera belakang (untuk HP)
    const streamRef = useRef(null);

    /**
     * Memulai aliran video dari kamera
     */
    const startCamera = async (mode = facingMode) => {
        try {
            setError('');
            setPreview(null);

            // Cek dukungan browser
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser Anda tidak mendukung akses kamera secara langsung. Silakan gunakan tombol 'Ambil/Upload File'.");
            }

            // Hentikan stream yang sedang berjalan jika ada
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            setIsStreaming(true);

            // Konfigurasi stream video
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 800 },
                    height: { ideal: 600 }
                }
            });

            streamRef.current = stream;

            // Sambungkan stream ke elemen <video>
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().catch(e => console.error("Play error:", e));
                    };
                }
            }, 200);

        } catch (err) {
            console.error("Error saat mengakses kamera:", err);
            setIsStreaming(false);
            let errorMessage = "Masalah Kamera: ";
            if (err.name === 'NotAllowedError') errorMessage += "Izin kamera ditolak.";
            else if (err.name === 'NotFoundError') errorMessage += "Kamera tidak ditemukan.";
            else errorMessage += "Gunakan tombol 'Ambil/Upload File' saja.";
            setError(errorMessage);
        }
    };

    /**
     * Mengganti antara kamera depan dan kamera belakang
     */
    const toggleCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newMode);
        if (isStreaming) {
            startCamera(newMode);
        }
    };

    /**
     * Menghentikan kamera dan membersihkan stream
     */
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsStreaming(false);
    };

    /**
     * Mengambil gambar (snapshot) dari video stream
     */
    const capturePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            // Pastikan video sudah siap
            if (videoRef.current.readyState < 2) {
                setError("Kamera belum siap, mohon tunggu sebentar...");
                return;
            }

            const context = canvasRef.current.getContext('2d');
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;

            canvasRef.current.width = width;
            canvasRef.current.height = height;

            // Gambar frame video ke canvas
            context.drawImage(videoRef.current, 0, 0, width, height);

            // Konversi canvas ke format gambar JPEG (Base64)
            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);

            setPreview(dataUrl);
            onCapture(dataUrl); // Kirim hasil ke parent component
            stopCamera();
        }
    };

    /**
     * Menangani input file gambar dari galeri/folder
     */
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                onCapture(reader.result);
                setError('');
                setIsStreaming(false);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-3 font-primary">
            <label className="block text-sm font-bold text-slate-700">{label}</label>

            {/* Menampilkan pesan error jika ada */}
            {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-[10px] font-bold">
                    ⚠️ {error}
                </div>
            )}

            {/* Area Tampilan Kamera / Preview Gambar */}
            <div className="relative glass-card overflow-hidden bg-slate-900 aspect-video flex items-center justify-center rounded-xl shadow-inner border-2 border-slate-200 group">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
                />

                {preview && !isStreaming && (
                    <img src={preview} className="w-full h-full object-cover" alt="Capture Preview" />
                )}

                {!isStreaming && !preview && (
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center px-4">
                        📷 Siap Dokumentasi
                    </div>
                )}

                {/* Tombol tukar kamera (hanya muncul saat streaming) */}
                {isStreaming && (
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            type="button"
                            onClick={toggleCamera}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition-all"
                            title="Ganti Kamera"
                        >
                            🔄
                        </button>
                    </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Tombol Kontrol Kamera */}
            <div className="flex gap-2">
                {!isStreaming ? (
                    <>
                        <button
                            type="button"
                            onClick={() => startCamera()}
                            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            🎥 Buka Kamera
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-3 rounded-xl shadow transition-all active:scale-95"
                        >
                            🖼️ Ambil/Upload Foto
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 animate-pulse"
                        >
                            📸 Ambil Gambar
                        </button>
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
                        >
                            ✕
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
