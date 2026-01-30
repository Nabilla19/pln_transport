<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Riwayat Peminjaman Kendaraan - PLN UP2D RIAU</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <style>
        body { font-family: 'Arial', sans-serif; font-size: 11px; color: #333; line-height: 1.4; padding: 20px; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 3px double #000; padding-bottom: 15px; position: relative; }
        .header h2 { margin: 0; text-transform: uppercase; color: #0056b3; font-size: 18px; letter-spacing: 1px; }
        .header p { margin: 5px 0 0; font-size: 13px; font-weight: bold; color: #444; }
        
        .qr-main { position: absolute; right: 0; top: 0; text-align: center; }
        .qr-main div { margin: 0 auto; }
        .qr-main small { display: block; font-size: 7px; margin-top: 3px; color: #777; }

        /* Form Style for Single Request */
        .form-section { border: 1px solid #333; margin-bottom: 18px; border-radius: 4px; overflow: hidden; }
        .form-title { background: #333; color: #fff; padding: 6px 12px; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        .form-content { padding: 12px; }
        .form-grid { display: flex; flex-wrap: wrap; }
        .grid-item { width: 50%; margin-bottom: 10px; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px; }
        .label { font-weight: bold; width: 130px; display: inline-block; color: #666; font-size: 10px; text-transform: uppercase; }
        .value { color: #000; font-weight: 500; }
        
        /* Digital Signature Blocks */
        .signature-row { display: flex; justify-content: space-between; margin-top: 30px; }
        .sig-block { width: 30%; text-align: center; background: #fafafa; border: 1px solid #eee; padding: 15px 10px; border-radius: 8px; }
        .sig-label { font-size: 9px; font-weight: bold; margin-bottom: 10px; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .qr-sig { margin: 10px auto; width: 70px; height: 70px; background: #fff; padding: 5px; border: 1px solid #eee; }
        .sig-name { font-weight: bold; font-size: 10px; margin-top: 8px; color: #333; }
        .sig-val { font-size: 7px; color: #888; font-family: monospace; }
        
        /* Table Style for Multiple */
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #999; padding: 6px 4px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; text-transform: uppercase; font-size: 10px; }
        
        .status-badge { padding: 2px 5px; border-radius: 3px; font-weight: bold; font-size: 9px; }
        .status-selesai { color: #2dce89; border: 1px solid #2dce89; }
        
        .signature-area { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
        .sig-box { width: 30%; }
        .sig-space { height: 60px; }
        
        @media print {
            .no-print { display: none; }
            @page { size: A4 portrait; margin: 1cm; }
            body { padding: 0; }
        }

        /* Red C Watermark */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 500px;
            color: rgba(255, 0, 0, 0.05); /* Slightly fainter for better readability */
            z-index: -1000;
            font-weight: bold;
            pointer-events: none;
            user-select: none;
        }
    </style>
</head>
<body>
    <div class="watermark">C</div>
    <script>const isSingle = <?= count($requests) == 1 ? 'true' : 'false' ?>;</script>
    
    <div class="no-print" style="background: #fff3cd; padding: 10px; margin-bottom: 20px; border: 1px solid #ffeeba; text-align: center; font-size: 12px;">
        <strong>Mode Cetak:</strong> <?= count($requests) == 1 ? 'Formulir Tunggal' : 'Laporan Riwayat' ?>. 
        Pilih <strong>"Save as PDF"</strong> pada tujuan printer.
        <button onclick="window.print()" style="padding: 5px 15px; cursor: pointer; background: #5e72e4; color: white; border: none; border-radius: 4px; margin-left: 10px;">CETAK / SIMPAN PDF</button>
        <button onclick="if(document.referrer) { window.location.href = document.referrer; } else { window.location.href='<?= base_url('transport/daftar_saya') ?>'; }" style="padding: 5px 15px; cursor: pointer; background: #8898aa; color: white; border: none; border-radius: 4px; margin-left: 5px;">KEMBALI</button>
    </div>

    <div class="header">
        <img src="<?= base_url('assets/assets/img/logo_pln.png') ?>" alt="PLN Logo" style="height: 60px; position: absolute; left: 0; top: 0;">
        <h2>PT PLN (PERSERO) UP2D RIAU</h2>
        <p>FORMULIR PEMINJAMAN KENDARAAN OPERASIONAL</p>
        <div class="qr-main" style="display:block">
            <div id="qr-request"></div>
            <small><?= count($requests) == 1 ? 'DOC-ID: #'.$requests[0]['id'] : 'REKAP-DATA-TRANSPORT' ?></small>
        </div>
    </div>

    <?php if (count($requests) == 1): $r = $requests[0]; ?>
        <!-- SINGLE REQUEST FORM LAYOUT -->
        <div class="form-section">
            <div class="form-title">I. DATA PEMOHON & KEGIATAN</div>
            <div class="form-content">
                <div class="form-grid">
                    <div class="grid-item"><span class="label">Nama Pemohon:</span> <span class="value"><?= $r['nama'] ?></span></div>
                    <div class="grid-item"><span class="label">Jabatan:</span> <span class="value"><?= $r['jabatan'] ?></span></div>
                    <div class="grid-item"><span class="label">Bagian / Bidang:</span> <span class="value"><?= $r['bagian'] ?></span></div>
                    <div class="grid-item"><span class="label">Macam Kendaraan:</span> <span class="value"><?= $r['macam_kendaraan'] ?></span></div>
                    <div class="grid-item"><span class="label">Jml Penumpang:</span> <span class="value"><?= $r['jumlah_penumpang'] ?> Orang</span></div>
                    <div class="grid-item"><span class="label">Waktu Berangkat:</span> <span class="value"><?= date('d/m/Y H:i', strtotime($r['tanggal_jam_berangkat'])) ?></span></div>
                    <div class="grid-item"><span class="label">Estimasi Durasi:</span> <span class="value"><?= $r['lama_pakai'] ?: '-' ?></span></div>
                    <div class="grid-item"><span class="label">Status Tiket:</span> <span class="value" style="color:#2dce89"><?= strtoupper($r['status']) ?></span></div>
                    <div class="grid-item" style="width:100%"><span class="label">Lokasi Tujuan:</span> <span class="value"><?= $r['tujuan'] ?></span></div>
                    <div class="grid-item" style="width:100%"><span class="label">Deskripsi Keperluan:</span> <span class="value"><?= $r['keperluan'] ?></span></div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin: 20px 0 10px 0; font-weight: bold; font-size: 14px; text-decoration: underline; text-transform: uppercase; letter-spacing: 2px;">
            SURAT JALAN
        </div>

        <div class="form-section">
            <div class="form-title">II. PERSETUJUAN ASMEN / KKU & SURAT JALAN FLEET</div>
            <div class="form-content">
                <div class="form-grid">
                    <div class="grid-item"><span class="label">Disetujui tgl:</span> <span class="value"><?= $r['approved_at'] ? date('d/m/Y H:i', strtotime($r['approved_at'])) : '-' ?></span></div>
                    <div class="grid-item"><span class="label">Catatan Asmen / KKU:</span> <span class="value"><?= $r['catatan_asmen'] ?: '-' ?></span></div>
                    <div class="grid-item" style="width: 100%; border-top: 1px dashed #eee; margin: 5px 0; padding-top: 5px;"></div>
                    <div class="grid-item"><span class="label">Nama Mobil:</span> <span class="value"><?= $r['mobil'] ?: 'Menunggu' ?></span></div>
                    <div class="grid-item"><span class="label">Brand Mobil:</span> <span class="value"><?= $r['vehicle_brand'] ?: '-' ?></span></div>
                    <div class="grid-item"><span class="label">Plat Nomor:</span> <span class="value"><?= $r['plat_nomor'] ?: '-' ?></span></div>
                    <div class="grid-item"><span class="label">Nama Pengemudi:</span> <span class="value"><?= $r['pengemudi'] ?: '-' ?></span></div>
                </div>
            </div>
        </div>

        <div class="form-section">
            <div class="form-title">III. REALISASI PERJALANAN (LOG SECURITY)</div>
            <div class="form-content" style="padding-bottom:5px">
                <div class="form-grid">
                    <div class="grid-item"><span class="label">KM Awal:</span> <span class="value"><?= $r['km_awal'] ? number_format($r['km_awal']) : '-' ?></span></div>
                    <div class="grid-item"><span class="label">KM Akhir:</span> <span class="value"><?= $r['km_akhir'] ? number_format($r['km_akhir']) : '-' ?></span></div>
                    <div class="grid-item"><span class="label">Jam Berangkat:</span> <span class="value"><?= $r['log_jam_berangkat'] ?: '-' ?></span></div>
                    <div class="grid-item"><span class="label">Jam Kembali:</span> <span class="value"><?= $r['log_jam_kembali'] ?: '-' ?></span></div>
                    <div class="grid-item"><span class="label">Jarak Tempuh:</span> <span class="value"><?= $r['jarak_tempuh'] ?: '-' ?> (Otomatis)</span></div>
                    <div class="grid-item"><span class="label">Lama Waktu:</span> <span class="value"><?= $r['lama_waktu'] ?: '-' ?> (Otomatis)</span></div>
                </div>
            </div>
        </div>

        <!-- DIGITAL VALIDATION SIGNATURES (Moved before Photos) -->
        <div class="signature-row" style="margin-bottom: 25px; page-break-inside: avoid;">
            <div class="sig-block">
                <div class="sig-label">TANDA TANGAN DIGITAL PEMOHON</div>
                <div id="sig-pemohon" class="qr-sig">
                    <?php if (!$r['barcode_pemohon']): ?><small style="font-size:8px;color:red">Data Terenkripsi Kosong</small><?php endif; ?>
                </div>
                <div class="sig-name">
                    <?php 
                        $pemohonName = $r['nama'];
                        $pemohonJob = $r['jabatan'];
                        if (strpos(strtolower($pemohonName), strtolower($pemohonJob)) === false) {
                            echo $pemohonName . ' (' . $pemohonJob . ')';
                        } else {
                            echo $pemohonName;
                        }
                    ?>
                </div>
                <div class="sig-val"><?= date('d/m/Y H:i', strtotime($r['created_at'])) ?></div>
            </div>
            <div class="sig-block">
                <div class="sig-label">TANDA TANGAN DIGITAL ASMEN / KKU</div>
                <div id="sig-asmen" class="qr-sig">
                    <?php if (!$r['barcode_asmen']): ?><small style="font-size:8px;color:#999">Menunggu Approval</small><?php endif; ?>
                </div>
                <div class="sig-name">
                    <?php 
                        $asmenDisp = $r['asmen_name'] ?: 'PENDING';
                        $asmenRole = $r['asmen_role'] ?: 'Asmen/KKU';
                        // Prevent double title if role exists in name
                        if ($r['is_approved'] && strpos(strtolower($asmenDisp), strtolower($asmenRole)) === false) {
                            echo $asmenDisp . ' (' . $asmenRole . ')';
                        } else {
                            echo $asmenDisp;
                        }
                    ?>
                </div>
                <div class="sig-val">
                    <?php 
                        if ($r['approved_at']) {
                            echo date('d/m/Y H:i', strtotime($r['approved_at']));
                        } elseif ($r['is_approved']) {
                            // Legacy fallback for records before bugfix
                            echo date('d/m/Y H:i', strtotime($r['created_at']));
                        } else {
                            echo '-';
                        }
                    ?>
                </div>
            </div>
            <div class="sig-block">
                <div class="sig-label">TANDA TANGAN DIGITAL KEUANGAN (KKU)</div>
                <div id="sig-security" class="qr-sig">
                    <?php if (!$r['barcode_fleet']): ?><small style="font-size:8px;color:#999">Menunggu Validasi Fleet</small><?php endif; ?>
                </div>
                <div class="sig-name">
                    <?php 
                        $fleetName = $r['fleet_user_name'] ?: 'VALIDASI FLEET';
                        $fleetRole = $r['fleet_role'] ?: 'Petugas Fleet';
                        if ($r['fleet_user_name'] && strpos(strtolower($fleetName), strtolower($fleetRole)) === false) {
                            echo $fleetName . ' (' . $fleetRole . ')';
                        } else {
                            echo $fleetName;
                        }
                    ?>
                </div>
                <div class="sig-val"><?= $r['fleet_assigned_at'] ? date('d/m/Y H:i', strtotime($r['fleet_assigned_at'])) : '-' ?></div>
            </div>
        </div>

        <!-- NEW SECTION: EVIDENCE PHOTOS (Integrated after Signatures) -->
        <div class="form-section" style="page-break-inside: avoid;">
            <div class="form-title">IV. DOKUMENTASI & BUKTI FOTO (SECURITY)</div>
            <div class="form-content">
                <div style="display:flex; justify-content: space-between; gap:10px; flex-wrap: wrap;">
                    <!-- Check-In Photos -->
                    <div style="width:23%; text-align:center; border: 1px solid #eee; padding:5px; border-radius:4px">
                        <small style="display:block; font-weight:bold; margin-bottom:5px; font-size:8px">DRIVER + MOBIL (BERANGKAT)</small>
                        <?php if(!empty($r['foto_driver_berangkat'])): ?>
                            <img src="<?= base_url('uploads/transport/'.$r['foto_driver_berangkat']) ?>" style="width:100%; border-radius:2px">
                        <?php else: ?>
                            <div style="height:50px; background:#f9f9f9; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:8px">TIDAK ADA FOTO</div>
                        <?php endif; ?>
                    </div>
                    <div style="width:23%; text-align:center; border: 1px solid #eee; padding:5px; border-radius:4px">
                        <small style="display:block; font-weight:bold; margin-bottom:5px; font-size:8px">KM AWAL (BERANGKAT)</small>
                        <?php if(!empty($r['foto_km_berangkat'])): ?>
                            <img src="<?= base_url('uploads/transport/'.$r['foto_km_berangkat']) ?>" style="width:100%; border-radius:2px">
                        <?php else: ?>
                            <div style="height:50px; background:#f9f9f9; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:8px">TIDAK ADA FOTO</div>
                        <?php endif; ?>
                    </div>
                    <!-- Check-Out Photos -->
                    <div style="width:23%; text-align:center; border: 1px solid #eee; padding:5px; border-radius:4px">
                        <small style="display:block; font-weight:bold; margin-bottom:5px; font-size:8px">DRIVER + MOBIL (KEMBALI)</small>
                        <?php if(!empty($r['foto_driver_kembali'])): ?>
                            <img src="<?= base_url('uploads/transport/'.$r['foto_driver_kembali']) ?>" style="width:100%; border-radius:2px">
                        <?php else: ?>
                            <div style="height:50px; background:#f9f9f9; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:8px">TIDAK ADA FOTO</div>
                        <?php endif; ?>
                    </div>
                    <div style="width:23%; text-align:center; border: 1px solid #eee; padding:5px; border-radius:4px">
                        <small style="display:block; font-weight:bold; margin-bottom:5px; font-size:8px">KM AKHIR (KEMBALI)</small>
                        <?php if(!empty($r['foto_km_kembali'])): ?>
                            <img src="<?= base_url('uploads/transport/'.$r['foto_km_kembali']) ?>" style="width:100%; border-radius:2px">
                        <?php else: ?>
                            <div style="height:50px; background:#f9f9f9; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:8px">TIDAK ADA FOTO</div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>


        <script>
            document.addEventListener("DOMContentLoaded", function() {
                if (typeof QRCode === "undefined") {
                    console.error("QRCode library not loaded!");
                    return;
                }

                // 1. Single Request Mode
                const qrRequestElem = document.getElementById("qr-request");
                if (qrRequestElem) {
                    try {
                        const mainBC = "<?= $r['barcode_pemohon'] ?>";
                        if (mainBC) {
                            new QRCode(qrRequestElem, { 
                                text: "VALIDASI-DOC-ID-<?= $r['id'] ?>-FINGERPRINT-" + mainBC, 
                                width: 45, height: 45 
                            });
                        }

                        const sigPemohonElem = document.getElementById("sig-pemohon");
                        if (sigPemohonElem && mainBC) {
                            new QRCode(sigPemohonElem, { 
                                text: "SURAT INI TELAH DIAJUKAN OLEH <?= addslashes($r['nama']) ?> PADA <?= date('d/m/Y H:i', strtotime($r['created_at'])) ?>", 
                                width: 70, height: 70 
                            });
                        }

                        const sigAsmenElem = document.getElementById("sig-asmen");
                        const asmenBC = "<?= $r['barcode_asmen'] ?>";
                        if (sigAsmenElem && asmenBC) {
                            new QRCode(sigAsmenElem, { 
                                text: "SURAT INI TELAH DI APPROVE OLEH <?= addslashes($r['asmen_name']) ?> PADA <?= date('d/m/Y H:i', strtotime($r['approved_at'] ?: $r['created_at'])) ?>", 
                                width: 70, height: 70 
                            });
                        }

                        const sigFleetElem = document.getElementById("sig-security");
                        const fleetBC = "<?= $r['barcode_fleet'] ?>";
                        if (sigFleetElem && fleetBC) {
                            new QRCode(sigFleetElem, { 
                                text: "SURAT INI TELAH DIVALIDASI OLEH <?= addslashes($r['fleet_user_name'] ?: 'Fleet Officer') ?> PADA <?= date('d/m/Y H:i', strtotime($r['fleet_assigned_at'] ?: $r['created_at'])) ?>", 
                                width: 70, height: 70 
                            });
                        }
                    } catch (e) {
                        console.error("Error generating single QR codes:", e);
                    }
                }

                // 2. Handle Multiple (Printing triggered after data is ready)
                if (!isSingle) {
                    setTimeout(function() { window.print(); }, 800);
                }
            });
        </script>

    <?php else: ?>
        <!-- MULTIPLE REQUEST TABLE LAYOUT -->
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Pemohon</th>
                    <th>Keperluan & Tujuan</th>
                    <th>Penumpang</th>
                    <th>Kendaraan</th>
                    <th>Waktu Berangkat</th>
                    <th>Log KM (Awal/Akhir)</th>
                    <th>Jarak/Waktu</th>
                    <th>Status</th>
                    <th>TTD Digital</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach($requests as $i => $r): ?>
                <tr>
                    <td style="text-align:center"><?= $i+1 ?></td>
                    <td><strong><?= $r['nama'] ?></strong><br><small><?= $r['bagian'] ?></small></td>
                    <td><strong><?= $r['tujuan'] ?></strong><br><small><?= $r['keperluan'] ?></small></td>
                    <td style="text-align:center"><?= $r['jumlah_penumpang'] ?></td>
                    <td><?= $r['mobil'] ? $r['mobil'].' ('.$r['plat_nomor'].')' : $r['macam_kendaraan'] ?></td>
                    <td><?= date('d/m/Y H:i', strtotime($r['tanggal_jam_berangkat'])) ?></td>
                    <td><?= $r['km_awal'] ? number_format($r['km_awal']) : '-' ?> / <?= $r['km_akhir'] ? number_format($r['km_akhir']) : '-' ?></td>
                    <td><?= $r['jarak_tempuh'] ?: '-' ?><br><?= $r['lama_waktu'] ?: '-' ?></td>
                    <td style="text-align:center"><?= $r['status'] ?></td>
                    <td style="text-align:center; vertical-align:middle">
                        <div id="qr_row_<?= $r['id'] ?>" style="display:inline-block; border:1px solid #eee; padding:2px"></div>
                        <script>
                            document.addEventListener("DOMContentLoaded", function() {
                                new QRCode(document.getElementById("qr_row_<?= $r['id'] ?>"), { 
                                    text: "SURAT INI TELAH DIAJUKAN OLEH <?= addslashes($r['nama']) ?> (STATUS: <?= $r['status'] ?>) PADA <?= date('d/m/Y H:i', strtotime($r['created_at'])) ?>", 
                                    width: 35, height: 35 
                                });
                            });
                        </script>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>

    <div style="position: fixed; bottom: 10px; left: 20px; font-size: 8px; color: #999;">
        Dicetak otomatis oleh Sistem E-Transport PLN UP2D RIAU pada <?= date('d/m/Y H:i:s') ?>
    </div>
</body>
</html>
