<footer class="footer pt-3">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="copyright text-center text-sm text-muted">
                    © <?= date('Y'); ?> PLN UP2D RIAU - Sistem Informasi Manajemen
                </div>
            </div>
        </div>
    </div>
</footer>

</div>
</main>

<!-- =========================
     CORE JS (Argon)
     ========================= -->
<!-- jQuery First -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js" crossorigin="anonymous"></script>

<script src="<?= base_url('assets/assets/js/core/popper.min.js'); ?>"></script>
<script src="<?= base_url('assets/assets/js/core/bootstrap.min.js'); ?>"></script>

<script src="<?= base_url('assets/assets/js/plugins/perfect-scrollbar.min.js'); ?>"></script>
<script src="<?= base_url('assets/assets/js/plugins/smooth-scrollbar.min.js'); ?>"></script>

<!-- ✅ PENTING: Argon Dashboard HANYA 1x -->
<script src="<?= base_url('assets/assets/js/argon-dashboard.min.js?v=2.1.0'); ?>"></script>

<!-- Libraries (Select2, Chart, DataTables) - Moved from Header -->
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>

<!-- Responsive JS -->
<script src="<?= base_url('assets/assets/js/responsive.js'); ?>"></script>

<!-- Mobile Sidebar Toggle Helper - FIXED IMMEDIATE CLOSE BUG -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    console.log('=== MOBILE SIDEBAR INIT ===');
    
    const toggleBtn = document.getElementById('iconNavbarSidenav');
    const closeBtn = document.getElementById('iconSidenav');
    const sidebar = document.getElementById('sidenav-main');
    const body = document.body;
    let isTogglingNow = false; // Flag to prevent immediate close
    
    console.log('Toggle button:', toggleBtn);
    console.log('Close button:', closeBtn);
    console.log('Sidebar:', sidebar);
    
    // Simple toggle function
    function toggleSidebar() {
      const isOpen = body.classList.contains('mobile-sidebar-open');
      console.log('Toggling sidebar. Currently open:', isOpen);
      
      isTogglingNow = true; // Set flag during toggle
      
      if (isOpen) {
        body.classList.remove('mobile-sidebar-open');
        console.log('✓ Sidebar CLOSED');
      } else {
        body.classList.add('mobile-sidebar-open');
        console.log('✓ Sidebar OPENED');
      }
      
      // Reset flag after a bit
      setTimeout(function() {
        isTogglingNow = false;
        console.log('Toggle flag reset');
      }, 500);
    }
    
    function closeSidebar() {
      body.classList.remove('mobile-sidebar-open');
      console.log('✓ Sidebar CLOSED');
    }
    
    // Attach click handler to toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function(e) {
        console.log('>>> TOGGLE BUTTON CLICKED <<<');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Stop ALL propagation
        toggleSidebar();
      }, true); // Use capture phase
      console.log('✓ Toggle button listener attached');
    } else {
      console.error('✗ Toggle button NOT FOUND!');
    }
    
    // Attach click handler to close button  
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        console.log('>>> CLOSE BUTTON CLICKED <<<');
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
      });
      console.log('✓ Close button listener attached');
    }
    
    // IMPROVED: Close ONLY on actual clicks outside - with proper guards
    document.addEventListener('click', function(e) {
      // Don't do anything if we're currently toggling
      if (isTogglingNow) {
        console.log('Currently toggling - ignoring click');
        return;
      }
      
      // Only proceed if sidebar is open
      if (!body.classList.contains('mobile-sidebar-open')) {
        return;
      }
      
      // Check if click was inside sidebar
      const clickedInsideSidebar = sidebar && sidebar.contains(e.target);
      if (clickedInsideSidebar) {
        return; // Don't close if clicking inside sidebar
      }
      
      // Check if click was on toggle button or its children
      const clickedToggleBtn = toggleBtn && toggleBtn.contains(e.target);
      if (clickedToggleBtn) {
        return; // Don't close here, toggle handler will handle it
      }
      
      // If we reach here, user clicked outside sidebar - close it
      console.log('Clicked outside sidebar - closing');
      closeSidebar();
    }, false); // Use bubble phase
    
    // Close on ANY link click in sidebar (mobile only)
    if (sidebar) {
      sidebar.addEventListener('click', function(e) {
        if (window.innerWidth < 768) {
          // Don't close if we're toggling
          if (isTogglingNow) {
            return;
          }
          
          // Check if clicked element is a menu link
          const clickedLink = e.target.closest('a, .nav-link, button');
          
          // Don't close if clicking collapse toggle (submenu chevrons)
          const isCollapseToggle = e.target.closest('[data-bs-toggle="collapse"]');
          
          // Close sidebar if it's a link and not a collapse toggle
          if (clickedLink && !isCollapseToggle) {
            console.log('Menu item clicked - closing sidebar');
            closeSidebar();
          }
        }
      });
      
      console.log('✓ Sidebar click handler attached');
    }
    
    console.log('=== MOBILE SIDEBAR READY ===');
  });
</script>

<!-- Sidebar State Logic (Moved from Header) -->
<script defer>
document.addEventListener('DOMContentLoaded', function() {
    try {
    const currentModule = <?= json_encode($this->uri->segment(1) ?: '') ?>;
    // Handle role safely (might be undefined in footer scope if not passed, but session usually avl)
    // We only use role for some logic if needed, but the collapse logic uses 'groups'
    
    // open-new-tab helper
    document.querySelectorAll('a.open-new-tab[href]').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('javascript:') && href !== '#') {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // Restore collapse states
    const groups = {
        asset: ['unit', 'ulp', 'gardu_induk', 'gi_cell', 'gardu_hubung', 'gh_cell', 'pembangkit', 'kit_cell', 'pemutus', 'assets'],
        pustaka: ['sop', 'bpm', 'ik', 'road_map', 'spln'],
        operasi: ['operasi', 'single_line_diagram'],
        anggaran: ['anggaran', 'data_kontrak', 'monitoring', 'rekomposisi', 'rekap_prk', 'entry_kontrak', 'prognosa']
    };

    const mod = String(currentModule).toLowerCase();

    if (groups.asset.includes(mod)) {
        const menu = document.getElementById('menuAsset');
        const toggler = document.querySelector('a[aria-controls="menuAsset"]');
        if (menu) menu.classList.add('show');
        if (toggler) toggler.setAttribute('aria-expanded', 'true');
    }
    if (groups.pustaka.includes(mod)) {
        const menu = document.getElementById('menuPustaka');
        const toggler = document.querySelector('a[aria-controls="menuPustaka"]');
        if (menu) menu.classList.add('show');
        if (toggler) toggler.setAttribute('aria-expanded', 'true');
    }
    if (groups.operasi.includes(mod)) {
        const menu = document.getElementById('menuOperasi');
        const toggler = document.querySelector('a[aria-controls="menuOperasi"]');
        if (menu) menu.classList.add('show');
        if (toggler) toggler.setAttribute('aria-expanded', 'true');
    }
    if (groups.anggaran.includes(mod)) {
        const menu = document.getElementById('menuAnggaran');
        const toggler = document.querySelector('a[aria-controls="menuAnggaran"]');
        if (menu) menu.classList.add('show');
        if (toggler) toggler.setAttribute('aria-expanded', 'true');
    }

    } catch (e) {
    console.error(e);
    }
});
</script>

<!-- =========================
     Font Awesome (AMAN) - HAPUS KIT (403)
     ========================= -->
<link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    crossorigin="anonymous" referrerpolicy="no-referrer" />

<!-- ✅ HAPUS nucleo dari demo external (sering bikin font error) -->
<!-- kalau butuh, pakai versi local yang sudah kamu load di header -->

<!-- =========================
     SweetAlert2 (global)
     ========================= -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
    document.addEventListener('DOMContentLoaded', function() {

        /* =========================
           SweetAlert delete confirm
           ========================= */
        document.querySelectorAll('a.btn-hapus').forEach(function(btn) {
            if (btn.dataset.boundSwal === '1') return;
            btn.dataset.boundSwal = '1';

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const url = btn.getAttribute('href');
                if (!url) return;

                Swal.fire({
                    title: 'Apakah Anda yakin?',
                    text: 'Data ini akan dihapus secara permanen!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Ya, hapus!',
                    cancelButtonText: 'Batal'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = url;
                    }
                });
            });
        });

        /* =========================
           Horizontal scroll Alt+Wheel
           ========================= */
        document.querySelectorAll('.table-responsive').forEach(function(tableContainer) {
            tableContainer.addEventListener('wheel', function(e) {
                if (e.altKey) {
                    e.preventDefault();
                    this.scrollLeft += e.deltaY;
                }
            }, {
                passive: false
            });
        });

        /* =========================
           Scrollbar Windows (aman)
           ========================= */
        try {
            var win = navigator.platform.indexOf('Win') > -1;
            if (win && document.querySelector('#sidenav-scrollbar') && window.Scrollbar) {
                Scrollbar.init(document.querySelector('#sidenav-scrollbar'), {
                    damping: '0.5'
                });
            }
        } catch (e) {
            console.error(e);
        }

        /* =========================
           Chart.js (AMAN: cek canvas)
           ========================= */
        try {
            const canvas = document.getElementById('chart-line');
            if (canvas && window.Chart) {
                const ctx = canvas.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                        datasets: [{
                            label: 'Sales',
                            data: [50, 60, 70, 80, 90, 100, 110],
                            borderWidth: 3,
                            tension: 0.4,
                            fill: false,
                            pointRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Chart init error:', e);
        }

    });
</script>

<!-- =========================
     Select2 init (AMAN)
     ========================= -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // pastikan jQuery + select2 ada
        if (typeof window.jQuery === 'undefined') return;
        if (typeof jQuery.fn.select2 === 'undefined') return;

        $('.select2-modern').select2({
            placeholder: "-- Pilih atau Ketik --",
            allowClear: true,
            width: '100%'
        });

        // styling select2 (opsional)
        $('.select2-container--default .select2-selection--single').css({
            'height': '43px',
            'border': '1px solid #d2d6da',
            'border-radius': '8px',
            'padding': '6px 12px',
            'display': 'flex',
            'align-items': 'center',
            'font-size': '0.875rem'
        });

        $('.select2-container--default .select2-selection__placeholder').css({
            'color': '#adb5bd'
        });

        $('.select2-container--default .select2-selection__arrow').css({
            'height': '38px',
            'right': '10px'
        });
    });
</script>

<!-- =========================
     Notif badge (opsional)
     ========================= -->
<script>
    <?php if ($this->session->userdata('logged_in')): ?>
            (function() {
                function updateNotifBadge() {
                    fetch('<?= base_url("Notifikasi/ajax_unread_count"); ?>')
                        .then(r => r.json())
                        .then(data => {
                            const badge = document.getElementById('notifBadge');
                            if (!badge) return;
                            const count = data.unread || 0;
                            badge.textContent = count;
                            badge.style.display = count > 0 ? 'inline-block' : 'none';
                        })
                        .catch(err => console.error('Notif count error:', err));
                }

                document.addEventListener('DOMContentLoaded', function() {
                    updateNotifBadge();
                    setInterval(updateNotifBadge, 30000);
                });
            })();
    <?php endif; ?>
</script>

<!-- =========================
     Global helpers: pagination & search helpers, logout confirm
     ========================= -->
<script>
    (function () {
        window.changePerPageGlobal = function(perPage, baseUrl = null) {
            try {
                const url = new URL(baseUrl || window.location.href, window.location.origin);
                url.searchParams.set('per_page', perPage);
                // Reset page to 0 (first page)
                url.searchParams.set('page', 0);
                window.location.href = url.toString();
            } catch (e) {
                console.error('changePerPageGlobal error', e);
            }
        };

        window.searchSubmit = function(baseUrlWithPage1, inputId, qParam = 'q') {
            try {
                const base = new URL(baseUrlWithPage1, window.location.origin);
                const input = document.getElementById(inputId);
                if (!input) return;
                const q = (input.value || '').trim();
                if (q) base.searchParams.set(qParam, q);

                // preserve per_page if already set
                const curr = new URL(window.location.href);
                const per = curr.searchParams.get('per_page');
                if (per) base.searchParams.set('per_page', per);

                // Reset to page 0 on new search
                base.searchParams.set('page', 0);

                window.location.href = base.toString();
            } catch (e) {
                console.error('searchSubmit error', e);
            }
        };

        window.searchSubmitMulti = function(baseUrl, inputIds, paramNames) {
            try {
                const base = new URL(baseUrl, window.location.origin);
                const curr = new URL(window.location.href);

                // Start with per_page from current URL if exists
                const per = curr.searchParams.get('per_page');
                if (per) base.searchParams.set('per_page', per);

                // Multi-param handling
                if (Array.isArray(inputIds) && Array.isArray(paramNames)) {
                    inputIds.forEach((id, idx) => {
                        const input = document.getElementById(id);
                        const pName = paramNames[idx];
                        if (input && pName) {
                            const val = (input.value || '').trim();
                            if (val !== '') {
                                base.searchParams.set(pName, val);
                            } else {
                                base.searchParams.delete(pName);
                            }
                        }
                    });
                }

                // Reset to page 0 on new search
                base.searchParams.set('page', 0);

                window.location.href = base.toString();
            } catch (e) {
                console.error('searchSubmitMulti error', e);
            }
        };

        // Logout confirm
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a.btn-logout').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const href = btn.getAttribute('href') || btn.dataset.href;
                    Swal.fire({
                        title: 'Konfirmasi',
                        text: 'Anda yakin ingin keluar?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Ya, keluar',
                        cancelButtonText: 'Batal'
                    }).then(result => {
                        if (result.isConfirmed) {
                            if (href) window.location.href = href;
                        }
                    });
                });
            });
        });
    })();
</script>

<!-- =========================
     Login Activity Monitor (Admin Only) - BIARKAN, sudah aman
     ========================= -->
<?php
$user_role = $this->session->userdata('user_role');
$is_admin = isset($user_role) && strpos(strtolower($user_role), 'admin') !== false;
?>

<!-- Modal: User Profile (Global) -->
<?php if ($this->session->userdata('logged_in')): ?>
<div class="modal fade" id="profileModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"><i class="fas fa-user-circle me-2"></i>Profil Pengguna</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p class="mb-2">Username: <strong class="text-dark"><?= htmlentities($this->session->userdata('username') ?: 'User') ?></strong></p>
        <p class="mb-2">Role: <strong class="text-dark"><?= htmlentities($this->session->userdata('user_role') ?: '-') ?></strong></p>
        <p class="mb-0">Mail: <strong class="text-dark"><?= htmlentities($this->session->userdata('email') ?: '-') ?></strong></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: Notifications (Global) -->
<div class="modal fade" id="notificationModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"><i class="fas fa-bell me-2"></i>Notifikasi</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-0">
          <div id="notifLoading" class="text-center py-4">
              <div class="spinner-border text-primary text-sm" role="status"></div>
          </div>
          <div id="notifList" class="list-group list-group-flush">
              <!-- Content loaded via AJAX -->
          </div>
      </div>
      <div class="modal-footer justify-content-between">
        <a href="<?= base_url('Notifikasi/mark_all_read') ?>" class="btn btn-sm btn-link text-decoration-none">Tandai semua dibaca</a>
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Tutup</button>
      </div>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Handling Notification Modal
    const notifModalEl = document.getElementById('notificationModal');
    if (notifModalEl) {
        notifModalEl.addEventListener('show.bs.modal', function () {
            loadNotifications();
        });
    }

    function loadNotifications() {
        const notifList = document.getElementById('notifList');
        const notifLoading = document.getElementById('notifLoading');
        
        notifList.innerHTML = '';
        notifLoading.style.display = 'block';

        fetch('<?= base_url('Notifikasi/get_latest') ?>')
            .then(response => response.json())
            .then(data => {
                notifLoading.style.display = 'none';
                if (data.latest && data.latest.length > 0) {
                    data.latest.forEach(n => {
                        const item = document.createElement('a');
                        // Use base_url for reading/redirect
                        // If type is delete, maybe just show alert or stay? For now standard link
                        const linkUrl = '<?= base_url('Notifikasi/read/') ?>' + n.id;
                        
                        item.href = linkUrl;
                        item.className = 'list-group-item list-group-item-action py-3';
                        if(n.is_read == 0) item.classList.add('bg-light'); // Highlight unread

                        // Simple Icon logic matching dashboard
                        let iconClass = 'ni-bell-55';
                        let badgeClass = 'bg-primary';
                        if (n.jenis_aktivitas === 'login') { iconClass = 'ni-check-bold'; badgeClass = 'bg-success'; }
                        else if (n.jenis_aktivitas === 'logout') { iconClass = 'ni-button-power'; badgeClass = 'bg-secondary'; }
                        else if (n.jenis_aktivitas === 'create') { iconClass = 'ni-fat-add'; badgeClass = 'bg-success'; }
                        else if (n.jenis_aktivitas === 'update') { iconClass = 'ni-settings'; badgeClass = 'bg-warning'; }
                        else if (n.jenis_aktivitas === 'delete') { iconClass = 'ni-fat-remove'; badgeClass = 'bg-danger'; }

                        item.innerHTML = `
                            <div class="d-flex align-items-center">
                                <div class="icon icon-sm shadow border-radius-md text-white text-center me-3 d-flex align-items-center justify-content-center ${badgeClass}">
                                    <i class="ni ${iconClass} text-white opacity-10" style="font-size: 12px;"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-center">
                                         <h6 class="mb-0 text-sm font-weight-bold">${n.role || 'System'}</h6>
                                         <small class="text-muted" style="font-size: 10px;">${n.tanggal_waktu}</small>
                                    </div>
                                    <p class="text-xs mb-0 text-secondary text-truncate" style="max-width: 250px;">
                                        ${n.deskripsi}
                                    </p>
                                </div>
                            </div>
                        `;
                        notifList.appendChild(item);
                    });
                } else {
                    notifList.innerHTML = '<div class="text-center py-4 text-muted"><small>Tidak ada notifikasi baru</small></div>';
                }

                // Update badge count if returned
                if (typeof data.unread_count !== 'undefined') {
                    const badge = document.getElementById('notifBadge');
                    if(badge) badge.textContent = data.unread_count;
                }
            })
            .catch(err => {
                console.error(err);
                notifLoading.style.display = 'none';
                notifList.innerHTML = '<div class="text-center py-4 text-danger"><small>Gagal memuat notifikasi</small></div>';
            });
    }
});
</script>
<?php endif; ?>

<!-- Modal: Login Activity Monitor (Admin Only) -->
<?php if ($is_admin): ?>
    <div class="modal fade" id="loginActivityModal" tabindex="-1" aria-labelledby="loginActivityModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="loginActivityModalLabel">
                        <i class="fa fa-users me-2"></i>Login Activity Monitor
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="roleSelector" class="form-label">Select Role:</label>
                        <select class="form-select" id="roleSelector">
                            <option value="">-- All Roles Summary --</option>
                            <option value="Perencanaan">Perencanaan</option>
                            <option value="Admin">Admin</option>
                            <option value="Operasi Sistem Distribusi">Operasi Sistem Distribusi</option>
                            <option value="Fasilitas Operasi">Fasilitas Operasi</option>
                            <option value="Pemeliharaan">Pemeliharaan</option>
                            <option value="K3L & KAM">K3L & KAM</option>
                        </select>
                    </div>

                    <div id="loadingSpinner" class="text-center my-4" style="display:none;">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading data...</p>
                    </div>

                    <div id="errorMessage" class="alert alert-danger text-white" style="display:none;">
                        <i class="fas fa-exclamation-triangle me-2"></i> <span id="errorText"></span>
                    </div>

                    <!-- Summary View -->
                    <div id="summaryView">
                        <div class="table-responsive">
                            <table class="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Role</th>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Users</th>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Logins</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Latest</th>
                                    </tr>
                                </thead>
                                <tbody id="summaryTableBody"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Detail View -->
                    <div id="detailView" style="display:none;">
                        <h6 class="mb-3">Role: <span id="selectedRoleName" class="text-primary"></span></h6>
                        <div class="table-responsive">
                            <table class="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">User</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Email</th>
                                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Logins</th>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Last Login</th>
                                    </tr>
                                </thead>
                                <tbody id="detailTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="loadLoginStats()">Refresh</button>
                </div>
            </div>
        </div>
    </div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const loginActivityBtn = document.getElementById('loginActivityBtn');
    if (!loginActivityBtn) return;

    const loginActivityModal = new bootstrap.Modal(document.getElementById('loginActivityModal'));
    const roleSelector = document.getElementById('roleSelector');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const summaryView = document.getElementById('summaryView');
    const detailView = document.getElementById('detailView');
    const errorMessage = document.getElementById('errorMessage');

    // Make functions global so they can be called from onclick
    window.loadLoginStats = function() {
        const selectedRole = roleSelector.value;

        loadingSpinner.style.display = 'block';
        summaryView.style.display = 'none';
        detailView.style.display = 'none';
        errorMessage.style.display = 'none';

        const url = selectedRole
            ? '<?= base_url('dashboard/get_role_login_stats') ?>?role=' + encodeURIComponent(selectedRole)
            : '<?= base_url('dashboard/get_role_login_stats') ?>';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                loadingSpinner.style.display = 'none';

                if (data.success) {
                    if (data.summary) displaySummary(data.summary);
                    else if (data.users) displayDetails(data.role, data.users);
                } else {
                    showError(data.message || 'Failed to load data');
                }
            })
            .catch(error => {
                loadingSpinner.style.display = 'none';
                showError('Network error: ' + error.message);
            });
    };

    loginActivityBtn.addEventListener('click', function() {
        loginActivityModal.show();
        loadLoginStats();
    });

    roleSelector.addEventListener('change', function() {
        loadLoginStats();
    });

    function displaySummary(summary) {
        const tbody = document.getElementById('summaryTableBody');
        tbody.innerHTML = '';

        if (!summary || summary.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No data available</td></tr>';
        } else {
            summary.forEach(item => {
                const row = document.createElement('tr');
                const formattedDate = formatDateTime(item.latest_login);
                row.innerHTML = `
                    <td><strong style="font-size: 0.85rem;">${escapeHtml(item.role || 'N/A')}</strong></td>
                    <td class="text-center">${item.total_users || 0}</td>
                    <td class="text-center"><span class="badge bg-primary">${item.total_logins || 0}</span></td>
                    <td><small>${formattedDate}</small></td>
                `;
                tbody.appendChild(row);
            });
        }

        summaryView.style.display = 'block';
    }

    function displayDetails(role, users) {
        document.getElementById('selectedRoleName').textContent = role;
        const tbody = document.getElementById('detailTableBody');
        tbody.innerHTML = '';

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found for this role</td></tr>';
        } else {
            users.forEach((user, index) => {
                const row = document.createElement('tr');
                const formattedDate = formatDateTime(user.last_login);
                row.innerHTML = `
                    <td class="text-center">${index + 1}</td>
                    <td style="font-size: 0.85rem;">${escapeHtml(user.name || 'N/A')}</td>
                    <td><small>${escapeHtml(user.email || 'N/A')}</small></td>
                    <td class="text-center"><span class="badge bg-info">${user.login_count || 0}</span></td>
                    <td><small>${formattedDate}</small></td>
                `;
                tbody.appendChild(row);
            });
        }

        detailView.style.display = 'block';
    }

    function formatDateTime(dateTimeString) {
        if (!dateTimeString || dateTimeString === 'Never') return 'Never';
        try {
            const parts = dateTimeString.split(' ');
            if (parts.length === 2) {
                const datePart = parts[0].split('-');
                const timePart = parts[1].substring(0, 5);
                return `${datePart[2]}/${datePart[1]} ${timePart}`;
            }
            return dateTimeString;
        } catch (e) {
            return dateTimeString;
        }
    }

    function showError(message) {
        document.getElementById('errorText').textContent = message;
        errorMessage.style.display = 'block';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
</script>
<?php endif; ?>

</body>

</html>