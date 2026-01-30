<?php defined('BASEPATH') OR exit('No direct script access allowed'); ?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="icon" type="image/png" href="<?= base_url('assets/assets/img/logo_pln.png'); ?>">
  <title><?= $title ?? 'User Management'; ?> - PLN UP2D RIAU</title>
  
  <!-- Fonts and icons -->
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
  <link href="<?= base_url('assets/assets/css/nucleo-icons.css'); ?>" rel="stylesheet" />
  <link href="<?= base_url('assets/assets/css/nucleo-svg.css'); ?>" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  
  <!-- CSS Files -->
  <link id="pagestyle" href="<?= base_url('assets/assets/css/argon-dashboard.css?v=2.1.0'); ?>" rel="stylesheet" />
  
  <style>
    .user-management-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 260px;
      background: #fff;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      z-index: 1000;
      overflow-y: auto;
    }
    
    .user-management-content {
      margin-left: 260px;
      min-height: 100vh;
      background: #f8f9fa;
    }
    
    @media (max-width: 991px) {
      .user-management-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
      
      .user-management-sidebar.active {
        transform: translateX(0);
      }
      
      .user-management-content {
        margin-left: 0;
      }
    }
  </style>
</head>

<body class="g-sidenav-show bg-gray-100">
  
  <!-- User Management Sidebar -->
  <aside class="user-management-sidebar" id="userManagementSidebar">
    <div class="sidebar-header p-3 border-bottom">
      <div class="d-flex align-items-center">
        <img src="<?= base_url('assets/assets/img/logo_pln.png'); ?>" height="45" class="me-2">
        <div>
          <h6 class="mb-0 text-dark font-weight-bolder">User Management</h6>
          <p class="text-xs text-muted mb-0">PLN UP2D RIAU</p>
        </div>
      </div>
    </div>
    
    <!-- User Info -->
    <div class="p-3 border-bottom bg-light">
      <div class="d-flex align-items-center">
        <div class="avatar avatar-sm bg-gradient-primary text-white rounded-circle me-2">
          <?= strtoupper(substr($this->session->userdata('user_name'), 0, 2)); ?>
        </div>
        <div class="flex-grow-1">
          <h6 class="mb-0 text-sm"><?= $this->session->userdata('user_name'); ?></h6>
          <p class="text-xs text-muted mb-0">Administrator</p>
        </div>
      </div>
    </div>
    
    <!-- Navigation Menu -->
    <div class="navbar-nav mt-3">
      <h6 class="navbar-heading text-muted px-3">Menu</h6>
      
      <a href="<?= base_url('user_manager'); ?>" class="nav-link <?= ($active_menu ?? '') == 'list' ? 'active bg-gradient-primary text-white' : 'text-dark'; ?>">
        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
          <i class="fas fa-users <?= ($active_menu ?? '') == 'list' ? 'text-white' : 'text-primary'; ?>"></i>
        </div>
        <span class="nav-link-text ms-1">Daftar User</span>
      </a>
      
      <a href="<?= base_url('user_manager/create'); ?>" class="nav-link <?= ($active_menu ?? '') == 'create' ? 'active bg-gradient-primary text-white' : 'text-dark'; ?>">
        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
          <i class="fas fa-user-plus <?= ($active_menu ?? '') == 'create' ? 'text-white' : 'text-success'; ?>"></i>
        </div>
        <span class="nav-link-text ms-1">Tambah User</span>
      </a>
      
      <hr class="horizontal dark mt-3">
      
      <h6 class="navbar-heading text-muted px-3">Navigasi</h6>
      
      <a href="<?= base_url('dashboard'); ?>" class="nav-link text-dark">
        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
          <i class="fas fa-home text-info"></i>
        </div>
        <span class="nav-link-text ms-1">Dashboard</span>
      </a>
      
      <a href="<?= base_url('logout'); ?>" class="nav-link text-dark">
        <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
          <i class="fas fa-sign-out-alt text-danger"></i>
        </div>
        <span class="nav-link-text ms-1">Logout</span>
      </a>
    </div>
  </aside>
  
  <!-- Main Content -->
  <div class="user-management-content">
    <!-- Top Navbar -->
    <nav class="navbar navbar-main navbar-expand-lg bg-white shadow-sm px-4 py-3">
      <div class="container-fluid">
        <button class="btn btn-sm btn-primary d-lg-none me-3" id="sidebarToggle">
          <i class="fas fa-bars"></i>
        </button>
        
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0">
            <li class="breadcrumb-item text-sm">
              <a class="opacity-5 text-dark" href="<?= base_url('dashboard'); ?>">Dashboard</a>
            </li>
            <li class="breadcrumb-item text-sm text-dark active" aria-current="page">
              <?= $breadcrumb ?? 'User Management'; ?>
            </li>
          </ol>
        </nav>
      </div>
    </nav>
