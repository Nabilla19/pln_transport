<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-12">
            <div class="card shadow-sm border-radius-xl">
                <div class="card-header pb-0 p-3">
                    <ul class="nav nav-pills nav-fill p-1 bg-transparent" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#antrian-tab" role="tab" aria-controls="antrian" aria-selected="true">
                                <i class="fas fa-clock text-sm me-2"></i>Antrian Persetujuan
                                <span class="badge badge-sm bg-danger ms-2"><?= count($active_requests) ?></span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#riwayat-tab" role="tab" aria-controls="riwayat" aria-selected="false">
                                <i class="fas fa-history text-sm me-2"></i>Riwayat Saya
                                <span class="badge badge-sm bg-secondary ms-2"><?= count($history_requests) ?></span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="card-body p-3">
                    <div class="tab-content" id="myTabContent">
                        <!-- TAB: ANTRIAN -->
                        <div class="tab-pane fade show active" id="antrian-tab" role="tabpanel">
                            <?php if (empty($active_requests)): ?>
                                <div class="text-center py-5">
                                    <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                                    <h6 class="text-secondary">Semua permohonan telah diproses.</h6>
                                </div>
                            <?php else: ?>
                                <div class="row mt-3">
                                <?php foreach ($active_requests as $r): ?>
                                    <div class="col-md-6 mb-4 col-12">
                                        <div class="card border border-radius-lg shadow-none h-100">
                                            <div class="card-body p-3">
                                                <div class="d-flex justify-content-between mb-3">
                                                    <div class="d-flex align-items-center">
                                                        <div class="icon icon-shape icon-sm bg-gradient-info shadow text-center border-radius-md me-2">
                                                            <i class="fas fa-user text-white opacity-10"></i>
                                                        </div>
                                                        <div>
                                                            <h6 class="text-xs font-weight-bold mb-0"><?= $r['nama'] ?></h6>
                                                            <p class="text-xxs text-secondary mb-0"><?= $r['bagian'] ?></p>
                                                        </div>
                                                    </div>
                                                    <span class="badge badge-xs bg-gradient-warning">Pending</span>
                                                </div>
                                                
                                                <div class="bg-gray-100 border-radius-lg p-3 mb-3">
                                                    <div class="d-flex mb-1">
                                                        <span class="text-xxs font-weight-bold text-uppercase text-secondary me-2" style="min-width: 60px;">Tujuan</span>
                                                        <span class="text-xs font-weight-bolder text-dark"><?= $r['tujuan'] ?></span>
                                                    </div>
                                                    <div class="d-flex">
                                                        <span class="text-xxs font-weight-bold text-uppercase text-secondary me-2" style="min-width: 60px;">Waktu</span>
                                                        <span class="text-xs text-primary"><?= date('d/m/Y H:i', strtotime($r['tanggal_jam_berangkat'])) ?></span>
                                                    </div>
                                                </div>

                                                <div class="d-flex justify-content-end">
                                                    <a href="<?= base_url('transport/detail/'.$r['id']) ?>" class="btn btn-outline-primary btn-sm mb-0">
                                                        <i class="fas fa-eye me-1"></i> Detail & Proses
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- TAB: RIWAYAT -->
                        <div class="tab-pane fade" id="riwayat-tab" role="tabpanel">
                            <div class="table-responsive p-0 mt-3">
                                <table class="table align-items-center mb-0">
                                    <thead>
                                        <tr>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pemohon</th>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Tujuan & Waktu</th>
                                            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Waktu ACC</th>
                                            <th class="text-secondary opacity-7"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php if (empty($history_requests)): ?>
                                            <tr>
                                                <td colspan="5" class="text-center py-4">
                                                    <p class="text-xs text-secondary mb-0">Belum ada riwayat persetujuan.</p>
                                                </td>
                                            </tr>
                                        <?php else: ?>
                                            <?php foreach ($history_requests as $h): ?>
                                            <tr>
                                                <td>
                                                    <div class="d-flex px-2 py-1">
                                                        <div class="d-flex flex-column justify-content-center">
                                                            <h6 class="mb-0 text-sm"><?= $h['nama'] ?></h6>
                                                            <p class="text-xs text-secondary mb-0"><?= $h['bagian'] ?></p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p class="text-xs font-weight-bold mb-0"><?= $h['tujuan'] ?></p>
                                                    <p class="text-xs text-secondary mb-0"><?= date('d/m/y H:i', strtotime($h['tanggal_jam_berangkat'])) ?></p>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                    <?php if ($h['status'] == 'Ditolak'): ?>
                                                        <span class="badge badge-sm bg-gradient-danger">Ditolak</span>
                                                    <?php else: ?>
                                                        <span class="badge badge-sm bg-gradient-success">Disetujui</span>
                                                    <?php endif; ?>
                                                </td>
                                                <td class="align-middle text-center">
                                                    <span class="text-secondary text-xs font-weight-bold">
                                                        <?= $h['approved_at'] ? date('d/m/y H:i', strtotime($h['approved_at'])) : '-' ?>
                                                    </span>
                                                </td>
                                                <td class="align-middle">
                                                    <a href="<?= base_url('transport/detail/'.$h['id']) ?>" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Lihat detail">
                                                        Detail
                                                    </a>
                                                </td>
                                            </tr>
                                            <?php endforeach; ?>
                                        <?php endif; ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
