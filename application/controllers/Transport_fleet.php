<?php
/**
 * Controller Transport_fleet
 * 
 * Controller ini menangani logika bisnis tahap ketiga: Manajemen Armada (Fleet Management).
 * Dikelola oleh Bagian KKU untuk menugaskan unit kendaraan riil dan pengemudi.
 * 
 * Alur Sistem:
 * Pending Fleet -> Petugas Pilih Mobil -> Status: In Progress -> Mobil Siap di Pos Security.
 * 
 * @package CodeIgniter 3
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Transport_fleet extends CI_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model(['Transport_model', 'User_model']);
        $this->load->library(['session', 'form_validation']);
        $this->load->helper(['url', 'form']);
        
        // Proteksi Keamanan: Wajib login
        if (!$this->session->userdata('logged_in')) {
            redirect('login');
        }

        // --- CEK OTORISASI ---
        // Penugasan Armada adalah wewenang sensitif, hanya Admin atau Bagian KKU yang diijinkan.
        $role_id = $this->session->userdata('role_id');
        $role = strtolower($this->session->userdata('user_role') ?: $this->session->userdata('role') ?: '');
        
        if (!in_array($role_id, [6]) && $role !== 'kku') {
            $this->session->set_flashdata('error', 'Anda tidak memiliki hak akses ke menu Manajemen Fleet (Hanya Bagian KKU).');
            redirect('dashboard');
        }
    }

    /**
     * index
     * Menampilkan daftar permohonan yang sudah disetujui Asmen (Pending Fleet).
     * Di sini petugas KKU melihat antrian mobil yang harus segera disiapkan.
     */
    public function index() {
        $data['page_title'] = 'Manajemen Fleet';
        // Memfilter data secara dinamis dari detail gabungan
        $all_requests = $this->Transport_model->get_all_requests_detailed();
        $data['requests'] = array_filter($all_requests, function($r) {
            return $r['status'] == 'Pending Fleet';
        });

        $this->load->view('layout/header', $data);
        $this->load->view('transport/fleet_list', $data);
        $this->load->view('layout/footer');
    }

    /**
     * process
     * Menampilkan formulir penugasan unit kendaraan.
     * Fitur penting: Hanya menampilkan unit yang berstatus 'Available' di database.
     * 
     * @param int $id ID permohonan
     */
    public function process($id) {
        // Proteksi: Admin Super hanya BOLEH melihat (View Only)
        if ($this->session->userdata('role_id') == 6) {
            $this->session->set_flashdata('error', 'Admin hanya memiliki hak akses View (Baca) di menu Fleet.');
            redirect('transport/fleet');
        }
        $data['page_title'] = 'Proses Fleet / Surat Jalan';
        $request = $this->Transport_model->get_requests($id);
        if (!$request) {
            show_404();
        }
        $data['request'] = $request;
        
        // --- FILTER KENDARAAN ---
        // Mengambil unit yang statusnya 'Available' dan merk-nya sesuai dengan request user.
        $data['vehicles'] = $this->Transport_model->get_available_vehicles($request['macam_kendaraan']);
        
        // Aturan validasi input petugas
        $this->form_validation->set_rules('mobil', 'Mobil', 'required');
        $this->form_validation->set_rules('plat_nomor', 'Plat Nomor', 'required');
        $this->form_validation->set_rules('pengemudi', 'Pengemudi', 'required');

        if ($this->form_validation->run() === FALSE) {
            $this->load->view('layout/header', $data);
            $this->load->view('transport/form_fleet', $data);
            $this->load->view('layout/footer');
        } else {
            $admin_id = $this->session->userdata('user_id');
            $fleet_data = [
                'request_id' => $id,
                'admin_id' => $admin_id,
                'mobil' => $this->input->post('mobil'),
                'plat_nomor' => $this->input->post('plat_nomor'),
                'pengemudi' => $this->input->post('pengemudi'),
                // Digital Signature untuk Admin KKU yang bertugas
                'barcode_fleet' => md5('KKU-'.$admin_id.'-'.uniqid().'-'.$id)
            ];

            // 1. Simpan data penugasan kendaraan ke tabel transport_fleet
            $this->Transport_model->add_fleet($fleet_data);
            
            // 2. Sinkronisasi Data Master: Ubah status mobil jadi 'In Use'
            // Ini mencegah mobil yang sama digunakan di 2 permohonan yang bersamaan.
            $this->Transport_model->update_vehicle_status($this->input->post('plat_nomor'), 'In Use', $id);
            
            // 3. Update status permohonan menjadi 'In Progress'
            // Mobil sekarang muncul di daftar "Monitor Kendaraan Luar" milik Security.
            $this->Transport_model->update_request($id, ['status' => 'In Progress']);

            $this->session->set_flashdata('success', 'Data fleet berhasil disimpan. Status menjadi In Progress.');
            redirect('transport/fleet');
        }
    }
}
