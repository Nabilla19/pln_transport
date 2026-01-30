<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Controller for Notifikasi (Notification Management)
 *
 * @property CI_Input $input
 * @property CI_Session $session
 * @property Notifikasi_model $notifModel
 * @property CI_URI $uri
 * @property CI_Config $config
 */
class Notifikasi extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Notifikasi_model', 'notifModel');
        $this->load->helper(['url', 'form', 'authorization']);
        $this->load->library('session');

        // Check if user is logged in
        if (!$this->session->userdata('logged_in')) {
            redirect('login');
        }
    }

    // Tampilkan daftar notifikasi
    public function index()
    {
        $user_id = $this->session->userdata('user_id');
        $data['judul'] = 'Notifikasi Aktivitas';
        $data['notifikasi'] = $this->notifModel->get_all($user_id);
        $data['unread_count'] = $this->notifModel->count_unread($user_id);

        $this->load->view('layout/header', $data);
        $this->load->view('notifikasi/vw_notifikasi', $data);
        $this->load->view('layout/footer');
    }

    // Tandai satu notifikasi sebagai sudah dibaca
    public function mark_read($id = null)
    {
        if (!$id) {
            redirect('Notifikasi');
        }

        $user_id = $this->session->userdata('user_id');
        $this->notifModel->mark_read($id, $user_id);
        $this->session->set_flashdata('success', 'Notifikasi ditandai sudah dibaca');
        redirect('Notifikasi');
    }

    // Tandai notifikasi sebagai sudah dibaca dan redirect ke URL target
    public function read($id = null)
    {
        if (!$id) {
            redirect('Notifikasi');
        }

        $user_id = $this->session->userdata('user_id');
        
        // Get notifikasi detail
        $notif = $this->notifModel->get_all($user_id);
        $target_notif = null;
        foreach ($notif as $n) {
            if ($n['id'] == $id) {
                $target_notif = $n;
                break;
            }
        }

        // Mark as read per user
        $this->notifModel->mark_read($id, $user_id);

        // Redirect ke URL target jika ada module dan record_id
        if ($target_notif && !empty($target_notif['module']) && !empty($target_notif['record_id']) && $target_notif['jenis_aktivitas'] != 'delete') {
            redirect($target_notif['module'] . '/edit/' . $target_notif['record_id']);
        } else {
            // Jika tidak ada target, kembali ke notifikasi
            redirect('Notifikasi');
        }
    }

    // Tandai semua notifikasi sebagai sudah dibaca
    public function mark_all_read()
    {
        $user_id = $this->session->userdata('user_id');
        $this->notifModel->mark_all_read($user_id);
        $this->session->set_flashdata('success', 'Semua notifikasi ditandai sudah dibaca');
        redirect('Notifikasi');
    }

    // AJAX: Get latest notifications
    public function get_latest()
    {
        $user_id = $this->session->userdata('user_id');
        $latest = $this->notifModel->get_latest(10, $user_id);
        $unread_count = $this->notifModel->count_unread($user_id);

        header('Content-Type: application/json');
        echo json_encode([
            'latest' => $latest,
            'unread_count' => (int)$unread_count
        ]);
    }

    // AJAX: Get unread count only
    public function ajax_unread_count()
    {
        $user_id = $this->session->userdata('user_id');
        $count = $this->notifModel->get_unread_count($user_id);
        header('Content-Type: application/json');
        echo json_encode(['unread' => (int)$count]);
    }

    // API: Get unread count for navbar
    public function get_unread_count()
    {
        $user_id = $this->session->userdata('user_id');
        $count = $this->notifModel->get_unread_count($user_id);
        header('Content-Type: application/json');
        echo json_encode(['count' => (int)$count]);
    }

    // Cleanup old notifications (bisa dipanggil via cron)
    public function cleanup($days = 30)
    {
        // Only admin can cleanup
        $role = $this->session->userdata('role');
        if (strtolower($role) !== 'admin') {
            show_error('Unauthorized', 403);
        }

        $this->notifModel->delete_old($days);
        $this->session->set_flashdata('success', "Notifikasi lebih dari {$days} hari berhasil dihapus");
        redirect('Notifikasi');
    }
}
