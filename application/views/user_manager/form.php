<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-lg-9 col-md-10 mx-auto">
          
          <!-- Flash Messages -->
          <?php if ($this->session->flashdata('error')): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <span class="alert-icon"><i class="fas fa-exclamation-circle"></i></span>
              <span class="alert-text"><?= $this->session->flashdata('error'); ?></span>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
          <?php endif; ?>
          
          <div class="card">
            <div class="card-header bg-gradient-primary pb-3 pt-3">
              <h5 class="text-white mb-0">
                <i class="<?= $mode == 'create' ? 'fas fa-user-plus' : 'fas fa-user-edit'; ?> me-2"></i>
                <?= $mode == 'create' ? 'Tambah User Baru' : 'Edit User'; ?>
              </h5>
            </div>
            
            <div class="card-body p-4">
              <form action="<?= base_url('user_manager/' . ($mode == 'create' ? 'store' : 'update/' . $user['id'])); ?>" method="post">
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-control-label">Nama Lengkap <span class="text-danger">*</span></label>
                      <input class="form-control" type="text" name="name" 
                             value="<?= $user ? htmlspecialchars($user['name']) : ''; ?>" 
                             required placeholder="Nama lengkap user">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-control-label">Email <span class="text-danger">*</span></label>
                      <input class="form-control" type="email" name="email" 
                             value="<?= $user ? htmlspecialchars($user['email']) : ''; ?>" 
                             required placeholder="email@pln.co.id">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-control-label">
                        Password 
                        <?php if ($mode == 'create'): ?>
                          <span class="text-danger">*</span>
                        <?php else: ?>
                          <span class="text-muted text-xs">(Kosongkan jika tidak diubah)</span>
                        <?php endif; ?>
                      </label>
                      <input class="form-control" type="password" name="password" 
                             <?= $mode == 'create' ? 'required' : ''; ?> 
                             minlength="6" placeholder="Minimal 6 karakter">
                    </div>
                  </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-control-label">Role <span class="text-danger">*</span></label>
                      <select class="form-select" name="role_id" id="role_select" required>
                        <option value="">-- Pilih Role --</option>
                        <?php foreach ($roles as $role_id => $role_name): ?>
                          <option value="<?= $role_id; ?>" 
                                  data-role="<?= htmlspecialchars($role_name); ?>"
                                  <?= ($user && $user['role_id'] == $role_id) ? 'selected' : ''; ?>>
                            <?= htmlspecialchars($role_name); ?>
                          </option>
                        <?php endforeach; ?>
                      </select>
                      <input type="hidden" name="role_name" id="role_name" value="<?= $user ? htmlspecialchars($user['role']) : ''; ?>">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-group">
                      <label class="form-control-label">Status Akun <span class="text-danger">*</span></label>
                      <select class="form-select" name="is_active" required>
                        <option value="1" <?= (!$user || $user['is_active'] == 1) ? 'selected' : ''; ?>>Aktif</option>
                        <option value="0" <?= ($user && $user['is_active'] == 0) ? 'selected' : ''; ?>>Non-aktif</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr class="horizontal dark">

                <div class="d-flex justify-content-between">
                  <a href="<?= base_url('user_manager'); ?>" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-1"></i> Batal
                  </a>
                  <button type="submit" class="btn bg-gradient-primary">
                    <i class="fas fa-save me-1"></i> <?= $mode == 'create' ? 'Simpan' : 'Update'; ?>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
</main>
    
<script>
// Update role_name hidden field when role is selected
document.getElementById('role_select').addEventListener('change', function() {
  const selected = this.options[this.selectedIndex];
  document.getElementById('role_name').value = selected.dataset.role || '';
});
</script>
