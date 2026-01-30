<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Notifikasi_model extends CI_Model
{
    private $table = 'notifikasi_aktivitas';

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Log aktivitas user (login, logout, CRUD operations)
     * @param int $user_id ID user dari tabel users
     * @param string $email Email user
     * @param string $role Role user (Admin, Pemeliharaan, dll)
     * @param string $jenis_aktivitas login|logout|create|update|delete|import
     * @param string $module Nama module/controller (gardu_induk, sop, dll) - NULL jika login/logout
     * @param int $record_id ID record yang di-CRUD - NULL jika login/logout
     * @param string $record_name Nama/label record untuk display - NULL jika login/logout
     * @param string $ip_address IP address user
     * @param string $user_agent Browser/device info
     */
    public function log_aktivitas($user_id, $email, $role, $jenis_aktivitas, $module = null, $record_id = null, $record_name = null, $ip_address = null, $user_agent = null)
    {
        // Format deskripsi sesuai jenis aktivitas
        if ($jenis_aktivitas === 'login') {
            $deskripsi = "Login berhasil";
            $menu_diakses = null;
        } elseif ($jenis_aktivitas === 'logout') {
            $deskripsi = "Logout";
            $menu_diakses = null;
        } elseif ($jenis_aktivitas === 'create') {
            $module_label = $this->get_module_label($module);
            $deskripsi = "Menambahkan data {$module_label}: {$record_name}";
            $menu_diakses = $module_label;
        } elseif ($jenis_aktivitas === 'update') {
            $module_label = $this->get_module_label($module);
            $deskripsi = "Mengedit data {$module_label}: {$record_name}";
            $menu_diakses = $module_label;
        } elseif ($jenis_aktivitas === 'delete') {
            $module_label = $this->get_module_label($module);
            $deskripsi = "Menghapus data {$module_label}: {$record_name}";
            $menu_diakses = $module_label;
        } elseif ($jenis_aktivitas === 'import') {
            $module_label = $this->get_module_label($module);
            $deskripsi = "Mengimport data {$module_label}: {$record_name}";
            $menu_diakses = $module_label;
        } else {
            $deskripsi = "Aktivitas pada {$module}";
            $menu_diakses = $module;
        }

        $data = [
            'user_id'         => $user_id,
            'email'           => $email,
            'role'            => $role,
            'jenis_aktivitas' => $jenis_aktivitas,
            'module'          => $module,
            'record_id'       => $record_id,
            'record_name'     => $record_name,
            'menu_diakses'    => $menu_diakses,
            'deskripsi'       => $deskripsi,
            'tanggal_waktu'   => date('Y-m-d H:i:s'),
            'status_baca'     => 0,
            'ip_address'      => $ip_address,
            'user_agent'      => $user_agent
        ];

        return $this->db->insert($this->table, $data);
    }

    /**
     * Get module label untuk display
     */
    private function get_module_label($module)
    {
        $labels = [
            'gardu_induk'         => 'Gardu Induk',
            'gardu_hubung'        => 'Gardu Hubung',
            'gi_cell'             => 'GI Cell',
            'gh_cell'             => 'GH Cell',
            'kit_cell'            => 'Kit Cell',
            'pembangkit'          => 'Pembangkit',
            'pemutus'             => 'Pemutus',
            'sop'                 => 'SOP',
            'bpm'                 => 'BPM',
            'ik'                  => 'IK',
            'road_map'            => 'Road Map',
            'spln'                => 'SPLN',
            'single_line_diagram' => 'SLD',
            'pengaduan'           => 'Pengaduan',
        ];

        return $labels[$module] ?? ucfirst(str_replace('_', ' ', $module));
    }

    /**
     * Ambil semua notifikasi dengan info baca per-user
     */
    public function get_all($user_id = null)
    {
        $this->db->select('a.*, COALESCE(rs.read_at, NULL) as is_read_user');
        $this->db->from($this->table . ' a');
        if ($user_id) {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = $user_id", 'left');
        } else {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = 0", 'left');
        }
        $this->db->order_by('a.tanggal_waktu', 'DESC');
        
        $result = $this->db->get()->result_array();
        
        // Map is_read_user to status_baca for view compatibility
        foreach ($result as &$r) {
            $r['status_baca'] = $r['is_read_user'] ? 1 : 0;
        }
        return $result;
    }

    /**
     * Ambil semua notifikasi (alias untuk kompatibilitas)
     */
    public function get_all_notifications($user_id = null)
    {
        return $this->get_all($user_id);
    }

    /**
     * Ambil notifikasi terbaru
     * @param int $limit Jumlah data yang diambil
     */
    public function get_latest($limit = 10, $user_id = null)
    {
        $this->db->select('a.*, rs.read_at as is_read_user');
        $this->db->from($this->table . ' a');
        if ($user_id) {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = $user_id", 'left');
        } else {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = 0", 'left');
        }
        $this->db->order_by('a.tanggal_waktu', 'DESC');
        $this->db->limit($limit);
        
        $result = $this->db->get()->result_array();
        foreach ($result as &$r) {
            $r['is_read'] = $r['is_read_user'] ? 1 : 0;
            $r['status_baca'] = $r['is_read_user'] ? 1 : 0;
        }
        return $result;
    }

    /**
     * Ambil notifikasi belum dibaca
     */
    public function get_unread($user_id = null)
    {
        $this->db->select('a.*');
        $this->db->from($this->table . ' a');
        if ($user_id) {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = $user_id", 'left');
        } else {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = 0", 'left');
        }
        $this->db->where('rs.read_at IS NULL');
        $this->db->order_by('a.tanggal_waktu', 'DESC');
        return $this->db->get()->result_array();
    }

    /**
     * Hitung notifikasi belum dibaca
     */
    public function count_unread($user_id = null)
    {
        $this->db->from($this->table . ' a');
        if ($user_id) {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = $user_id", 'left');
        } else {
            $this->db->join('notifikasi_read_status rs', "rs.notification_id = a.id AND rs.user_id = 0", 'left');
        }
        $this->db->where('rs.read_at IS NULL');
        return $this->db->count_all_results();
    }

    /**
     * Hitung notifikasi belum dibaca (alias untuk kompatibilitas)
     */
    public function get_unread_count($user_id = null)
    {
        return $this->count_unread($user_id);
    }

    /**
     * Tandai satu notifikasi sebagai sudah dibaca per-user
     * @param int $id ID notifikasi
     * @param int $user_id
     */
    public function mark_read($id, $user_id = null)
    {
        if (!$user_id) return false;
        
        $data = [
            'notification_id' => $id,
            'user_id' => $user_id,
            'read_at' => date('Y-m-d H:i:s')
        ];
        
        return $this->db->replace('notifikasi_read_status', $data);
    }

    /**
     * Tandai semua notifikasi sebagai sudah dibaca per-user
     */
    public function mark_all_read($user_id = null)
    {
        if (!$user_id) return false;
        
        // Ambil semua ID notifikasi yang belum dibaca oleh user ini
        $unread = $this->get_unread($user_id);
        if (empty($unread)) return true;
        
        $data = [];
        foreach ($unread as $n) {
            $data[] = [
                'notification_id' => $n['id'],
                'user_id' => $user_id,
                'read_at' => date('Y-m-d H:i:s')
            ];
        }
        
        return $this->db->insert_batch('notifikasi_read_status', $data);
    }

    /**
     * Tandai semua notifikasi sebagai sudah dibaca (alias)
     */
    public function mark_as_read($user_id = null)
    {
        return $this->mark_all_read($user_id);
    }

    /**
     * Hapus notifikasi lama (opsional, untuk cleanup)
     * @param int $days Hapus notifikasi lebih dari X hari
     */
    public function delete_old($days = 30)
    {
        $date = date('Y-m-d H:i:s', strtotime("-{$days} days"));
        $this->db->where('tanggal_waktu <', $date);
        return $this->db->delete($this->table);
    }
}
