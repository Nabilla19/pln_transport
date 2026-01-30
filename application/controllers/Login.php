<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * @property CI_Session $session
 * @property CI_Input $input
 * @property CI_Form_validation $form_validation
 * @property User_model $User_model
 */
class Login extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->helper(['url', 'form']);
        $this->load->library(['session', 'form_validation']);
        $this->load->model('User_model');
    }

    // GET /login
    public function index()
    {
        // If already logged in, redirect to dashboard unless forced to show login
        $force = $this->input->get('force');
        if ($this->session->userdata('logged_in') && !$force) {
            return redirect('dashboard');
        }

        $data = [
            'title' => 'Masuk - PLN UP2D Riau',
        ];
        $this->load->view('login/index', $data);
    }

    // POST /login/auth
    public function authenticate()
    {
        // Validation rules
        $this->form_validation->set_rules('email', 'Email', 'required|valid_email');
        $this->form_validation->set_rules('password', 'Password', 'required|min_length[6]');

        if ($this->form_validation->run() === FALSE) {
            // Return to form with errors
            return $this->index();
        }

        $email = $this->input->post('email');
        $password = $this->input->post('password');

        // Try DB-based authentication first
        $user = $this->User_model->find_by_email($email);
        if ($user && $this->User_model->verify_password($user, $password)) {
            // Check if user is active
            if (isset($user['is_active']) && $user['is_active'] == 0) {
                $this->session->set_flashdata('login_error', 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.');
                return redirect('login');
            }

            // store useful user data in session
            $this->session->set_userdata([
                'user_email' => $user['email'],
                'email'      => $user['email'], // untuk activity logger
                'user_id'    => $user['id'],
                'user_name'  => $user['name'],
                'username'   => $user['name'],
                'user_role'  => isset($user['role']) ? $user['role'] : null,
                'role'       => isset($user['role']) ? $user['role'] : null, // untuk activity logger
                'role_id'    => isset($user['role_id']) ? $user['role_id'] : null,
                'logged_in'  => TRUE,
            ]);
            // record successful login (increments login_count and updates last_login if columns exist)
            if (isset($user['id'])) {
                $this->User_model->record_login($user['id']);
            }
            
            // Log aktivitas login
            log_login();
            
            return redirect('dashboard');
        }

        // Fallback dev shortcut (keeps previous behavior in development)
        if (ENVIRONMENT === 'development' && $email === 'admin@pln.local' && $password === 'admin123') {
            // attempt to find the admin user to set a proper user_id in session
            $devUser = $this->User_model->find_by_email($email);
            $sess = [
                'user_email' => $email,
                'email'      => $email,
                'user_role'  => 'Administrator',
                'role'       => 'Administrator',
                'logged_in'  => TRUE,
            ];
            if ($devUser && isset($devUser['id'])) {
                $sess['user_id'] = $devUser['id'];
            }
            $this->session->set_userdata($sess);
            // In development shortcut, also record the login in DB if the admin user exists
            if (!empty($devUser['id'])) {
                $this->User_model->record_login($devUser['id']);
            }
            
            // Log aktivitas login
            log_login();
            
            return redirect('dashboard');
        }

        $this->session->set_flashdata('login_error', 'Email atau password salah.');
        return redirect('login');
    }

    // GET /login/guest_login
    public function guest_login()
    {
        // Set session as Guest user
        $this->session->set_userdata([
            'user_email' => 'guest@pln.local',
            'email'      => 'guest@pln.local',
            'user_id'    => null,
            'user_role'  => 'Guest',
            'role'       => 'Guest',
            'logged_in'  => TRUE,
            'is_guest'   => TRUE, // flag khusus untuk Guest
        ]);
        
        // Log aktivitas login guest
        log_login();
        
        redirect('dashboard');
    }

    // GET /logout
    public function logout()
    {
        // Log aktivitas logout sebelum destroy session
        log_logout();
        
        $this->session->sess_destroy();
        redirect('login');
    }
}
