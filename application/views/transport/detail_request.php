<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-lg-10 mx-auto">
            <!-- Progress Stepper -->
            <div class="card shadow-sm border-0 mb-4 overflow-hidden">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between position-relative stepper-container">
                        <div class="step-line"></div>
                        
                        <?php 
                            $steps = [
                                ['label' => 'Diajukan', 'icon' => 'fa-file-signature', 'activeSlots' => ['Pending Asmen', 'Pending Asmen/KKU', 'Pending Fleet', 'In Progress', 'Selesai']],
                                ['label' => 'Disetujui', 'icon' => 'fa-user-check', 'activeSlots' => ['Pending Fleet', 'In Progress', 'Selesai']],
                                ['label' => 'Siap', 'icon' => 'fa-shuttle-van', 'activeSlots' => ['In Progress', 'Selesai']],
                                ['label' => 'Selesai', 'icon' => 'fa-flag-checkered', 'activeSlots' => ['Selesai']]
                            ];
                        ?>

                        <?php foreach($steps as $index => $step): ?>
                            <?php $isActive = in_array($request['status'], $step['activeSlots']); ?>
                            <div class="step-item text-center z-index-2">
                                <div class="step-icon mx-auto rounded-circle <?= $isActive ? 'bg-gradient-primary shadow-primary text-white' : 'bg-gray-200 text-secondary' ?> d-flex align-items-center justify-content-center" style="width: 45px; height: 45px;">
                                    <i class="fas <?= $step['icon'] ?>"></i>
                                </div>
                                <p class="text-xs mt-2 font-weight-bolder <?= $isActive ? 'text-primary' : 'text-secondary' ?> mb-0"><?= $step['label'] ?></p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <div class="card shadow-lg border-0">
                <div class="card-header bg-transparent pb-0">
                    <div class="row align-items-center">
                        <div class="col-8">
                            <h6 class="mb-0 font-weight-bolder">Informasi Detail Permohonan #TR-<?= str_pad($request['id'], 5, '0', STR_PAD_LEFT) ?></h6>
                        </div>
                        <div class="col-4 text-end">
                            <span class="badge badge-lg <?= ($request['status'] == 'Selesai') ? 'bg-gradient-success' : (($request['status'] == 'Ditolak') ? 'bg-gradient-danger' : 'bg-gradient-primary') ?> shadow-sm">
                                <?= $request['status'] ?>
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-7 mb-4">
                            <h6 class="text-uppercase text-primary text-xxs font-weight-bolder opacity-7 mb-3">Detail Perjalanan</h6>
                            <div class="bg-gray-100 p-3 border-radius-lg">
                                <div class="row mb-2">
                                    <div class="col-5 col-sm-4 text-xs font-weight-bold text-secondary text-uppercase">Tujuan</div>
                                    <div class="col-7 col-sm-8 text-sm font-weight-bolder"><?= $request['tujuan'] ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 col-sm-4 text-xs font-weight-bold text-secondary text-uppercase">Keperluan</div>
                                    <div class="col-7 col-sm-8 text-sm"><?= $request['keperluan'] ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 col-sm-4 text-xs font-weight-bold text-secondary text-uppercase">Waktu</div>
                                    <div class="col-7 col-sm-8 text-sm font-weight-bold text-primary"><?= date('l, d M Y - H:i', strtotime($request['tanggal_jam_berangkat'])) ?></div>
                                </div>
                                <div class="row mb-2">
                                    <div class="col-5 col-sm-4 text-xs font-weight-bold text-secondary text-uppercase">Pemohon</div>
                                    <div class="col-7 col-sm-8 text-sm"><?= $request['nama'] ?> (<?= $request['bagian'] ?>)</div>
                                </div>
                                <div class="row">
                                    <div class="col-5 col-sm-4 text-xs font-weight-bold text-secondary text-uppercase">Jumlah Penumpang</div>
                                    <div class="col-7 col-sm-8 text-sm font-weight-bolder text-dark"><span class="badge bg-light text-dark border me-1"><?= $request['jumlah_penumpang'] ?: '1' ?></span> Orang</div>
                                </div>
                            </div>

                            <?php if ($fleet): ?>
                            <h6 class="text-uppercase text-warning text-xxs font-weight-bolder opacity-7 mt-4 mb-3">Data Kendaraan & Driver</h6>
                            <div class="p-3 border-radius-lg border border-warning">
                                <div class="row align-items-center">
                                    <div class="col-auto">
                                        <div class="icon icon-shape bg-gradient-warning shadow-warning text-center rounded-circle">
                                            <i class="fas fa-truck text-white opacity-10"></i>
                                        </div>
                                    </div>
                                    <div class="col ms-2">
                                        <h6 class="text-sm font-weight-bolder mb-0"><?= $fleet['mobil'] ?> (<?= $fleet['plat_nomor'] ?>)</h6>
                                        <p class="text-xs text-secondary mb-0">Brand: <strong><?= $request['vehicle_brand'] ?: '-' ?></strong> | Driver: <strong><?= $fleet['pengemudi'] ?></strong></p>
                                    </div>
                                </div>
                            </div>
                            <?php endif; ?>
                        </div>

                        <div class="col-md-5 border-start-md">
                            <h6 class="text-uppercase text-primary text-xxs font-weight-bolder opacity-7 mb-3">Workflow Digital Signature / QR Code</h6>
                            
                            <div class="barcode-item p-2 mb-3 bg-white border border-radius-md d-flex align-items-center">
                                <div class="icon-box bg-gray-100 p-2 border-radius-sm me-3 text-center" style="min-width: 65px;">
                                    <div id="qr_pemohon" class="qr-preview"></div>
                                </div>
                                <div>
                                    <p class="text-xxs font-weight-bold text-secondary text-uppercase mb-0">Diajukan Oleh (Pemohon)</p>
                                    <span class="text-dark font-weight-bolder text-xs"><?= $request['nama'] ?></span><br>
                                    <small class="text-xs text-muted"><?= date('d/m/Y H:i', strtotime($request['created_at'])) ?></small>
                                </div>
                            </div>

                            <?php if (isset($request['approved_at']) && $request['approved_at']): ?>
                            <div class="barcode-item p-2 mb-3 bg-white border border-radius-md d-flex align-items-center border-success">
                                <div class="icon-box bg-success-light p-2 border-radius-sm me-3 text-center" style="min-width: 65px;">
                                    <div id="qr_asmen" class="qr-preview"></div>
                                </div>
                                <div>
                                    <p class="text-xxs font-weight-bold text-success text-uppercase mb-0">Disetujui Oleh (Asmen/KKU)</p>
                                    <span class="text-success font-weight-bolder text-xs">
                                        <?php 
                                            $asmenDisp = $request['asmen_name'] ?: 'SYSTEM';
                                            $asmenRole = $request['asmen_role'] ?: 'Asmen';
                                            if (strpos(strtolower($asmenDisp), strtolower($asmenRole)) === false) {
                                                echo $asmenDisp . ' (' . $asmenRole . ')';
                                            } else {
                                                echo $asmenDisp;
                                            }
                                        ?>
                                    </span><br>
                                    <small class="text-xs text-muted">
                                        <?php 
                                            if ($request['approved_at']) {
                                                echo date('d/m/Y H:i', strtotime($request['approved_at']));
                                            } else {
                                                echo date('d/m/Y H:i', strtotime($request['created_at'])) . ' (Koreksi)';
                                            }
                                        ?>
                                    </small>
                                </div>
                            </div>
                            <?php endif; ?>

                            <?php if (isset($request['fleet_assigned_at']) && $request['fleet_assigned_at']): ?>
                            <div class="barcode-item p-2 mb-3 bg-white border border-radius-md d-flex align-items-center border-warning">
                                <div class="icon-box bg-warning-light p-2 border-radius-sm me-3 text-center" style="min-width: 65px;">
                                    <div id="qr_fleet" class="qr-preview"></div>
                                </div>
                                <div>
                                    <p class="text-xxs font-weight-bold text-warning text-uppercase mb-0">Divalidasi Oleh (Fleet Manager)</p>
                                    <span class="text-warning font-weight-bolder text-xs">
                                        <?php 
                                            $fName = $request['fleet_user_name'] ?: 'VALIDASI FLEET';
                                            $fRole = $request['fleet_role'] ?: 'Fleet';
                                            if ($request['fleet_user_name'] && strpos(strtolower($fName), strtolower($fRole)) === false) {
                                                echo $fName . ' (' . $fRole . ')';
                                            } else {
                                                echo $fName;
                                            }
                                        ?>
                                    </span><br>
                                    <small class="text-xs text-muted"><?= date('d/m/Y H:i', strtotime($request['fleet_assigned_at'])) ?></small>
                                </div>
                            </div>
                            <?php endif; ?>

                            <?php if ($security): ?>
                            <div class="bg-gray-100 p-3 border-radius-md mt-3">
                                <h6 class="text-xxs font-weight-bolder text-uppercase mb-2 text-dark">Security Log Monitoring</h6>
                                <p class="text-sm mb-1 d-flex justify-content-between">
                                    <span><i class="fas fa-gas-pump me-1"></i> KM Awal:</span>
                                    <span class="font-weight-bolder"><?= number_format($security['km_awal']) ?></span>
                                </p>
                                <p class="text-sm mb-0 d-flex justify-content-between">
                                    <span><i class="fas fa-flag me-1"></i> KM Akhir:</span>
                                    <span class="font-weight-bolder"><?= $security['km_akhir'] ? number_format($security['km_akhir']) : '---' ?></span>
                                </p>
                                <?php if($security['jarak_tempuh'] || $security['lama_waktu']): ?>
                                <hr class="horizontal dark my-2">
                                <div class="d-flex justify-content-between">
                                    <span class="text-xs text-secondary">Total Jarak:</span>
                                    <span class="text-sm font-weight-bolder text-primary"><?= $security['jarak_tempuh'] ?: '-' ?></span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span class="text-xs text-secondary">Durasi Pakai:</span>
                                    <span class="text-sm font-weight-bolder text-primary"><?= $security['lama_waktu'] ?: '-' ?></span>
                                </div>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-5 gap-3">
                        <div class="d-flex align-items-center w-100 w-md-auto justify-content-center justify-content-md-start">
                            <a href="<?= base_url('transport/semua_daftar') ?>" class="btn btn-outline-secondary btn-sm mb-0">
                                <i class="fas fa-chevron-left me-1"></i> Kembali
                            </a>
                            <?php if (in_array($request['status'], ['In Progress', 'Selesai'])): ?>
                                <a href="<?= base_url('transport/export_pdf/'.$request['id']) ?>" target="_blank" class="btn btn-outline-danger btn-sm mb-0 ms-2">
                                    <i class="fas fa-file-pdf me-1"></i> Cetak PDF
                                </a>
                            <?php endif; ?>
                        </div>
                        
                        <div class="actions w-100 w-md-auto">
                            <?php 
                                $r_name = strtolower($this->session->userdata('user_role') ?: $this->session->userdata('role') ?: '');
                                $can_approve = in_array($this->session->userdata('role_id'), [15,16,17,18]) || ($r_name === 'kku');
                                if ($request['status'] == 'Pending Asmen/KKU' && $can_approve): 
                            ?>
                                <div class="d-flex gap-2 w-100">
                                    <a href="<?= base_url('transport/approval/edit/'.$request['id']) ?>" class="btn btn-outline-info btn-sm mb-0 flex-grow-1">
                                        <i class="fas fa-edit me-1"></i> Edit
                                    </a>
                                    <button type="button" class="btn bg-gradient-success btn-sm mb-0 px-4 flex-grow-1" data-bs-toggle="modal" data-bs-target="#approvalModal">
                                        <i class="fas fa-tasks me-1"></i> Review
                                    </button>
                                </div>
                            <?php endif; ?>

                            <?php 
                                $r_name = strtolower($this->session->userdata('user_role') ?: $this->session->userdata('role') ?: '');
                                if ($request['status'] == 'Pending Fleet' && ($r_name === 'kku')): 
                            ?>
                                <div class="d-flex gap-2 w-100">
                                    <a href="<?= base_url('transport/approval/edit/'.$request['id']) ?>" class="btn btn-outline-info btn-sm mb-0 flex-grow-1">
                                        <i class="fas fa-edit me-1"></i> Edit
                                    </a>
                                    <a href="<?= base_url('transport/fleet_process/'.$request['id']) ?>" class="btn bg-gradient-warning btn-sm mb-0 px-4 flex-grow-1">
                                        <i class="fas fa-car-side me-1"></i> Penugasan
                                    </a>
                                </div>
                            <?php endif; ?>

                            <?php if ($request['status'] == 'In Progress' && in_array($this->session->userdata('role_id'), [19])): ?>
                                <?php if (!$security): ?>
                                    <a href="<?= base_url('transport/security_checkin/'.$request['id']) ?>" class="btn bg-gradient-danger btn-sm mb-0 px-4 w-100">
                                        <i class="fas fa-door-open me-1"></i> KM Berangkat (Pos)
                                    </a>
                                <?php elseif (!$security['km_akhir']): ?>
                                    <a href="<?= base_url('transport/security_checkout/'.$request['id']) ?>" class="btn bg-gradient-primary btn-sm mb-0 px-4 w-100">
                                        <i class="fas fa-door-closed me-1"></i> KM Kembali (Pos)
                                    </a>
                                <?php endif; ?>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function() {
    // QR Pemohon
    const textPemohon = "SURAT INI TELAH DIAJUKAN OLEH <?= addslashes($request['nama']) ?> PADA <?= date('d/m/Y H:i', strtotime($request['created_at'])) ?>";
    new QRCode(document.getElementById("qr_pemohon"), { text: textPemohon, width: 45, height: 45 });

    // QR Asmen
    <?php if (isset($request['barcode_asmen']) && $request['barcode_asmen']): ?>
        const textAsmen = "SURAT INI TELAH DI APPROVE OLEH <?= addslashes($request['asmen_name'] ?: 'SYSTEM') ?> PADA <?= date('d/m/Y H:i', strtotime($request['approved_at'] ?: $request['created_at'])) ?>";
        new QRCode(document.getElementById("qr_asmen"), { text: textAsmen, width: 45, height: 45 });
    <?php endif; ?>

    // QR Fleet
    <?php if (isset($request['barcode_fleet']) && $request['barcode_fleet']): ?>
        const textFleet = "SURAT INI TELAH DIVALIDASI OLEH <?= addslashes($request['fleet_user_name'] ?: 'FLEET') ?> PADA <?= date('d/m/Y H:i', strtotime($request['fleet_assigned_at'] ?: $request['created_at'])) ?>";
        new QRCode(document.getElementById("qr_fleet"), { text: textFleet, width: 45, height: 45 });
    <?php endif; ?>
});
</script>

<style>
.stepper-container { padding: 10px 0; }
.step-line {
    position: absolute;
    top: 32px;
    left: 10%;
    right: 10%;
    height: 3px;
    background-color: #e9ecef;
    z-index: 1;
}
.step-icon { transition: all 0.3s ease; }
.step-item:hover .step-icon { transform: translateY(-3px); }
.barcode-item { transition: box-shadow 0.3s ease; border: 1px dashed #dee2e6; }
.barcode-item:hover { box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.icon-box i { line-height: 40px; }
.qr-preview { border: 1px solid #eee; padding: 2px; background: white; display: inline-block; }
.bg-success-light { background-color: rgba(45, 206, 137, 0.1); }
.bg-warning-light { background-color: rgba(251, 191, 36, 0.1); }
</style>

<!-- Modal Approval Asmen -->
<div class="modal fade" id="approvalModal" tabindex="-1" role="dialog" aria-labelledby="approvalModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content border-0 shadow">
      <div class="modal-header bg-gradient-success">
        <h5 class="modal-title text-white" id="approvalModalLabel"><i class="fas fa-shield-check me-2"></i> Review Persetujuan Asmen / KKU</h5>
        <button type="button" class="btn-close text-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form action="<?= base_url('transport/approve/'.$request['id']) ?>" method="post">
        <div class="modal-body p-4">
            <h6 class="text-sm mb-3">Tujuan: <?= $request['tujuan'] ?></h6>
            <div class="form-group mb-0">
                <label class="form-control-label">Catatan Persetujuan (Asmen/KKU)</label>
                <textarea class="form-control" name="catatan" rows="3" placeholder="Sampaikan pesan jika ada..."></textarea>
            </div>
        </div>
        <div class="modal-footer border-0">
            <button type="button" class="btn btn-link text-secondary mb-0" data-bs-dismiss="modal">Batal</button>
            <button type="submit" class="btn bg-gradient-success mb-0 px-4">Setujui & Teruskan</button>
        </div>
      </form>
    </div>
  </div>
</div>
</main>
