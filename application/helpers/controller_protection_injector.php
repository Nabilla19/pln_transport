<?php
/**
 * Script helper untuk inject protection code ke controllers
 * Untuk digunakan manual, bukan di-autoload
 */

function inject_can_create_protection($controller_path) {
    $content = file_get_contents($controller_path);
    
    // Pattern untuk function tambah/create
    $patterns = [
        '/public function tambah\(\)\s*\{/' => 'public function tambah()
    {
        // Check permission
        if (!can_create()) {
            $this->session->set_flashdata(\'error\', \'Anda tidak memiliki akses untuk menambah data\');
            redirect($this->router->fetch_class());
        }
',
        '/public function create\(\)\s*\{/' => 'public function create()
    {
        // Check permission
        if (!can_create()) {
            $this->session->set_flashdata(\'error\', \'Anda tidak memiliki akses untuk menambah data\');
            redirect($this->router->fetch_class());
        }
',
    ];
    
    foreach ($patterns as $pattern => $replacement) {
        $content = preg_replace($pattern, $replacement, $content);
    }
    
    file_put_contents($controller_path, $content);
}

function inject_can_edit_protection($controller_path) {
    $content = file_get_contents($controller_path);
    
    // Pattern untuk function edit/update
    $patterns = [
        '/public function edit\(([^)]*)\)\s*\{/' => 'public function edit($1)
    {
        // Check permission
        if (!can_edit()) {
            $this->session->set_flashdata(\'error\', \'Anda tidak memiliki akses untuk mengubah data\');
            redirect($this->router->fetch_class());
        }
',
        '/public function update\(([^)]*)\)\s*\{/' => 'public function update($1)
    {
        // Check permission
        if (!can_edit()) {
            $this->session->set_flashdata(\'error\', \'Anda tidak memiliki akses untuk mengubah data\');
            redirect($this->router->fetch_class());
        }
',
    ];
    
    foreach ($patterns as $pattern => $replacement) {
        $content = preg_replace($pattern, $replacement, $content);
    }
    
    file_put_contents($controller_path, $content);
}

function inject_can_delete_protection($controller_path) {
    $content = file_get_contents($controller_path);
    
    // Pattern untuk function hapus/delete
    $patterns = [
        '/public function hapus\(([^)]*)\)\s*\{/' => 'public function hapus($1)
    {
        // Check permission
        if (!can_delete()) {
            $this->session->set_flashdata(\'error\', \'Anda tidak memiliki akses untuk menghapus data\');
            redirect($this->router->fetch_class());
        }
',
        '/public function delete\(([^)]*)\)\s*\{/' => 'public function delete($1)
    {
        // Check permission
        if (!can_delete()) {
            $this->session->set_flashdata(\'error\', \'Anda tidak memiliki akses untuk menghapus data\');
            redirect($this->router->fetch_class());
        }
',
    ];
    
    foreach ($patterns as $pattern => $replacement) {
        $content = preg_replace($pattern, $replacement, $content);
    }
    
    file_put_contents($controller_path, $content);
}
