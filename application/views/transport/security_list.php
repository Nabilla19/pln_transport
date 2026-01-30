<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-12">
            <div class="card mb-4">
                <div class="card-header pb-0">
                    <h6>Pos Security - Monitoring Kendaraan</h6>
                </div>
                <div class="card-body px-0 pt-0 pb-2">
                    <div class="table-responsive p-0">
                        <table class="table align-items-center mb-0 card-table">
                            <thead>
                                <tr>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Mobil / Driver</th>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Tujuan</th>
                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status Workflow</th>
                                    <th class="text-secondary opacity-7"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($requests as $r): ?>
                                <?php if ($r['status'] == 'In Progress' || $r['status'] == 'Selesai'): ?>
                                <tr>
                                    <td data-label="Mobil / Driver">
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm"><?= $r['mobil'] ?> (<?= $r['plat_nomor'] ?>)</h6>
                                                <p class="text-xs text-secondary mb-0">Driver: <?= $r['pengemudi'] ?></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Tujuan">
                                        <p class="text-xs font-weight-bold mb-0"><?= $r['tujuan'] ?></p>
                                        <p class="text-xs text-secondary mb-0">Pemohon: <?= $r['nama'] ?></p>
                                    </td>
                                    <td data-label="Status" class="align-middle text-center">
                                        <?php if ($r['status'] == 'Selesai'): ?>
                                            <span class="badge badge-sm bg-gradient-success">Selesai</span>
                                        <?php elseif ($r['km_awal'] > 0): ?>
                                            <span class="badge badge-sm bg-gradient-info">Sedang Di Luar</span>
                                        <?php else: ?>
                                            <span class="badge badge-sm bg-gradient-warning">Siap Berangkat</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="align-middle">
                                        <div class="d-flex justify-content-center gap-2">
                                            <a href="<?= base_url('transport/detail/'.$r['id']) ?>" class="btn btn-link text-primary text-xs font-weight-bold mb-0">Detail</a>
                                            <?php if ($r['status'] == 'Selesai'): ?>
                                                <!-- Just Detail -->
                                            <?php elseif (!$r['km_awal']): ?>
                                                <a href="<?= base_url('transport/security_checkin/'.$r['id']) ?>" class="btn btn-xs btn-danger mb-0">Check-In Out</a>
                                            <?php else: ?>
                                                <a href="<?= base_url('transport/security_checkout/'.$r['id']) ?>" class="btn btn-xs btn-primary mb-0">Check-In In</a>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>
                                <?php endif; ?>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
</main>
