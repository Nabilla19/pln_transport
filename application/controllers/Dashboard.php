<?php
defined('BASEPATH') or exit('No direct script acces allowed');

/**
 * @property CI_Session $session
 * @property User_model $User_model
 * @property Dashboard_model $Dashboard_model
 * @property Notifikasi_model $Notifikasi_model
 * @property CI_Input $input
 */
class Dashboard extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('User_model');
        $this->load->model('Dashboard_model');
        $this->load->model('Notifikasi_model');
    }

    public function index()
    {
        $data['judul'] = "Halaman Dashboard E-Transport";

        // Navbar data
        $data['page_title'] = "Dashboard";
        $data['page_icon'] = "ni ni-tv-2";

        // User statistics
        $data['login_count'] = null;
        $data['last_login'] = null;
        $data['user_role'] = null;

        $session_role = $this->session->userdata('user_role');
        if ($session_role) {
            $data['user_role'] = $session_role;
        }

        $user_id = $this->session->userdata('user_id');
        if ($user_id) {
            $user = $this->User_model->find_by_id($user_id);
            if ($user) {
                $data['login_count'] = isset($user['login_count']) ? $user['login_count'] : null;
                $data['last_login'] = isset($user['last_login']) ? $user['last_login'] : null;
                if (isset($user['role_display'])) {
                    $data['user_role'] = $user['role_display'];
                }
            }
        }

        // =========================
        // TRANSPORT STATISTICS
        // =========================
        $data['total_requests'] = $this->Dashboard_model->get_total_requests();
        $data['pending_requests'] = $this->Dashboard_model->get_total_requests('Pending Asmen');
        $data['total_vehicles'] = $this->Dashboard_model->get_total_vehicles();
        $data['available_vehicles'] = $this->Dashboard_model->get_total_vehicles('Available');
        $data['requests_today'] = $this->Dashboard_model->get_requests_today();

        // Chart data
        $data['chart_labels'] = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $data['chart_requests'] = $this->Dashboard_model->get_monthly_requests();

        // Latest Requests Table
        $data['latest_requests'] = $this->Dashboard_model->get_latest_requests(5);

        // Activity Log
        $data['riwayat_aktivitas'] = $this->Notifikasi_model->get_latest(8);

        $this->load->view("layout/header", $data);
        $this->load->view("dashboard/vw_dashboard", $data);
        $this->load->view("layout/footer");
    }

    /**
     * AJAX endpoint: Get login statistics for a specific role
     * Only accessible by admin users
     */
    public function get_role_login_stats()
    {
        // Check if user is admin
        $user_id = $this->session->userdata('user_id');
        if (!$user_id) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $user = $this->User_model->find_by_id($user_id);
        if (!$user || strtolower($user['role_name'] ?? '') !== 'admin') {
            echo json_encode(['success' => false, 'message' => 'Access denied. Admin only.']);
            return;
        }

        // Get role from query parameter
        $role = $this->input->get('role');

        if ($role) {
            // Get specific role stats
            $users = $this->User_model->get_users_login_stats($role);
            echo json_encode(['success' => true, 'role' => $role, 'users' => $users]);
        } else {
            // Get all roles summary
            $summary = $this->User_model->get_login_stats_by_role();
            echo json_encode(['success' => true, 'summary' => $summary]);
        }
    }
}
