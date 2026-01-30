<?php
/**
 * Model Transport_model
 * 
 * Class ini berfungsi sebagai jembatan utama antara aplikasi dan database untuk seluruh modul E-Transport.
 * Mengelola data dari 5 tabel utama:
 * 1. transport_requests     : Data permohonan kendaraan dari user.
 * 2. transport_approvals    : Log persetujuan dari Asmen/KKU.
 * 3. transport_fleet        : Penugasan unit mobil dan pengemudi.
 * 4. transport_security_logs: Pencatatan KM dan jam operasional di pos security.
 * 5. transport_vehicles     : Master data unit kendaraan kantor.
 * 
 * @author Antigravity AI
 * @package CodeIgniter 3
 */
defined('BASEPATH') OR exit('No direct script access allowed');

class Transport_model extends CI_Model {

    public function __construct() {
        parent::__construct();
    }

    // =========================================================================
    // SECTION 1: MANAJEMEN PERMOHONAN (REQUESTS)
    // =========================================================================
    
    /**
     * get_requests
     * Mengambil data satu atau seluruh permohonan.
     * Jika ID diberikan, fungsi ini melakukan JOIN kompleks untuk menarik seluruh sejarah
     * perjalan mulai dari siapa yang menyetujui, mobil apa yang dipakai, hingga foto security.
     * 
     * @param int|null $id ID unik permohonan
     * @return array|row Data permohonan dalam bentuk array
     */
    public function get_requests($id = null) {
        if ($id) {
            // Memilih kolom spesifik dari berbagai tabel untuk efisiensi memory
            $this->db->select('tr.*, tf.mobil, tf.plat_nomor, tf.pengemudi, tf.barcode_fleet, tf.created_at as fleet_assigned_at, 
                              ts.km_awal, ts.km_akhir, ts.jam_berangkat as log_jam_berangkat, 
                              ts.jam_kembali as log_jam_kembali, ts.lama_waktu, ts.jarak_tempuh, 
                              ts.foto_driver_berangkat, ts.foto_km_berangkat, ts.foto_driver_kembali, ts.foto_km_kembali,
                              ta.asmen_id, ta.is_approved, ta.catatan as catatan_asmen, ta.approved_at, ta.barcode_asmen, 
                              tv.brand as vehicle_brand, u_asmen.name as asmen_name, u_asmen.role as asmen_role, u_fleet.name as fleet_user_name, u_fleet.role as fleet_role');
            $this->db->from('transport_requests tr');
            
            // JOIN: Menarik data persetujuan (ta)
            $this->db->join('transport_approvals ta', 'ta.request_id = tr.id', 'left');
            // JOIN: Menarik data penugasan armada (tf)
            $this->db->join('transport_fleet tf', 'tf.request_id = tr.id', 'left');
            // JOIN: Menarik detail merk kendaraan (tv) lewat relasi plat nomor
            $this->db->join('transport_vehicles tv', 'tv.plat_nomor = tf.plat_nomor', 'left');
            // JOIN: Menarik log keberangkatan/kepulangan security (ts)
            $this->db->join('transport_security_logs ts', 'ts.request_id = tr.id', 'left');
            // JOIN: Menarik nama user yang bertindak sebagai Asmen
            $this->db->join('users u_asmen', 'u_asmen.id = ta.asmen_id', 'left');
            // JOIN: Menarik nama admin yang bertugas di manajemen fleet
            $this->db->join('users u_fleet', 'u_fleet.id = tf.admin_id', 'left');
            
            $this->db->where('tr.id', $id);
            return $this->db->get()->row_array();
        }
        // Jika tidak ada ID, ambil semua data (biasanya untuk daftar tabel)
        return $this->db->get('transport_requests')->result_array();
    }
    /**
     * get_all_requests_detailed
     * Menampilkan seluruh daftar permohonan lengkap dengan data JOIN dari tabel approval, fleet, dan security log.
     * Sangat penting untuk dashboard monitoring dan antrian petugas.
     * 
     * @return array List permohonan dengan data relasi lengkap
     */
    public function get_all_requests_detailed() {
        $this->db->select('tr.*, tf.mobil, tf.plat_nomor, tf.pengemudi, tf.barcode_fleet, tf.created_at as fleet_assigned_at, 
                          ts.km_awal, ts.km_akhir, ts.jam_berangkat as log_jam_berangkat, 
                          ts.jam_kembali as log_jam_kembali, ts.lama_waktu, ts.jarak_tempuh, 
                          ts.foto_driver_berangkat, ts.foto_km_berangkat, ts.foto_driver_kembali, ts.foto_km_kembali,
                          ta.asmen_id, ta.is_approved, ta.catatan as catatan_asmen, ta.approved_at, ta.barcode_asmen, 
                          tv.brand as vehicle_brand, u_asmen.name as asmen_name, u_asmen.role as asmen_role, u_fleet.name as fleet_user_name, u_fleet.role as fleet_role');
        $this->db->from('transport_requests tr');
        $this->db->join('transport_approvals ta', 'ta.request_id = tr.id', 'left');
        $this->db->join('transport_fleet tf', 'tf.request_id = tr.id', 'left');
        $this->db->join('transport_vehicles tv', 'tv.plat_nomor = tf.plat_nomor', 'left');
        $this->db->join('transport_security_logs ts', 'ts.request_id = tr.id', 'left');
        $this->db->join('users u_asmen', 'u_asmen.id = ta.asmen_id', 'left');
        $this->db->join('users u_fleet', 'u_fleet.id = tf.admin_id', 'left');
        $this->db->order_by('tr.created_at', 'DESC');
        return $this->db->get()->result_array();
    }


    /**
     * get_my_requests
     * Digunakan oleh pegawai (user biasa) untuk melihat riwayat pengajuan mereka sendiri.
     */
    public function get_my_requests($user_id) {
        return $this->db->get_where('transport_requests', ['user_id' => $user_id])->result_array();
    }

    /**
     * create_request
     * Menyimpan inputan form pengajuan kendaraan ke dalam tabel transport_requests.
     */
    public function create_request($data) {
        $this->db->insert('transport_requests', $data);
        return $this->db->insert_id(); // Mengembalikan ID terbaru yang berhasil dibuat
    }

    /**
     * update_request
     * Memperbarui data atau status permohonan (misal: dari Pending menjadi Selesai).
     */
    public function update_request($id, $data) {
        $this->db->where('id', $id);
        return $this->db->update('transport_requests', $data);
    }

    // =========================================================================
    // SECTION 2: ALUR PERSETUJUAN (APPROVALS)
    // =========================================================================
    
    /**
     * get_approval
     * Mengambil record persetujuan untuk ditampilkan kembali di detail permohonan.
     */
    public function get_approval($request_id) {
        return $this->db->get_where('transport_approvals', ['request_id' => $request_id])->row_array();
    }

    /**
     * add_approval
     * Menyimpan keputusan Asmen (Setuju/Tolak) beserta catatan dan timestamp.
     */
    public function add_approval($data) {
        return $this->db->insert('transport_approvals', $data);
    }

    // =========================================================================
    // SECTION 3: MANAJEMEN ARMADA & SURAT JALAN (FLEET)
    // =========================================================================
    
    /**
     * get_fleet
     * Mengambil informasi kendaraan dan driver yang ditugaskan untuk suatu permohonan.
     */
    public function get_fleet($request_id) {
        return $this->db->get_where('transport_fleet', ['request_id' => $request_id])->row_array();
    }

    /**
     * add_fleet
     * Digunakan oleh Admin/KKU untuk mendaftarkan unit kendaraan ke dalam perjalanan.
     */
    public function add_fleet($data) {
        return $this->db->insert('transport_fleet', $data);
    }

    // =========================================================================
    // SECTION 4: POS KEAMANAN & LOGISTIK (SECURITY LOGS)
    // =========================================================================
    
    /**
     * get_security_log
     * Menampilkan rekaman data KM awal, KM akhir, serta bukti foto dari pos security.
     */
    public function get_security_log($request_id) {
        return $this->db->get_where('transport_security_logs', ['request_id' => $request_id])->row_array();
    }

    /**
     * add_security_log
     * Mencatat data saat kendaraan MULAI KELUAR area kantor (Check-In).
     */
    public function add_security_log($data) {
        return $this->db->insert('transport_security_logs', $data);
    }
    
    /**
     * update_security_log
     * Mencatat data saat kendaraan KEMBALI MASUK ke area kantor (Check-Out).
     */
    public function update_security_log($request_id, $data) {
        $this->db->where('request_id', $request_id);
        return $this->db->update('transport_security_logs', $data);
    }

    // =========================================================================
    // SECTION 5: DATA MASTER UNIT KENDARAAN (VEHICLES)
    // =========================================================================
    
    /**
     * get_vehicles
     * Menampilkan seluruh asset kendaraan yang dimiliki kantor.
     */
    public function get_vehicles() {
        return $this->db->get('transport_vehicles')->result_array();
    }

    /**
     * get_available_vehicles
     * Sangat penting untuk form penugasan fleet.
     * Hanya menampilkan kendaraan yang statusnya 'Available' agar tidak terjadi double booking.
     */
    public function get_available_vehicles($brand = null) {
        $where = ['status' => 'Available'];
        if ($brand) {
            $where['brand'] = $brand;
        }
        return $this->db->get_where('transport_vehicles', $where)->result_array();
    }

    /**
     * update_vehicle_status
     * Mengganti status ketersediaan mobil secara otomatis.
     * Misal: Saat security klik Berangkat, status mobil berubah jadi 'In Use'.
     */
    public function update_vehicle_status($plat_nomor, $status, $request_id = null) {
        $data = ['status' => $status];
        if ($request_id !== null) {
            $data['last_request_id'] = $request_id;
        }
        $this->db->where('plat_nomor', $plat_nomor);
        return $this->db->update('transport_vehicles', $data);
    }

    /**
     * get_vehicle_types
     * Menarik daftar merk/tipe dari tabel transport_vehicle_types (Toyota, Daihatsu, dll).
     */
    public function get_vehicle_types() {
        return $this->db->get('transport_vehicle_types')->result_array();
    }

    /**
     * get_pending_counts (Dashboard & Sidebar Notifications)
     * Fungsi ini bertugas menghitung berapa banyak pekerjaan yang antri untuk user tertentu.
     * Logika filter Bidang/Bagian diimplementasikan di sini untuk mendukung Approval hierarki.
     */
    public function get_pending_counts($role_id = null, $role_name = null) {
        $counts = [
            'pending_asmen' => 0,
            'pending_fleet' => 0,
            'in_progress'   => 0
        ];

        $role_name = $role_name ? strtolower($role_name) : '';

        // Query permohonan yang masih aktif (belum selesai)
        $this->db->select('id, status, bagian');
        $this->db->where_in('status', ['Pending Asmen', 'Pending Asmen/KKU', 'Pending Fleet', 'In Progress']);
        $requests = $this->db->get('transport_requests')->result_array();

        if (empty($requests)) return $counts;

        foreach ($requests as $r) {
            $status = $r['status'];
            $bagian = strtolower($r['bagian'] ?? '');

            if ($status == 'Pending Asmen' || $status == 'Pending Asmen/KKU') {
                // Notifikasi untuk Asmen (Hanya yang di bidangnya)
                $can_approve = false;
                if ($role_id == 6) { // Super Admin bisa lihat semua
                    $can_approve = true;
                } else {
                    // Cek apakah bidang pemohon sesuai dengan Bidang/Tanggung Jawab Asmen tsb
                    $is_perencanaan = (strpos($bagian, 'perencanaan') !== false);
                    $is_pemeliharaan = (strpos($bagian, 'pemeliharaan') !== false || strpos($bagian, 'har') !== false);
                    $is_operasi = (strpos($bagian, 'operasi') !== false);
                    $is_fasop = (strpos($bagian, 'fasop') !== false);

                    if ($role_id == 15 && $is_perencanaan) $can_approve = true;
                    elseif ($role_id == 16 && $is_pemeliharaan) $can_approve = true;
                    elseif ($role_id == 17 && $is_operasi) $can_approve = true;
                    elseif ($role_id == 18 && $is_fasop) $can_approve = true;
                    elseif ($role_name === 'kku' && !($is_perencanaan || $is_pemeliharaan || $is_operasi || $is_fasop)) $can_approve = true;
                }
                if ($can_approve) $counts['pending_asmen']++;
            } 
            elseif ($status == 'Pending Fleet') {
                // Notifikasi untuk Manajemen Fleet (Unit KKU dan Admin)
                if ($role_id == 6 || $role_name === 'kku') {
                    $counts['pending_fleet']++;
                }
            } 
            elseif ($status == 'In Progress') {
                // Notifikasi untuk Security (Monitoring perjalanan mobil yang belum kembali)
                if ($role_id == 6 || $role_id == 19) {
                    $counts['in_progress']++;
                }
            }
        }

        return $counts;
    }
}
