  </div>
  
  <!-- Core JS Files -->
  <script src="<?= base_url('assets/assets/js/core/popper.min.js'); ?>"></script>
  <script src="<?= base_url('assets/assets/js/core/bootstrap.min.js'); ?>"></script>
  
  <script>
  // Mobile sidebar toggle
  document.getElementById('sidebarToggle')?.addEventListener('click', function() {
    document.getElementById('userManagementSidebar').classList.toggle('active');
  });
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 991) {
      const sidebar = document.getElementById('userManagementSidebar');
      const toggle = document.getElementById('sidebarToggle');
      
      if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    }
  });
  </script>
</body>
</html>
