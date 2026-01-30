<?php
/**
 * Controller Transport_request
 * 
 * Controller ini adalah pintu masuk utama bagi pegawai yang ingin melakukan peminjaman kendaraan.
 * Menangani siklus hidup awal permohonan mulai dari Input Form, Penampilan Daftar, hingga Detail.
 * 
 * Alur Sistem:
 * User Input -> Simpan ke DB -> Status: Pending Asmen/KKU -> Menunggu Approval.
 * 
 * @package CodeIgniter 3
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Transport_request extends CI_Controller {

    public function __construct() {
        parent::__construct();
        // Memastikan model Transport (CRUD database) dan model User (Sesi/Role) dimuat
        $this->load->model(['Transport_model', 'User_model']);
        // Library form_validation digunakan untuk memastikan input user aman dan lengkap
        $this->load->library(['session', 'form_validation']);
        // Helper url dan form diperlukan untuk redirect dan pembuatan link
        $this->load->helper(['url', 'form']);
        
        // Proteksi Keamanan: Hanya user yang sudah login melalui Controller Login yang bisa akses
        if (!$this->session->userdata('logged_in')) {
            redirect('login');
        }
    }

    /**
     * index
     * Fungsi default saat controller diakses. Otomatis menampilkan daftar permohonan user tsb.
     */
    public function index() {
        $this->my_requests();
    }

    /**
     * my_requests
     * Menampilkan daftar permohonan yang hanya dibuat oleh user yang sedang login.
     * Berguna untuk melakukan tracking status (Apakah sudah disetujui atau belum).
     */
    public function my_requests() {
        $user_id = $this->session->userdata('user_id');
        $data['page_title'] = 'Daftar Permohonan Saya';
        // Memanggil model untuk filter berdasarkan user_id sdm pengadu
        $data['requests'] = $this->Transport_model->get_my_requests($user_id);

        $this->load->view('layout/header', $data);
        $this->load->view('transport/my_requests', $data);
        $this->load->view('layout/footer');
    }

    /**
     * all_requests
     * Menampilkan seluruh data permohonan secara global (log logistik).
     * Biasanya diakses oleh admin atau unit terkait yang butuh data pemakaian unit secara keseluruhan.
     */
    public function all_requests() {
        $data['page_title'] = 'Daftar Permohonan Unit';
        // Fungsi model ini melakukan JOIN ke tabel approval, fleet, dan security
        $data['requests'] = $this->Transport_model->get_all_requests_detailed();

        $this->load->view('layout/header', $data);
        $this->load->view('transport/all_requests', $data);
        $this->load->view('layout/footer');
    }

    /**
     * ajukan / create
     * Menampilkan halaman formulir pengajuan kendaraan.
     * Mengambil data master merk kendaraan dari database untuk ditampilkan di dropdown.
     */
    public function ajukan() {
        $data['page_title'] = 'Ajukan Peminjaman';
        $data['vehicle_types'] = $this->Transport_model->get_vehicle_types(); 

        $this->load->view('layout/header', $data);
        $this->load->view('transport/form_request', $data);
        $this->load->view('layout/footer');
    }

    public function create() {
        $this->ajukan();
    }

    /**
     * store
     * Fungsi pemrosesan data (POST) dari form pengajuan.
     * Tahap ini sangat krusial karena menentukan status awal 'Pending Asmen/KKU'.
     */
    public function store() {
        // Aturan Validasi: Memastikan field kritikal tidak kosong
        $this->form_validation->set_rules('nama', 'Nama', 'required');
        $this->form_validation->set_rules('jabatan', 'Jabatan', 'required');
        $this->form_validation->set_rules('bagian', 'Bagian', 'required');
        $this->form_validation->set_rules('tujuan', 'Tujuan', 'required');
        $this->form_validation->set_rules('keperluan', 'Keperluan', 'required');
        $this->form_validation->set_rules('tanggal_jam_berangkat', 'Tanggal/Jam Berangkat', 'required');

        if ($this->form_validation->run() === FALSE) {
            // Jika ada field kosong, kembalikan ke form dan tampilkan error
            $this->create(); 
        } else {
            $user_id = $this->session->userdata('user_id');
            // Menyiapkan data untuk di-insert ke tabel transport_requests
            $data = [
                'user_id' => $user_id,
                'nama' => $this->input->post('nama'),
                'jabatan' => $this->input->post('jabatan'),
                'bagian' => $this->input->post('bagian'),
                'macam_kendaraan' => $this->input->post('macam_kendaraan'),
                'jumlah_penumpang' => $this->input->post('jumlah_penumpang'),
                'tujuan' => $this->input->post('tujuan'),
                'keperluan' => $this->input->post('keperluan'),
                'tanggal_jam_berangkat' => $this->input->post('tanggal_jam_berangkat'),
                'lama_pakai' => $this->input->post('lama_pakai'),
                'status' => 'Pending Asmen/KKU', 
                // Digital Signature / Barcode Generator sederhana menggunakan MD5 dan UID
                'barcode_pemohon' => md5('PEMOHON-'.$user_id.'-'.uniqid().'-'.time()) 
            ];

            $request_id = $this->Transport_model->create_request($data);

            if ($request_id) {
                // Notifikasi Sukses ditampilkan di session berikutnya
                $this->session->set_flashdata('success', 'Permohonan berhasil diajukan. Menunggu persetujuan Asmen / KKU.');
                redirect('transport/detail/' . $request_id);
            } else {
                $this->session->set_flashdata('error', 'Gagal mengajukan permohonan.');
                redirect('transport/ajukan');
            }
        }
    }

    /**
     * detail
     * Menampilkan riwayat lengkap sebuah permohonan dalam bentuk "Tracking Timeline".
     * Mengambil data dari 4 tabel berbeda (Request, Approval, Fleet, Security).
     * 
     * @param int $id ID permohonan yang ingin dilihat
     */
    public function detail($id) {
        $request = $this->Transport_model->get_requests($id);
        if (!$request) {
            // Jika ID tidak ada di database, tampilkan 404
            show_404();
        }

        $data['page_title'] = 'Detail Permohonan';
        $data['request'] = $request;
        $data['approval'] = $this->Transport_model->get_approval($id); // Info siapa yang approve
        $data['fleet'] = $this->Transport_model->get_fleet($id); // Info mobil & pengemudi
        $data['security'] = $this->Transport_model->get_security_log($id); // Info KM & Jam riil

        $this->load->view('layout/header', $data);
        $this->load->view('transport/detail_request', $data);
        $this->load->view('layout/footer');
    }

    /**
     * export_pdf
     * Menyiapkan tampilan laporan cetak (Surat Jalan / Rekapitulasi).
     * Fungsi ini bisa mencetak 1 data spesifik atau seluruh data sekaligus.
     */
    public function export_pdf($id = null) {
        $data['page_title'] = $id ? 'Laporan Perjalanan' : 'Laporan Riwayat Peminjaman Kendaraan';
        
        $all_requests = $this->Transport_model->get_all_requests_detailed();
        
        if ($id) {
            // Filter and Deduplicate (Ensure only 1 row per ID)
            $filtered = array_filter($all_requests, function($r) use ($id) {
                return $r['id'] == $id;
            });
            
            if (!empty($filtered)) {
                $data['requests'] = [reset($filtered)]; // Take first unique record
            } else {
                $single = $this->Transport_model->get_requests($id);
                $data['requests'] = $single ? [$single] : [];
            }
        } else {
            // Deduplicate all requests by ID for the summary table
            $temp = [];
            foreach ($all_requests as $r) {
                if (!isset($temp[$r['id']])) {
                    $temp[$r['id']] = $r;
                }
            }
            $data['requests'] = array_values($temp);
        }
        
        // Memanggil view khusus cetak (border hitam putih)
        $this->load->view('transport/export_view', $data);
    }
}
