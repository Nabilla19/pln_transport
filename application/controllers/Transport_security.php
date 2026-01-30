<?php
/**
 * Controller Transport_security
 * 
 * Controller ini menangani logika bisnis tahap akhir: Operasional & Monitoring (Post-Security).
 * Bertugas mencatat riwayat fisik kendaraan saat keluar dan masuk area kantor.
 * 
 * Fitur Utama:
 * 1. Live Camera Capture (WebRTC) untuk dokumentasi pengemudi dan odometer.
 * 2. Upload File Fallback.
 * 3. Kalkulasi Jarak Tempuh (KM Akhir - KM Awal) secara otomatis.
 * 4. Sinkronisasi status kendaraan kembali menjadi 'Available' setelah selesai.
 * 
 * @package CodeIgniter 3
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Transport_security extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model(['Transport_model', 'User_model']);
        $this->load->library(['session', 'form_validation', 'upload']);
        $this->load->helper(['url', 'form']);
        
        // Proteksi Keamanan: Wajib login
        if (!$this->session->userdata('logged_in')) {
            redirect('login');
        }

        // --- CEK OTORISASI ---
        // Pencatatan Pos Security hanya boleh dilakukan oleh Petugas Security (Role 19) atau Admin.
        $role_id = $this->session->userdata('role_id');
        if (!in_array($role_id, [19, 6])) {
            $this->session->set_flashdata('error', 'Anda tidak memiliki hak akses ke menu ini.');
            redirect('dashboard');
        }
    }

    /**
     * index
     * Menampilkan daftar kendaraan yang sedang di luar kantor (Monitor Kendaraan Luar).
     * Membantu security memantau unit mana saja yang belum kembali.
     */
    public function index() {
        $data['page_title'] = 'Pos Security / Notifikasi';
        $data['requests'] = $this->Transport_model->get_all_requests_detailed();
        
        $this->load->view('layout/header', $data);
        $this->load->view('transport/security_list', $data);
        $this->load->view('layout/footer');
    }

    /**
     * checkin
     * Proses saat kendaraan hendak keluar gerbang kantor (Berangkat).
     * Mencatat Kilometer Awal sebagai dasar perhitungan penggunaan BBM/Mesin.
     * 
     * @param int $id ID permohonan
     */
    public function checkin($id) {
        // Proteksi: Admin Super hanya BOLEH melihat (View Only)
        if ($this->session->userdata('role_id') == 6) {
            $this->session->set_flashdata('error', 'Admin hanya memiliki hak akses View (Baca) di Pos Security.');
            redirect('transport/security');
        }
        $data['page_title'] = 'Security Check-In (Berangkat)';
        $data['request'] = $this->Transport_model->get_requests($id);
        
        // Validasi input wajib security
        $this->form_validation->set_rules('km_awal', 'KM Awal', 'required|numeric');
        $this->form_validation->set_rules('jam_berangkat', 'Jam Berangkat', 'required');

        if ($this->form_validation->run() === FALSE) {
            // Cek apakah sudah pernah check-in sebelumnya untuk mencegah Duplikasi
            $existing_log = $this->Transport_model->get_security_log($id);
            if ($existing_log) {
                $this->session->set_flashdata('error', 'Kendaraan ini sudah tercatat keluar (Check-In).');
                redirect('transport/detail/' . $id);
            }

            $this->load->view('layout/header', $data);
            $this->load->view('transport/form_security_in', $data);
            $this->load->view('layout/footer');
        } else {
            $security_id = $this->session->userdata('user_id');
            
            $log_data = [
                'request_id' => $id,
                'logged_by' => $security_id,
                'km_awal' => $this->input->post('km_awal'),
                'jam_berangkat' => $this->input->post('jam_berangkat'),
            ];

            // --- KONFIGURASI UPLOAD FOTO ---
            $config['upload_path'] = './uploads/transport/';
            $config['allowed_types'] = 'gif|jpg|png|jpeg';
            $config['max_size'] = 2048; // Max 2MB
            $this->upload->initialize($config);

            // Buat folder jika belum ada
            if (!is_dir($config['upload_path'])) {
                mkdir($config['upload_path'], 0777, TRUE);
            }

            // Opsi 1: Upload File Tradisional (Input File)
            if ($this->upload->do_upload('foto_driver_berangkat')) {
                $log_data['foto_driver_berangkat'] = $this->upload->data('file_name');
            }
            if ($this->upload->do_upload('foto_km_berangkat')) {
                $log_data['foto_km_berangkat'] = $this->upload->data('file_name');
            }

            // Opsi 2: Live Camera Capture (Base64)
            // Foto diambil langsung lewat browser dan dikonversi dari Base64 ke File JPG.
            if ($this->input->post('capture_driver')) {
                $fname = $this->_save_base64_image($this->input->post('capture_driver'), 'driver_in_' . $id);
                if ($fname) $log_data['foto_driver_berangkat'] = $fname;
            }
            if ($this->input->post('capture_km')) {
                $fname = $this->_save_base64_image($this->input->post('capture_km'), 'km_in_' . $id);
                if ($fname) $log_data['foto_km_berangkat'] = $fname;
            }

            // 1. Simpan log keberangkatan
            $this->Transport_model->add_security_log($log_data);
            
            $this->session->set_flashdata('success', 'Data check-in berhasil dicatat. Silakan cetak Surat Jalan.');
            // Setelah check-in, arahkan ke download PDF Surat Jalan.
            redirect('transport/export_pdf/' . $id);
        }
    }

    /**
     * checkout
     * Proses saat kendaraan kembali ke kantor (Pulang).
     * Melakukan perhitungan Jarak Tempuh dan Lama Waktu secara otomatis.
     * 
     * @param int $id ID permohonan
     */
    public function checkout($id) {
        if ($this->session->userdata('role_id') == 6) {
            $this->session->set_flashdata('error', 'Admin hanya memiliki hak akses View (Baca) di Pos Security.');
            redirect('transport/security');
        }
        $data['page_title'] = 'Security Check-Out (Kembali)';
        $data['request'] = $this->Transport_model->get_requests($id);
        $data['log'] = $this->Transport_model->get_security_log($id);
        
        $this->form_validation->set_rules('km_akhir', 'KM Akhir', 'required|numeric');
        $this->form_validation->set_rules('jam_kembali', 'Jam Kembali', 'required');

        if ($this->form_validation->run() === FALSE) {
            $this->load->view('layout/header', $data);
            $this->load->view('transport/form_security_out', $data);
            $this->load->view('layout/footer');
        } else {
            $log_data = [
                'km_akhir' => $this->input->post('km_akhir'),
                'jam_kembali' => $this->input->post('jam_kembali'),
                'lama_waktu' => $this->input->post('lama_waktu'), // Hitungan dari JS di view
                'jarak_tempuh' => $this->input->post('jarak_tempuh') // Hitungan dari JS di view
            ];

            // --- PROSES DOKUMENTASI KEPULANGAN ---
            $config['upload_path'] = './uploads/transport/';
            $config['allowed_types'] = 'gif|jpg|png|jpeg';
            $config['max_size'] = 2048;
            $this->upload->initialize($config);

            // Upload File
            if ($this->upload->do_upload('foto_driver_kembali')) {
                $log_data['foto_driver_kembali'] = $this->upload->data('file_name');
            }
            if ($this->upload->do_upload('foto_km_kembali')) {
                $log_data['foto_km_kembali'] = $this->upload->data('file_name');
            }

            // Camera Capture
            if ($this->input->post('capture_driver')) {
                $fname = $this->_save_base64_image($this->input->post('capture_driver'), 'driver_out_' . $id);
                if ($fname) $log_data['foto_driver_kembali'] = $fname;
            }
            if ($this->input->post('capture_km')) {
                $fname = $this->_save_base64_image($this->input->post('capture_km'), 'km_out_' . $id);
                if ($fname) $log_data['foto_km_kembali'] = $fname;
            }

            // 1. Update log yang sudah ada dengan data kepulangan
            $this->Transport_model->update_security_log($id, $log_data);

            // 2. Sinkronisasi Data Master: Kembalikan status mobil jadi 'Available'
            // Mobil sekarang bisa dipinjam kembali oleh user lain.
            $fleet = $this->Transport_model->get_fleet($id);
            if ($fleet) {
                $this->Transport_model->update_vehicle_status($fleet['plat_nomor'], 'Available');
            }

            // 3. Ubah status permohonan menjadi 'Selesai' (Arsip)
            $this->Transport_model->update_request($id, ['status' => 'Selesai']);

            $this->session->set_flashdata('success', 'Data check-out berhasil dicatat. Status Permohonan: Selesai.');
            redirect('transport/export_pdf/' . $id);
        }
    }

    /**
     * _save_base64_image (Private Helper)
     * Mengubah data stream Base64 dari kamera menjadi file fisik di server.
     * Proses: Split Header -> Decode String -> Simpan File.
     */
    private function _save_base64_image($base64_string, $prefix) {
        if (empty($base64_string)) return null;
        
        // Memisahkan metadata base64 (data:image/jpeg;base64,...)
        $data = explode(',', $base64_string);
        if (count($data) < 2) return null;
        
        $image_data = base64_decode($data[1]);
        $file_name = $prefix . '_' . time() . '.jpg';
        $file_path = './uploads/transport/' . $file_name;
        
        // Pastikan folder tersedia
        if (!is_dir('./uploads/transport/')) {
            mkdir('./uploads/transport/', 0777, TRUE);
        }
        
        // Tulis data biner ke file system
        if (file_put_contents($file_path, $image_data)) {
            return $file_name;
        }
        return null;
    }
}
