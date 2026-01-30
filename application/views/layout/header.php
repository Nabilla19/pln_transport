<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <meta name="theme-color" content="#0d6efd" />

  <!-- Favicon -->
  <link rel="apple-touch-icon" sizes="76x76" href="<?= base_url('assets/assets/img/apple-icon.png'); ?>">
  <link rel="icon" type="image/png" href="<?= base_url('assets/assets/img/logo_pln.png'); ?>">

  <title><?= isset($page_title) ? htmlspecialchars($page_title) . ' - PLN UP2D RIAU' : 'PLN UP2D RIAU'; ?></title>

  <!-- Preconnect + Fonts -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&display=swap" rel="stylesheet" />

  <!-- Core CSS (local) -->
  <link href="<?= base_url('assets/assets/css/nucleo-icons.css'); ?>" rel="stylesheet" />
  <link href="<?= base_url('assets/assets/css/nucleo-svg.css'); ?>" rel="stylesheet" />
  <link id="pagestyle" href="<?= base_url('assets/assets/css/argon-dashboard.css?v=2.1.0'); ?>" rel="stylesheet" />
  <link rel="stylesheet" href="<?= base_url('assets/assets/css/sidebar.css'); ?>">
  <link rel="stylesheet" href="<?= base_url('assets/assets/css/sidebar-collapsed.css'); ?>">
  <link rel="stylesheet" href="<?= base_url('assets/assets/css/pln-theme.css'); ?>">
  <link rel="stylesheet" href="<?= base_url('assets/assets/css/responsive.css'); ?>">>>

  <!-- Select2 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

  <!-- Font Awesome (dipakai untuk semua ikon menu supaya tidak kotak-kotak) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous">

  <!-- DataTables CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css">

  <style>
    /* 1) Pastikan bullet/marker default tidak tampil di sidebar */
    .sidenav ul,
    .sidenav li {
      list-style: none !important;
      margin: 0;
      padding: 0;
    }

    /* 2) Matikan pseudo-element (before/after) yang menambahkan panah/marker */
    .sidenav .nav-link::before,
    .sidenav .nav-link::after,
    .sidenav .nav-item::before,
    .sidenav .nav-item::after,
    .sidenav .nav-link[data-bs-toggle="collapse"]::after {
      content: none !important;
      display: none !important;
      background-image: none !important;
    }

    /* 3) Pastikan panah manual (fa-chevron-down) yang ada di markup tetap di kanan */
    .sidenav .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sidenav .nav-link .fa-chevron-down {
      margin-left: auto;
      order: 2;
    }

    /* 4) Sedikit spacing supaya ikon & teks rapi */
    .sidenav .nav-link i {
      margin-right: 0.6rem;
    }

    .sidenav .nav-link .nav-link-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 5) Matikan ::marker */
    .sidenav li::marker {
      content: none !important;
      display: none !important;
    }

    /* Tambahan: pastikan submenu bisa diklik (tidak ketutup overlay collapse) */
    .submenu-list .nav-link,
    #menuAnggaran .nav-link {
      position: relative;
      z-index: 5;
      pointer-events: auto;
    }
  </style>

</head>

<body class="g-sidenav-show bg-gray-100">
  <div class="min-height-300 bg-dark position-absolute w-100" aria-hidden="true"></div>

  <!-- MOBILE SIDEBAR FIX: Ultra-strong inline styles -->
  <style>
    @media (max-width: 768px) {
      /* Force sidebar to be hidden by default on mobile - ULTRA SPECIFIC */
      aside#sidenav-main,
      #sidenav-main.sidenav,
      aside.sidenav#sidenav-main {
        position: fixed !important;
        top: 0 !important;
        left: -280px !important;
        bottom: 0 !important;
        width: 260px !important;
        height: 100vh !important;
        max-height: 100vh !important;
        z-index: 9999 !important;
        margin: 0 !important;
        padding: 0 !important;
        transition: left 0.3s ease !important;
        background: white !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        transform: none !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* Show sidebar when body has active class - ULTRA SPECIFIC */
      body.mobile-sidebar-open aside#sidenav-main,
      body.mobile-sidebar-open #sidenav-main.sidenav,
      body.mobile-sidebar-open aside.sidenav#sidenav-main {
        left: 0 !important;
        transform: translateX(0) !important;
      }

      /* Backdrop overlay */
      body.mobile-sidebar-open::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
        pointer-events: auto;
      }

      /* Prevent body scroll when sidebar open */
      body.mobile-sidebar-open {
        overflow: hidden !important;
      }

      /* Main content full width on mobile */
      .main-content,
      main.main-content {
        margin-left: 0 !important;
        width: 100% !important;
      }
      
      
      /* Ensure navbar is below sidebar */
      .navbar-main {
        z-index: 1050 !important;
      }
      
      /* Mobile Toggle Button - Shows when sidebar closed */
      .custom-sidenav-toggler {
        position: fixed !important;
        left: 1rem !important;
        top: 1rem !important;
        width: 42px !important;
        height: 42px !important;
        background: white !important;
        border-radius: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        z-index: 1100 !important;
        box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
        transition: all 0.2s ease !important;
        border: 1px solid rgba(0,0,0,0.05) !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      .custom-sidenav-toggler i {
        color: #344767 !important;
        font-size: 18px !important;
      }
      
      .custom-sidenav-toggler:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.2) !important;
        transform: scale(1.05) !important;
      }
      
      .custom-sidenav-toggler:active {
        transform: scale(0.95) !important;
      }
      
      /* Completely hide toggle when sidebar is open */
      body.mobile-sidebar-open .custom-sidenav-toggler {
        display: none !important;
      }
    }
    
    /* Hide toggle on desktop */
    @media (min-width: 992px) {
      .custom-sidenav-toggler {
        display: none !important;
      }
    }
  </style>

  <?php
  // =========================
  // Role + segment helper
  // =========================
  $role = null;
  if (isset($this) && isset($this->session)) {
    $r = $this->session->userdata('user_role') ?: $this->session->userdata('role');
    $role = $r ? strtolower(trim($r)) : null;
  } elseif (isset($_SESSION['user_role'])) {
    $role = strtolower(trim($_SESSION['user_role']));
  }

  $role_json = json_encode($role);
  $seg1 = strtolower((string)($this->uri->segment(1) ?? ''));

  // Role UP3 (lebih aman pakai "contains", karena kadang role bisa "UP3 Pekanbaru", dll)
  $is_up3 = ($role !== null) && (strpos($role, 'up3') !== false);

  $transport_routes = ['transport'];
  
  $role_id = $this->session->userdata('role_id');

  // Fetch Transport Pending Counts for Sidebar Badges
  $CI =& get_instance();
  $CI->load->model('Transport_model');
  $pending_counts = $CI->Transport_model->get_pending_counts($role_id, $role);
  $total_pending_transport = $pending_counts['pending_asmen'] + $pending_counts['pending_fleet'] + $pending_counts['in_progress'];
  ?>

  <!-- Mobile Toggle Button (outside sidebar, shows when closed) -->
  <div class="custom-sidenav-toggler d-lg-none" id="iconNavbarSidenav">
    <i class="fas fa-bars"></i>
  </div>

  <!-- Sidebar -->
  <aside class="sidenav bg-white navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-4" id="sidenav-main" role="navigation" aria-label="Sidebar utama">
    
    <div class="sidenav-header">
      <a class="navbar-brand m-0" href="<?= base_url('dashboard'); ?>">
        <img src="<?= base_url('assets/assets/img/logo_pln.png'); ?>" alt="Logo PLN" class="navbar-brand-img h-100" style="height:55px; width:auto;">
        <span class="ms-2 font-weight-bold text-dark">PLN UP2D RIAU</span>
      </a>
    </div>

    <hr class="horizontal dark mt-0">

    <div class="collapse navbar-collapse w-auto" id="sidenav-collapse-main">
      <ul class="navbar-nav">
        <!-- Dashboard -->
        <li class="nav-item">
          <a class="nav-link <?= ($seg1 == 'dashboard') ? 'active' : '' ?>" href="<?= base_url('dashboard'); ?>" aria-current="<?= ($seg1 == 'dashboard') ? 'page' : 'false' ?>">
            <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
              <!-- Pakai Font Awesome agar tidak kotak -->
              <i class="fas fa-gauge text-primary text-sm opacity-10" aria-hidden="true"></i>
            </div>
            <span class="nav-link-text ms-1">Dashboard</span>
          </a>
        </li>


        <!-- E-Transport -->
        <?php $transport_active = in_array($seg1, $transport_routes, true); ?>
        <li class="nav-item">
          <a href="#menuTransport" class="nav-link d-flex align-items-center justify-content-between <?= $transport_active ? 'active' : '' ?>"
            data-bs-toggle="collapse" role="button" aria-expanded="<?= $transport_active ? 'true' : 'false' ?>" aria-controls="menuTransport">
            <div class="d-flex align-items-center">
              <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center position-relative">
                <i class="fas fa-car text-dark text-sm opacity-10" aria-hidden="true"></i>
                <?php if ($total_pending_transport > 0): ?>
                  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 8px; padding: 3px 5px;">
                    <?= $total_pending_transport ?>
                  </span>
                <?php endif; ?>
              </div>
              <span class="nav-link-text ms-1">E-Transport</span>
            </div>
            <i class="fas fa-chevron-down text-xs me-2"></i>
          </a>

          <div class="collapse <?= $transport_active ? 'show' : '' ?>" id="menuTransport">
            <ul class="nav flex-column submenu-list">
              <li class="nav-item">
                <a class="nav-link <?= ($this->uri->segment(2) == 'ajukan') ? 'active' : '' ?>" href="<?= base_url('transport/ajukan'); ?>">
                  <i class="fas fa-plus-circle text-primary text-sm opacity-10"></i><span class="nav-link-text"> Ajukan Permohonan</span>
                </a>
              </li>

                <li class="nav-item">
                  <a class="nav-link <?= ($this->uri->segment(2) == 'semua_daftar') ? 'active' : '' ?>" href="<?= base_url('transport/semua_daftar'); ?>">
                    <i class="fas fa-briefcase text-info text-sm opacity-10"></i><span class="nav-link-text"> Daftar Permohonan Unit</span>
                  </a>
                </li>



              <?php if (in_array($role_id, [15, 16, 17, 18, 6]) || $role === 'kku'): // Asmen + Admin + KKU ?>
                <li class="nav-item">
                  <a class="nav-link <?= ($seg1 == 'transport' && $this->uri->segment(2) == 'approval') ? 'active' : '' ?>" href="<?= base_url('transport/approval'); ?>">
                    <i class="fas fa-check-double text-success text-sm opacity-10"></i><span class="nav-link-text"> Persetujuan Asmen / KKU</span>
                    <?php if ($pending_counts['pending_asmen'] > 0): ?>
                      <span class="badge badge-xs bg-danger ms-auto"><?= $pending_counts['pending_asmen'] ?></span>
                    <?php endif; ?>
                  </a>
                </li>
              <?php endif; ?>

              <?php if ($role === 'kku' || $role_id == 6): // KKU + Admin ?>
                <li class="nav-item">
                  <a class="nav-link <?= ($seg1 == 'transport' && $this->uri->segment(2) == 'fleet') ? 'active' : '' ?>" href="<?= base_url('transport/fleet'); ?>">
                    <i class="fas fa-truck-moving text-warning text-sm opacity-10"></i><span class="nav-link-text"> Manajemen Fleet (KKU)</span>
                    <?php if ($pending_counts['pending_fleet'] > 0): ?>
                      <span class="badge badge-xs bg-danger ms-auto"><?= $pending_counts['pending_fleet'] ?></span>
                    <?php endif; ?>
                  </a>
                </li>
              <?php endif; ?>

              <?php if ($role_id == 19 || $role_id == 6): // Security + Admin ?>
                <li class="nav-item">
                  <a class="nav-link <?= ($seg1 == 'transport' && $this->uri->segment(2) == 'security') ? 'active' : '' ?>" href="<?= base_url('transport/security'); ?>">
                    <i class="fas fa-shield-halved text-danger text-sm opacity-10"></i><span class="nav-link-text"> Pos Security</span>
                    <?php if ($pending_counts['in_progress'] > 0): ?>
                      <span class="badge badge-xs bg-danger ms-auto"><?= $pending_counts['in_progress'] ?></span>
                    <?php endif; ?>
                  </a>
                </li>
              <?php endif; ?>
            </ul>
          </div>
        </li>

        <!-- User Management (Admin Only) -->
        <?php if (is_admin()): ?>
          <li class="nav-item mt-3">
            <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">Admin</h6>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= ($seg1 == 'user_manager') ? 'active' : '' ?>" href="<?= base_url('user_manager'); ?>">
              <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                <i class="fas fa-users-cog text-primary text-sm opacity-10" aria-hidden="true"></i>
              </div>
              <span class="nav-link-text ms-1">Manajemen User</span>
            </a>
          </li>
        <?php endif; ?>

        <!-- Account Pages -->
        <li class="nav-item mt-3">
          <h6 class="ps-4 ms-2 text-uppercase text-xs font-weight-bolder opacity-6">Account Pages</h6>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="<?= base_url('login'); ?>">
            <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
              <i class="fas fa-right-to-bracket text-dark text-sm opacity-10" aria-hidden="true"></i>
            </div>
            <span class="nav-link-text ms-1">Sign In</span>
          </a>
        </li>


        <?php if (isset($this->session) && $this->session->userdata('logged_in')): ?>
          <li class="nav-item">
            <a class="nav-link btn-logout" href="<?= base_url('logout'); ?>">
              <div class="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                <i class="fas fa-power-off text-primary text-sm opacity-10" aria-hidden="true"></i>
              </div>
              <span class="nav-link-text ms-1">Logout</span>
            </a>
          </li>
        <?php endif; ?>

      </ul>
    </div>
  </aside>

  </aside>
