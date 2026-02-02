"use client";
import React, { useRef, useState } from 'react';

export default function CameraCapture({ onCapture, label }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
        try {
            setError('');
            setPreview(null);

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser Anda tidak mendukung akses kamera atau tidak menggunakan HTTPS/Localhost.");
            }

            // Set streaming true first so the video element is rendered and Ref is available
            setIsStreaming(true);

            // Use very relaxed constraints for maximum compatibility
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            }).catch(async (err) => {
                console.warn("Retrying with environment mode...");
                return await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
            });

            streamRef.current = stream;

            // Use a small timeout to ensure video element is rendered and Ref is attached
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(e => console.error("Play error:", e));
                } else {
                    setError("Gagal menginisialisasi element video. Silakan coba lagi.");
                    stopCamera();
                }
            }, 100);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsStreaming(false);
            let errorMessage = "Kamera bermasalah: ";
            if (err.name === 'NotAllowedError') errorMessage += "Izin ditolak.";
            else if (err.name === 'NotFoundError') errorMessage += "Kamera tidak ditemukan.";
            else errorMessage += err.message;
            setError(errorMessage);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsStreaming(false);
    };

    const capturePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const context = canvasRef.current.getContext('2d');
            // Use actual video dimensions
            const width = videoRef.current.videoWidth || 640;
            const height = videoRef.current.videoHeight || 480;

            canvasRef.current.width = width;
            canvasRef.current.height = height;
            context.drawImage(videoRef.current, 0, 0, width, height);

            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
            setPreview(dataUrl);
            onCapture(dataUrl);
            stopCamera();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                onCapture(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-3 font-primary">
            <label className="block text-sm font-bold text-slate-700">{label}</label>

            {/* Error Message */}
            {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-xs font-bold">
                    ⚠️ {error}
                </div>
            )}

            {/* Viewport */}
            <div className="relative glass-card overflow-hidden bg-slate-900 aspect-video flex items-center justify-center rounded-xl shadow-inner border-2 border-slate-200">
                {/* Always render video for Ref, but hide if not streaming */}
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
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center px-4">
                        📷 Siap Mengambil Gambar
                    </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                {!isStreaming ? (
                    <>
                        <button
                            type="button"
                            onClick={startCamera}
                            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            📸 Kamera Live
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3.5 rounded-xl shadow transition-all active:scale-95"
                        >
                            📁 Upload File
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileUpload}
                        />
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            ✓ Simpan Foto
                        </button>
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            ✕
                        </button>
                    </>
                )}
            </div>
            {preview && !isStreaming && (
                <p className="text-[10px] text-emerald-600 font-bold italic text-center">✨ Gambar berhasil dipilih</p>
            )}
        </div>
    );
}
