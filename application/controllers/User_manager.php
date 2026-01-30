<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User_manager extends CI_Controller {
    
    public function __construct()
    {
        parent::__construct();
        
        // Admin-only access check
        if (!is_admin()) {
            $this->session->set_flashdata('error', 'Akses ditolak. Hanya Admin yang dapat mengelola user.');
            redirect('dashboard');
        }
    }
    
    /**
     * List all users with pagination and search
     */
    public function index()
    {
        $data['title'] = 'Manajemen User';
        $data['page_title'] = 'Manajemen User';
        $data['page_icon'] = 'fas fa-users-cog';
        
        // Pagination config
        $limit = 10;
        $offset = (($this->input->get('page') ?? 1) - 1) * $limit;
        $search = $this->input->get('search');
        
        // Get users
        $this->load->model('User_model');
        $data['users'] = $this->User_model->get_all_users($limit, $offset, $search);
        $data['total_users'] = $this->User_model->count_all_users($search);
        $data['total_pages'] = ceil($data['total_users'] / $limit);
        $data['current_page'] = $this->input->get('page') ?? 1;
        
        $this->load->view('layout/header', $data);
        $this->load->view('user_manager/index', $data);
        $this->load->view('layout/footer');
    }
    
    /**
     * Show create user form
     */
    public function create()
    {
        $data['title'] = 'Tambah User';
        $data['page_title'] = 'Tambah User Baru';
        $data['page_icon'] = 'fas fa-user-plus';
        $data['mode'] = 'create';
        $data['user'] = null;
        
        // Get roles for dropdown
        $this->load->model('User_model');
        $data['roles'] = $this->User_model->get_roles();
        
        $this->load->view('layout/header', $data);
        $this->load->view('user_manager/form', $data);
        $this->load->view('layout/footer');
    }
    
    /**
     * Store new user
     */
    public function store()
    {
        $this->load->library('form_validation');
        
        $this->form_validation->set_rules('name', 'Nama', 'required|trim');
        $this->form_validation->set_rules('email', 'Email', 'required|valid_email|is_unique[users.email]');
        $this->form_validation->set_rules('password', 'Password', 'required|min_length[6]');
        $this->form_validation->set_rules('role_id', 'Role', 'required|numeric');
        
        if ($this->form_validation->run() === FALSE) {
            $this->session->set_flashdata('error', validation_errors());
            redirect('user_manager/create');
            return;
        }
        
        $data = [
            'name' => $this->input->post('name'),
            'email' => $this->input->post('email'),
            'password' => password_hash($this->input->post('password'), PASSWORD_BCRYPT),
            'role_id' => $this->input->post('role_id'),
            'role' => $this->input->post('role_name'),
            'is_active' => $this->input->post('is_active')
        ];
        
        $this->load->model('User_model');
        if ($this->User_model->create_user($data)) {
            $this->session->set_flashdata('success', 'User berhasil ditambahkan');
        } else {
            $this->session->set_flashdata('error', 'Gagal menambahkan user');
        }
        
        redirect('user_manager');
    }
    
    /**
     * Show edit user form
     */
    public function edit($id)
    {
        $this->load->model('User_model');
        $user = $this->User_model->find_by_id($id);
        
        if (!$user) {
            $this->session->set_flashdata('error', 'User tidak ditemukan');
            redirect('user_manager');
            return;
        }
        
        $data['title'] = 'Edit User';
        $data['page_title'] = 'Edit User';
        $data['page_icon'] = 'fas fa-user-edit';
        $data['mode'] = 'edit';
        $data['user'] = $user;
        $data['roles'] = $this->User_model->get_roles();
        
        $this->load->view('layout/header', $data);
        $this->load->view('user_manager/form', $data);
        $this->load->view('layout/footer');
    }
    
    /**
     * Update user
     */
    public function update($id)
    {
        $this->load->library('form_validation');
        
        $this->form_validation->set_rules('name', 'Nama', 'required|trim');
        $this->form_validation->set_rules('email', 'Email', 'required|valid_email');
        $this->form_validation->set_rules('role_id', 'Role', 'required|numeric');
        
        // Password optional for update
        if ($this->input->post('password')) {
            $this->form_validation->set_rules('password', 'Password', 'min_length[6]');
        }
        
        if ($this->form_validation->run() === FALSE) {
            $this->session->set_flashdata('error', validation_errors());
            redirect('user_manager/edit/' . $id);
            return;
        }
        
        $data = [
            'name' => $this->input->post('name'),
            'email' => $this->input->post('email'),
            'role_id' => $this->input->post('role_id'),
            'role' => $this->input->post('role_name'),
            'is_active' => $this->input->post('is_active')
        ];
        
        // Add password if provided
        if ($this->input->post('password')) {
            $data['password'] = password_hash($this->input->post('password'), PASSWORD_BCRYPT);
        }
        
        $this->load->model('User_model');
        if ($this->User_model->update_user($id, $data)) {
            $this->session->set_flashdata('success', 'User berhasil diupdate');
        } else {
            $this->session->set_flashdata('error', 'Gagal mengupdate user');
        }
        
        redirect('user_manager');
    }
    
    /**
     * Delete user
     */
    public function delete($id)
    {
        // Prevent admin from deleting themselves
        if ($id == $this->session->userdata('user_id')) {
            $this->session->set_flashdata('error', 'Anda tidak dapat menghapus akun sendiri');
            redirect('user_manager');
            return;
        }
        
        $this->load->model('User_model');
        if ($this->User_model->delete_user($id)) {
            $this->session->set_flashdata('success', 'User berhasil dihapus');
        } else {
            $this->session->set_flashdata('error', 'Gagal menghapus user');
        }
        
        redirect('user_manager');
    }
    
    /**
     * Toggle user active status
     */
    public function toggle_status($id)
    {
        $user = $this->User_model->find_by_id($id);
        if (!$user) {
            $this->session->set_flashdata('error', 'User tidak ditemukan');
            redirect('user_manager');
            return;
        }

        $new_status = $user['is_active'] ? 0 : 1;
        if ($this->User_model->update_user($id, ['is_active' => $new_status])) {
            $this->session->set_flashdata('success', 'Status user berhasil diubah');
        } else {
            $this->session->set_flashdata('error', 'Gagal mengubah status user');
        }
        redirect('user_manager');
    }
}
