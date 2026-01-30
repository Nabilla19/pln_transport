<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-lg-8 mx-auto">
            <div class="card shadow-lg border-0">
                <div class="card-header bg-gradient-primary pb-5 pt-4">
                    <div class="d-flex align-items-center justify-content-between text-white mobile-stack">
                        <div>
                            <h5 class="mb-0 text-white font-weight-bolder">Pengajuan Kendaraan</h5>
                            <p class="text-sm opacity-8 mb-0">Lengkapi data perjalanan Anda dengan benar.</p>
                        </div>
                        <i class="fas fa-car-side fa-3x opacity-5 d-none d-md-block"></i>
                    </div>
                </div>
                <div class="card-body mt-n5">
                    <div class="card shadow-sm border-0 border-radius-xl">
                        <div class="card-body">
                            <form action="<?= base_url('transport/simpan') ?>" method="post">
                                <h6 class="text-uppercase text-primary text-xs font-weight-bolder mb-3">Informasi Pemohon</h6>
                                <div class="row">
                                    <div class="col-md-6 col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Nama Lengkap</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                                                <input class="form-control" type="text" name="nama" value="<?= $this->session->userdata('user_name') ?>" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Jabatan</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-briefcase"></i></span>
                                                <input class="form-control" type="text" name="jabatan" placeholder="Contoh: Manager / Supervisor" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Bagian / Bidang</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-users-gear"></i></span>
                                                <?php 
                                                    $role_id = $this->session->userdata('role_id');
                                                    $selected_bidang = '';
                                                    if (in_array($role_id, [5, 15])) $selected_bidang = 'Perencanaan';
                                                    elseif (in_array($role_id, [3, 10, 16])) $selected_bidang = 'Pemeliharaan';
                                                    elseif (in_array($role_id, [1, 17])) $selected_bidang = 'Operasi';
                                                    elseif (in_array($role_id, [2, 18, 20])) $selected_bidang = 'Fasilitas Operasi';
                                                    elseif ($role_id == 14) $selected_bidang = 'KKU';
                                                    elseif ($role_id == 4) $selected_bidang = 'K3L & KAM';
                                                    elseif ($role_id == 9) $selected_bidang = 'Pengadaan';
                                                    elseif ($role_id == 8) $selected_bidang = 'UP3';
                                                    
                                                    $options = ['Perencanaan', 'Pemeliharaan', 'Operasi', 'Fasilitas Operasi', 'KKU', 'K3L & KAM', 'Pengadaan', 'UP3'];
                                                ?>
                                                <select class="form-control" name="bagian" required>
                                                    <option value="" disabled <?= empty($selected_bidang) ? 'selected' : '' ?>>-- Pilih Bidang --</option>
                                                    <?php foreach($options as $opt): ?>
                                                        <option value="<?= $opt ?>" <?= ($selected_bidang == $opt) ? 'selected' : '' ?>><?= $opt ?></option>
                                                    <?php endforeach; ?>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Macam Kendaraan</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-car-side"></i></span>
                                                <select class="form-control" name="macam_kendaraan" required>
                                                    <option value="" selected disabled>-- Pilih Jenis --</option>
                                                    <?php foreach($vehicle_types as $vt): ?>
                                                        <option value="<?= $vt['type_name'] ?>"><?= $vt['type_name'] ?></option>
                                                    <?php endforeach; ?>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row mt-2">
                                    <div class="col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Jumlah Penumpang</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-users"></i></span>
                                                <input class="form-control" type="number" name="jumlah_penumpang" placeholder="0" min="0" required>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr class="horizontal dark my-4">
                                <h6 class="text-uppercase text-primary text-xs font-weight-bolder mb-3">Detail Perjalanan & Keperluan</h6>
                                
                                <div class="row">
                                    <div class="col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Lokasi Tujuan</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-location-arrow"></i></span>
                                                <input class="form-control" type="text" name="tujuan" placeholder="Contoh: Kantor Wilayah / PLN ULP..." required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Deskripsi Keperluan</label>
                                            <textarea class="form-control" name="keperluan" rows="3" placeholder="Sebutkan alasan atau aktivitas yang akan dilakukan..." required></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Waktu Berangkat</label>
                                            <input class="form-control" type="datetime-local" name="tanggal_jam_berangkat" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-12">
                                        <div class="form-group mb-3">
                                            <label class="form-control-label">Estimasi Durasi Pakai</label>
                                            <input class="form-control" type="text" name="lama_pakai" placeholder="Contoh: 3 Jam / 1 Hari">
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mt-4 pt-3 border-top gap-3">
                                    <a href="<?= base_url('transport/semua_daftar') ?>" class="btn btn-outline-secondary text-sm font-weight-bold order-2 order-md-1 mobile-full-width">
                                        <i class="fas fa-arrow-left me-1"></i> Batal & Kembali
                                    </a>
                                    <button type="submit" class="btn bg-gradient-primary shadow-primary px-5 mb-0 mobile-full-width order-1 order-md-2">Kirim Permohonan <i class="fas fa-paper-plane ms-2"></i></button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
</main>

<style>
/* Fix form header overlap on mobile */
@media (max-width: 768px) {
    /* Reduce header padding on mobile */
    .card-header.bg-gradient-primary {
        padding-top: 1.5rem !important;
        padding-bottom: 1.5rem !important;
    }
    
    /* Remove negative margin on card body for mobile */
    .card-body.mt-n5 {
        margin-top: 0 !important;
        padding-top: 1.5rem !important;
    }
    
    /* Ensure header text is readable on mobile */
    .card-header h5 {
        font-size: 1.1rem !important;
    }
    
    .card-header p {
        font-size: 0.8rem !important;
    }
}
</style>
