<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-lg-8 mx-auto">
            <div class="card shadow-lg border-0">
                <div class="card-header bg-gradient-info pb-5 pt-4">
                    <div class="d-flex align-items-center justify-content-between text-white">
                        <div>
                            <h5 class="mb-0 text-white font-weight-bolder">Edit Permohonan Kendaraan</h5>
                            <p class="text-sm opacity-8">Perbarui data permohonan #TR-<?= str_pad($r['id'], 5, '0', STR_PAD_LEFT) ?></p>
                        </div>
                        <i class="fas fa-edit fa-3x opacity-5"></i>
                    </div>
                </div>
                <div class="card-body mt-n5">
                    <div class="card shadow-sm border-0 border-radius-xl">
                        <div class="card-body">
                            <form action="<?= base_url('transport/approval/update/'.$r['id']) ?>" method="post">
                                <h6 class="text-uppercase text-info text-xs font-weight-bolder mb-3">Informasi Pemohon</h6>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Nama Lengkap</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                                                <input class="form-control" type="text" name="nama" value="<?= $r['nama'] ?>" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Jabatan</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-briefcase"></i></span>
                                                <input class="form-control" type="text" name="jabatan" value="<?= $r['jabatan'] ?>" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Bagian / Bidang</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-users-gear"></i></span>
                                                <?php 
                                                    $options = ['Perencanaan', 'Pemeliharaan', 'Operasi', 'Fasilitas Operasi', 'KKU', 'K3L & KAM', 'Pengadaan', 'UP3'];
                                                    $current_bagian = $r['bagian'];
                                                ?>
                                                <select class="form-control" name="bagian" required>
                                                    <?php foreach($options as $opt): ?>
                                                        <option value="<?= $opt ?>" <?= (strcasecmp($current_bagian, $opt) == 0) ? 'selected' : '' ?>><?= $opt ?></option>
                                                    <?php endforeach; ?>
                                                    <?php if (!in_array(ucwords(strtolower($current_bagian)), $options)): ?>
                                                        <option value="<?= $current_bagian ?>" selected><?= $current_bagian ?> (Custom)</option>
                                                    <?php endif; ?>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Macam Kendaraan</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-car-side"></i></span>
                                                <select class="form-control" name="macam_kendaraan" required>
                                                    <?php foreach($vehicle_types as $vt): ?>
                                                        <option value="<?= $vt['type_name'] ?>" <?= ($r['macam_kendaraan'] == $vt['type_name']) ? 'selected' : '' ?>><?= $vt['type_name'] ?></option>
                                                    <?php endforeach; ?>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row mt-2">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label class="form-control-label">Jumlah Penumpang</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-users"></i></span>
                                                <input class="form-control" type="number" name="jumlah_penumpang" value="<?= $r['jumlah_penumpang'] ?>" min="0" required>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr class="horizontal dark my-4">
                                <h6 class="text-uppercase text-info text-xs font-weight-bolder mb-3">Detail Perjalanan & Keperluan</h6>
                                
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label class="form-control-label">Lokasi Tujuan</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-location-arrow"></i></span>
                                                <input class="form-control" type="text" name="tujuan" value="<?= $r['tujuan'] ?>" required>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label class="form-control-label">Deskripsi Keperluan</label>
                                            <textarea class="form-control" name="keperluan" rows="3" required><?= $r['keperluan'] ?></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Waktu Berangkat</label>
                                            <input class="form-control" type="datetime-local" name="tanggal_jam_berangkat" value="<?= date('Y-m-d\TH:i', strtotime($r['tanggal_jam_berangkat'])) ?>" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Estimasi Durasi Pakai</label>
                                            <input class="form-control" type="text" name="lama_pakai" value="<?= $r['lama_pakai'] ?>">
                                        </div>
                                    </div>
                                </div>

                                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3">
                                    <a href="<?= base_url('transport/detail/'.$r['id']) ?>" class="text-secondary text-sm font-weight-bold order-2 order-md-1">
                                        <i class="fas fa-arrow-left me-1"></i> Batal & Kembali
                                    </a>
                                    <button type="submit" class="btn bg-gradient-info shadow-info px-5 mb-0 w-100 w-md-auto order-1 order-md-2">Simpan Perubahan <i class="fas fa-save ms-2"></i></button>
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
