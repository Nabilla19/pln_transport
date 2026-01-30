<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    
    <div class="container-fluid py-4">
      
      <!-- Flash Messages -->
      <?php if ($this->session->flashdata('success')): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <span class="alert-icon"><i class="fas fa-check-circle"></i></span>
          <span class="alert-text"><?= $this->session->flashdata('success'); ?></span>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      <?php endif; ?>
      
      <?php if ($this->session->flashdata('error')): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <span class="alert-icon"><i class="fas fa-exclamation-circle"></i></span>
          <span class="alert-text"><?= $this->session->flashdata('error'); ?></span>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      <?php endif; ?>

      <!-- Page Header -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-body py-3">
              <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h4 class="mb-0"><i class="fas fa-users text-primary me-2"></i>Daftar User</h4>
                  <p class="text-sm text-muted mb-0">Kelola semua akun pengguna sistem</p>
                </div>
                <a href="<?= base_url('user_manager/create'); ?>" class="btn btn-primary btn-sm">
                  <i class="fas fa-user-plus me-1"></i> Tambah User
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card">
            <div class="card-body py-3">
              <form method="get" class="row g-3">
                <div class="col-md-10">
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" name="search" class="form-control" placeholder="Cari nama, email, atau role..." value="<?= $this->input->get('search'); ?>">
                  </div>
                </div>
                <div class="col-md-2">
                  <button type="submit" class="btn btn-primary w-100">Cari</button>
                </div>
                <?php if ($this->input->get('search')): ?>
                  <div class="col-12">
                    <a href="<?= base_url('user_manager'); ?>" class="btn btn-sm btn-outline-secondary">
                      Reset
                    </a>
                  </div>
                <?php endif; ?>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- User List Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body px-0 pt-0 pb-2">
              <div class="table-responsive">
                <table class="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">User</th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Role</th>
                      <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                      <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Last Login</th>
                      <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <?php if (empty($users)): ?>
                      <tr>
                        <td colspan="5" class="text-center py-4">
                          <div class="text-center py-4">
                            <i class="fas fa-inbox fa-3x text-secondary mb-3"></i>
                            <p class="text-secondary mb-0">Tidak ada user ditemukan</p>
                          </div>
                        </td>
                      </tr>
                    <?php else: ?>
                      <?php foreach ($users as $user): ?>
                        <tr>
                          <td>
                            <div class="d-flex px-3 py-1 align-items-center">
                              <div class="avatar avatar-sm bg-gradient-primary rounded-circle me-3">
                                <span class="text-white text-xs"><?= strtoupper(substr($user['name'], 0, 2)); ?></span>
                              </div>
                              <div class="d-flex flex-column justify-content-center">
                                <h6 class="mb-0 text-sm"><?= htmlspecialchars($user['name']); ?></h6>
                                <p class="text-xs text-secondary mb-0"><?= htmlspecialchars($user['email']); ?></p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p class="text-xs font-weight-bold mb-0"><?= htmlspecialchars($user['role'] ?? 'N/A'); ?></p>
                            <p class="text-xs text-secondary mb-0">ID: <?= $user['role_id'] ?? '-'; ?></p>
                          </td>
                          <td class="align-middle text-center text-sm">
                            <span class="badge badge-sm bg-gradient-<?= $user['is_active'] ? 'success' : 'secondary'; ?>">
                              <?= $user['is_active'] ? 'Aktif' : 'Non-aktif'; ?>
                            </span>
                          </td>
                          <td class="align-middle text-center">
                            <span class="text-secondary text-xs">
                              <?= $user['last_login'] ? date('d/m/Y H:i', strtotime($user['last_login'])) : '-'; ?>
                            </span>
                          </td>
                          <td class="align-middle text-center">
                            <div class="btn-group btn-group-sm" role="group">
                               <a href="<?= base_url('user_manager/edit/' . $user['id']); ?>" 
                                  class="btn btn-info btn-sm" title="Edit">
                                <i class="fas fa-edit"></i>
                              </a>
                              <?php if ($user['id'] != $this->session->userdata('user_id')): ?>
                                <a href="<?= base_url('user_manager/delete/' . $user['id']); ?>" 
                                   class="btn btn-danger btn-sm" 
                                   onclick="return confirm('Yakin ingin menghapus user <?= htmlspecialchars($user['name']); ?>?')"
                                   title="Hapus">
                                  <i class="fas fa-trash"></i>
                                </a>
                              <?php endif; ?>
                            </div>
                          </td>
                        </tr>
                      <?php endforeach; ?>
                    <?php endif; ?>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pagination -->
            <?php if ($total_pages > 1): ?>
              <div class="card-footer">
                <nav aria-label="Page navigation">
                  <ul class="pagination justify-content-center">
                    <?php for ($i = 1; $i <= $total_pages; $i++): ?>
                      <li class="page-item <?= ($i == $current_page) ? 'active' : ''; ?>">
                        <a class="page-link" href="?page=<?= $i; ?><?= $this->input->get('search') ? '&search='.urlencode($this->input->get('search')) : ''; ?>">
                          <?= $i; ?>
                        </a>
                      </li>
                    <?php endfor; ?>
                  </ul>
                </nav>
                <p class="text-center text-sm text-muted">
                  Halaman <?= $current_page; ?> dari <?= $total_pages; ?> | Total: <?= $total_users; ?> user
                </p>
              </div>
            <?php endif; ?>
          </div>
        </div>
      </div>
    </div>
</main>
