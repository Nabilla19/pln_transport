<?php defined('BASEPATH') OR exit('No direct script access allowed'); ?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="apple-touch-icon" sizes="76x76" href="<?= base_url('assets/assets/img/apple-icon.png'); ?>">
  <link rel="icon" type="image/png" href="<?= base_url('assets/assets/img/logo_pln.png'); ?>">
  <title><?= isset($title) ? $title : 'Masuk'; ?></title>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
  <link href="<?= base_url('assets/assets/css/nucleo-icons.css'); ?>" rel="stylesheet" />
  <link href="<?= base_url('assets/assets/css/nucleo-svg.css'); ?>" rel="stylesheet" />
  <link id="pagestyle" href="<?= base_url('assets/assets/css/argon-dashboard.css?v=2.1.0'); ?>" rel="stylesheet" />
  <style>
    html, body { height: 100%; }
    .split-wrapper { min-height: 100vh; display: flex; }
    .split-left { flex: 1; position: relative; overflow: hidden; }
    .split-right { width: 480px; max-width: 100%; background: #fff; display: flex; align-items: center; justify-content: center; padding: 2rem; box-shadow: -10px 0 30px rgba(0,0,0,0.06); }
    .slide { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 0.8s ease; }
    .slide.active { opacity: 1; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(45deg, rgba(0,0,0,0.45), rgba(0,0,0,0.15)); }
    .branding { position: absolute; top: 24px; left: 24px; display: flex; align-items: center; gap: 12px; color: #fff; z-index: 2; }
    .branding img { height: 48px; }
    .branding .title { font-weight: 700; letter-spacing: .5px; }
    .credit { position: absolute; bottom: 16px; right: 20px; color: rgba(255,255,255,.85); font-size: 12px; z-index: 2; }
    
    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .split-wrapper { 
        flex-direction: column; 
        min-height: 100vh;
      }
      
      /* Hide slideshow on mobile, show as header instead */
      .split-left {
        flex: none;
        height: 200px;
        min-height: 200px;
      }
      
      /* Make form container full width */
      .split-right {
        width: 100%;
        flex: 1;
        padding: 1.5rem 1rem;
        box-shadow: none;
        display: flex;
        align-items: flex-start;
        padding-top: 2rem;
      }
      
      /* Adjust branding for mobile */
      .branding {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
      
      .branding img {
        height: 60px;
      }
      
      .branding .title {
        font-size: 1.2rem;
      }
      
      /* Adjust credit position */
      .credit {
        bottom: 10px;
        right: 50%;
        transform: translateX(50%);
        font-size: 10px;
      }
      
      /* Make form card more compact */
      .card-body {
        padding: 1.5rem !important;
      }
      
      /* Adjust text sizes */
      .card-body h4 {
        font-size: 1.3rem !important;
      }
      
      .card-body .text-sm {
        font-size: 0.875rem !important;
      }
      
      /* Make buttons larger for touch */
      .btn {
        padding: 0.75rem 1rem !important;
        font-size: 0.95rem !important;
      }
      
      /* Adjust form inputs */
      .form-control {
        padding: 0.625rem 0.75rem !important;
        font-size: 0.95rem !important;
      }
      
      /* Stack remember me and forgot password on very small screens */
      @media (max-width: 400px) {
        .d-flex.justify-content-between {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 0.5rem;
        }
      }
    }
    
    /* Tablet adjustments */
    @media (min-width: 769px) and (max-width: 991px) {
      .split-right {
        width: 420px;
      }
    }
  </style>
</head>
<body class="bg-gray-100">
  <div class="split-wrapper">
    <!-- Left: Slideshow -->
    <div class="split-left">
      <div class="branding">
        <img src="<?= base_url('assets/assets/img/logo_pln.png'); ?>" alt="PLN">
        <div class="title">PLN UP2D RIAU</div>
      </div>

  <div class="slide active" style="background-image:url('<?= base_url('assets/assets/img/login-1.jpg'); ?>');" ></div>
  <div class="slide" style="background-image:url('<?= base_url('assets/assets/img/login-2.jpg'); ?>');" ></div>
  <div class="slide" style="background-image:url('<?= base_url('assets/assets/img/login-3.jpg'); ?>');" ></div>
      <div class="overlay"></div>
      <div class="credit">© <?= date('Y'); ?> PLN UP2D Riau</div>
    </div>

    <!-- Right: Login Form -->
    <div class="split-right">
      <div class="card w-100 shadow-none border-0">
        <div class="card-body p-4">
          <div class="text-center mb-4">
            <h4 class="font-weight-bolder">Selamat Datang</h4>
            <p class="mb-0 text-sm text-secondary">Masuk untuk melanjutkan</p>
          </div>

          <?php if (validation_errors()) : ?>
            <div class="alert alert-danger" role="alert">
              <?= validation_errors(); ?>
            </div>
          <?php endif; ?>

          <?php if ($this->session->flashdata('login_error')) : ?>
            <div class="alert alert-danger" role="alert">
              <?= $this->session->flashdata('login_error'); ?>
            </div>
          <?php endif; ?>

          <?= form_open('login/authenticate'); ?>
            <div class="mb-3">
              <label class="form-label" for="email">Email</label>
              <input type="email" name="email" id="email" class="form-control" placeholder="nama@pln.co.id" value="<?= set_value('email'); ?>" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="password">Password</label>
              <input type="password" name="password" id="password" class="form-control" placeholder="••••••••" required minlength="6" />
            </div>
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="rememberMe" />
                <label class="form-check-label" for="rememberMe">Ingat saya</label>
              </div>
              <a href="#" class="text-sm">Lupa password?</a>
            </div>
            <button type="submit" class="btn btn-primary w-100">Masuk</button>
          <?= form_close(); ?>

          <!-- Guest Access -->
          <div class="text-center mt-3">
            <a href="<?= base_url('login/guest_login'); ?>" class="text-sm text-secondary">
              <i class="ni ni-single-02 me-1"></i>Lihat sebagai Tamu
            </a>
          </div>
          
        </div>
      </div>
    </div>
  </div>

  <!-- Core JS -->
  <script src="<?= base_url('assets/assets/js/core/popper.min.js'); ?>"></script>
  <script src="<?= base_url('assets/assets/js/core/bootstrap.min.js'); ?>"></script>
  <script>
    // Simple slideshow
    (function(){
      const slides = document.querySelectorAll('.slide');
      let i = 0;
      setInterval(() => {
        slides[i].classList.remove('active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('active');
      }, 4000);
    })();
  </script>
</body>
</html>
