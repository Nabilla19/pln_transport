<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-12">
            <div class="card mb-4">
                <div class="card-header pb-0">
                    <h6>Manajemen Fleet / Surat Jalan</h6>
                </div>
                <div class="card-body px-0 pt-0 pb-2">
                    <div class="table-responsive p-0">
                        <table class="table align-items-center mb-0">
                            <thead>
                                <tr>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pemohon</th>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Tujuan</th>
                                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Waktu</th>
                                    <th class="text-secondary opacity-7">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (empty($requests)): ?>
                                    <tr><td colspan="4" class="text-center py-4">Tidak ada antrian surat jalan.</td></tr>
                                <?php endif; ?>
                                <?php foreach ($requests as $r): ?>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm"><?= $r['nama'] ?></h6>
                                                <p class="text-xs text-secondary mb-0"><?= $r['bagian'] ?></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p class="text-xs font-weight-bold mb-0"><?= $r['tujuan'] ?></p>
                                    </td>
                                    <td class="align-middle text-center">
                                        <span class="text-secondary text-xs font-weight-bold"><?= date('d/m/Y H:i', strtotime($r['tanggal_jam_berangkat'])) ?></span>
                                    </td>
                                    <td class="align-middle border-0">
                                        <a href="<?= base_url('transport/detail/'.$r['id']) ?>" class="btn btn-link text-primary text-xs font-weight-bold mb-0">Lihat Detail</a>
                                        <a href="<?= base_url('transport/fleet_process/'.$r['id']) ?>" class="btn btn-xs btn-warning mb-0">Input Fleet</a>
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
