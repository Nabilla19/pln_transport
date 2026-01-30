<!-- Navbar -->
<nav class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" id="navbarBlur" data-scroll="false">
  <div class="container-fluid py-1 px-3">

    <!-- Breadcrumb & Title -->
    <nav aria-label="breadcrumb" class="flex-grow-1">
      <ol class="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-2">
        <li class="breadcrumb-item text-sm d-none d-sm-block">
          <a class="opacity-5 text-white" href="<?= isset($parent_page_url) ? $parent_page_url : base_url('dashboard'); ?>">
            <?= isset($parent_page_title) ? $parent_page_title : 'Dashboard'; ?>
          </a>
        </li>
        <li class="breadcrumb-item text-sm text-white active" aria-current="page">
          <?= isset($page_title) ? $page_title : 'Page'; ?>
        </li>
      </ol>

      <h6 class="font-weight-bolder text-white mb-0 d-flex align-items-center">
        <?php if (isset($page_icon) && !empty($page_icon)): ?>
          <i class="<?= $page_icon; ?> text-white text-sm opacity-100 me-2 d-none d-sm-inline"></i>
        <?php endif; ?>
        <span class="text-truncate"><?= isset($page_title) ? $page_title : 'Page'; ?></span>
      </h6>
    </nav>

    <!-- Right Icons -->
    <div class="d-flex align-items-center ms-auto">
      <ul class="navbar-nav flex-row align-items-center mb-0 gap-2 gap-md-0">

        <!-- Profile / Sign In -->
        <li class="nav-item d-flex align-items-center me-0 me-md-3">
          <?php $profileHref = $this->session->userdata('logged_in') ? 'javascript:;' : base_url('login'); ?>
          <?php $profileAttr = $this->session->userdata('logged_in') ? 'data-bs-toggle="modal" data-bs-target="#profileModal"' : ''; ?>
          <a href="<?= $profileHref ?>" <?= $profileAttr ?>
             class="nav-link text-white font-weight-bold px-0 d-flex align-items-center touch-target"
             title="Profile">
            <i class="ni ni-single-02 text-white me-1 me-md-2"></i>

            <span class="navbar-username d-none d-sm-inline">
              <?php
                if ($this->session->userdata('logged_in')) {
                  echo $this->session->userdata('username') ?: 'User';
                } else {
                  echo 'Sign In';
                }
              ?>
            </span>
          </a>
        </li>


        <?php
          $user_role = $this->session->userdata('user_role');
          $is_admin = $user_role && (strpos(strtolower($user_role), 'admin') !== false);
          if ($is_admin):
        ?>
          <!-- Login Activity Monitor (Admin Only) -->
          <li class="nav-item px-1 px-md-2 d-flex align-items-center me-0 me-md-3">
            <a href="javascript:;" class="nav-link text-white p-0 touch-target" id="loginActivityBtn" title="Monitor Login Activity">
              <i class="ni ni-circle-08 text-white cursor-pointer"></i>
            </a>
          </li>
        <?php endif; ?>

        <!-- Notification Bell -->
        <li class="nav-item dropdown pe-0 pe-md-2 d-flex align-items-center">
          <?php $notifHref = $this->session->userdata('logged_in') ? 'javascript:;' : base_url('login'); ?>
          <?php $notifAttr = $this->session->userdata('logged_in') ? 'data-bs-toggle="modal" data-bs-target="#notificationModal"' : ''; ?>
          <a href="<?= $notifHref ?>" <?= $notifAttr ?> class="nav-link text-white p-0 position-relative touch-target" title="Lihat Notifikasi">
            <i class="fas fa-bell text-white cursor-pointer" style="font-size: 18px;"></i>
            <span id="notifBadge"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style="font-size: 9px; display: none;">
              0
            </span>
          </a>
        </li>

      </ul>
    </div>
  </div>
</nav>
<!-- End Navbar -->

<!-- Enhanced Mobile Navbar Styling -->
<style>
  .navbar-username { color: #fff; display: inline; }
  
  @media (max-width: 575.98px) {
    .navbar-username { display: none; }
  }
  
  /* Enhanced Mobile Toggle Button */
  .custom-sidenav-toggler {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    cursor: pointer;
    position: relative;
    z-index: 1100 !important;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .custom-sidenav-toggler:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  .custom-sidenav-toggler:active {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  }
  
  .custom-sidenav-toggler i {
    font-size: 20px;
    pointer-events: none;
  }
  
  /* Ensure navbar has proper z-index */
  .navbar-main {
    position: relative;
    z-index: 1050 !important;
  }
  
  /* Touch-friendly targets */
  .touch-target {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>

<script>
  // Fetch notification count on page load
  document.addEventListener('DOMContentLoaded', function() {
    fetchNotificationCount();
    setInterval(fetchNotificationCount, 30000);
  });

  function fetchNotificationCount() {
    fetch('<?= base_url("Notifikasi/get_unread_count"); ?>')
      .then(response => response.json())
      .then(data => {
        const badge = document.getElementById('notifBadge');
        if (!badge) return;

        if (data.count > 0) {
          badge.textContent = data.count > 99 ? '99+' : data.count;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      })
      .catch(error => console.error('Error fetching notification count:', error));
  }
</script>
