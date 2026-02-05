"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Toast from '@/components/Toast';

/**
 * Halaman Login Utama
 * 
 * Deskripsi: Gerbang masuk aplikasi E-Transport.
 * Menangani otentikasi pengguna, penyimpanan token JWT, 
 * dan memiliki desain modern dengan split-screen (branding & form).
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  /**
   * Menampilkan notifikasi popup (Toast)
   */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  /**
   * Menangani proses login saat form dikirim
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Kirim kredensial ke API Login
      const data = await api.post('/api/auth/login', { email, password });

      // Simpan Token dan Data User ke LocalStorage jika berhasil
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Arahkan ke Dashboard
      router.push('/dashboard');
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Sisi Kiri - Branding, Logo PLN, & Ilustrasi Fitur (Hanya di Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gambar Latar Belakang */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/bg-pln.jpg)' }}
        ></div>

        {/* Overlay Gradien Biru agar teks mudah dibaca */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-sky-900/90"></div>

        {/* Pola Latar Belakang Animasi (Efek Blur Gelombang) */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Konten Branding */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-8 animate-fade-in drop-shadow-2xl">
            <img
              src="/images/logo-pln.png"
              alt="Logo PLN"
              className="w-40 h-auto"
            />
          </div>

          <h1 className="text-5xl font-bold mb-4 text-center animate-slide-up">
            E-Transport
          </h1>
          <p className="text-xl text-blue-100 mb-8 text-center animate-slide-up delay-100">
            Sistem Manajemen Kendaraan Dinas
          </p>

          {/* Kartu Informasi Fitur Utama */}
          <div className="space-y-4 w-full max-w-md animate-slide-up delay-200">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-10 h-10 bg-yellow-400/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Pengajuan Real-time</p>
                <p className="text-sm text-blue-100">Proses persetujuan otomatis</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-10 h-10 bg-yellow-400/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Monitoring 24/7</p>
                <p className="text-sm text-blue-100">Tracking kendaraan secara langsung</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="w-10 h-10 bg-yellow-400/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Laporan Digital</p>
                <p className="text-sm text-blue-100">Dokumentasi lengkap & terstruktur</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-blue-100 text-sm">
            <p className="font-semibold">PLN UP2D RIAU</p>
            <p className="mt-1">Unit Pelaksana Pelayanan Distribusi</p>
          </div>
        </div>
      </div>

      {/* Sisi Kanan - Formulir Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          {/* Logo untuk tampilan Mobile (Layar kecil) */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex mb-4 drop-shadow-md">
              <img
                src="/images/logo-pln.png"
                alt="Logo PLN"
                className="w-32 h-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">E-Transport</h1>
            <p className="text-slate-500">PLN UP2D RIAU</p>
          </div>

          {/* Kartu Login */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
              <p className="text-slate-500">Silakan masuk dengan akun Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    placeholder="nama@pln.co.id"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  {/* Tombol Tampil/Sembunyi Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Tombol Login (Masuk) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer Form */}
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-500">
                © 2026 PT PLN (Persero) - Unit Pelaksana Pelayanan Distribusi Riau
              </p>
            </div>
          </div>

          {/* Teks Bantuan */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Butuh bantuan? Hubungi <a href="mailto:pln123@pln.co.id" className="text-sky-600 font-semibold hover:underline">pln123@pln.co.id</a>
            </p>
          </div>
        </div>
      </div>

      {/* Komponen Notifikasi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
