<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-12">
            <div class="card shadow-lg border-0 mb-4">
                <div class="card-header pb-0 d-flex justify-content-between align-items-start bg-transparent mobile-stack">
                    <div class="mb-3 mb-md-0">
                        <h6 class="font-weight-bolder mb-0">Daftar Permohonan <?= isset($all) ? 'Unit' : 'Saya' ?></h6>
                        <p class="text-sm mb-0">Kelola dan pantau status peminjaman kendaraan operasional.</p>
                    </div>
                    <div class="d-flex flex-column flex-md-row gap-2">
                        <a href="<?= base_url('transport/ajukan') ?>" class="btn bg-gradient-primary btn-sm mb-0 mobile-full-width">
                            <i class="fas fa-plus me-2"></i>Buat Baru
                        </a>
                    </div>
                </div>
                <div class="card-body px-0 pt-0 pb-2">
                    <div class="table-responsive p-0">
                        <table class="table align-items-center mb-0 card-table" id="table-transport">
                            <thead>
                                <tr>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pemohon</th>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Perjalanan</th>
                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Waktu Keberangkatan</th>
                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                    <th class="text-secondary opacity-7"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($requests)): ?>
                                    <tr>
                                        <td colspan="5" class="text-center py-5">
                                            <i class="fas fa-folder-open text-secondary opacity-3 mb-3" style="font-size: 3rem;"></i>
                                            <p class="text-secondary">Belum ada data permohonan.</p>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                                <?php foreach ($requests as $r): ?>
                                <tr class="hover-shadow">
                                    <td data-label="Pemohon">
                                        <div class="d-flex px-3 py-1">
                                            <div class="avatar avatar-sm bg-gradient-info me-3 d-flex align-items-center justify-content-center">
                                                <i class="fas fa-user text-white"></i>
                                            </div>
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm"><?= $r['nama'] ?></h6>
                                                <p class="text-xs text-secondary mb-0"><?= $r['bagian'] ?></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Perjalanan">
                                        <div class="d-flex flex-column">
                                            <span class="text-sm font-weight-bold"><i class="fas fa-location-dot text-danger me-1"></i> <?= $r['tujuan'] ?></span>
                                            <div class="d-flex align-items-center">
                                                <span class="text-xs text-secondary"><?= substr($r['keperluan'], 0, 30) ?><?= strlen($r['keperluan']) > 30 ? '...' : '' ?></span>
                                                <span class="ms-2 badge badge-xxs bg-light text-dark border" title="Jumlah Penumpang"><i class="fas fa-users text-xxs me-1"></i><?= $r['jumlah_penumpang'] ?></span>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Waktu" class="align-middle text-center text-sm">
                                        <span class="text-dark text-xs font-weight-bold">
                                            <i class="far fa-calendar-alt me-1 text-primary"></i> <?= date('d/m/Y', strtotime($r['tanggal_jam_berangkat'])) ?><br>
                                            <i class="far fa-clock me-1 text-primary"></i> <?= date('H:i', strtotime($r['tanggal_jam_berangkat'])) ?>
                                        </span>
                                    </td>
                                    <td data-label="Status" class="align-middle text-center">
                                        <?php 
                                            $badge_class = 'bg-gradient-secondary';
                                            $icon = 'fa-clock';
                                            if ($r['status'] == 'Selesai') { $badge_class = 'bg-gradient-success'; $icon = 'fa-check-circle'; }
                                            elseif ($r['status'] == 'Ditolak') { $badge_class = 'bg-gradient-danger'; $icon = 'fa-times-circle'; }
                                            elseif ($r['status'] == 'In Progress') { $badge_class = 'bg-gradient-info'; $icon = 'fa-car-side'; }
                                            elseif ($r['status'] == 'Pending Fleet') { $badge_class = 'bg-gradient-warning'; $icon = 'fa-truck-loading'; }
                                        ?>
                                        <span class="badge badge-sm <?= $badge_class ?> d-inline-flex align-items-center">
                                            <i class="fas <?= $icon ?> me-1"></i> <?= $r['status'] ?>
                                        </span>
                                    </td>
                                    <td class="align-middle">
                                        <a href="<?= base_url('transport/detail/'.$r['id']) ?>" class="btn btn-link text-primary text-xs font-weight-bold mb-0">
                                            <i class="fas fa-eye me-1"></i>Detail
                                        </a>
                                        <?php if (in_array($r['status'], ['In Progress', 'Selesai'])): ?>
                                        <a href="<?= base_url('transport/export_pdf/'.$r['id']) ?>" target="_blank" class="btn btn-link text-danger text-xs font-weight-bold mb-0">
                                            <i class="fas fa-file-pdf me-1"></i>PDF
                                        </a>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.hover-shadow { transition: all 0.2s ease; }
.hover-shadow:hover { background-color: #f8f9fa; transform: scale(1.002); }
.badge { text-transform: none; font-weight: 600; }
</style>
