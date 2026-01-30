<main class="main-content position-relative border-radius-lg ">
    <?php $this->load->view('layout/navbar'); ?>

    <div class="container-fluid py-4">

        <!-- Login counter & Role Badge -->
        <div class="row mb-3">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card login-count-card">
                    <div class="card-body p-4 text-center">
                        <div class="bg-gradient-primary shadow-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 80px; height: 80px;">
                            <i class="ni ni-single-02 text-white" style="font-size: 36px;"></i>
                        </div>
                        
                        <?php if (isset($user_role) && $user_role):
                            $badge_color = 'bg-gradient-secondary';
                            $role_lower = strtolower($user_role);
                            if (strpos($role_lower, 'admin') !== false) $badge_color = 'bg-gradient-danger';
                            elseif (strpos($role_lower, 'perencanaan') !== false) $badge_color = 'bg-gradient-primary';
                            elseif (strpos($role_lower, 'operasi') !== false) $badge_color = 'bg-gradient-success';
                            elseif (strpos($role_lower, 'pemeliharaan') !== false) $badge_color = 'bg-gradient-warning';
                            elseif (strpos($role_lower, 'fasilitas') !== false) $badge_color = 'bg-gradient-info';
                        ?>
                            <div class="mb-3">
                                <span class="badge <?php echo $badge_color; ?> px-3 py-2" style="font-size: 0.8rem;">
                                    <i class="fas fa-user-shield me-1"></i>
                                    <?php echo strtoupper(htmlspecialchars($user_role)); ?>
                                </span>
                            </div>
                        <?php endif; ?>

                        <p class="text-sm text-uppercase text-secondary font-weight-bold mb-1 opacity-7">Login Count</p>
                        <h4 class="font-weight-bolder mb-3" style="font-size: 2.5rem; color: #344767;">
                            <?php echo isset($login_count) ? intval($login_count) : '—'; ?>
                        </h4>
                        
                        <div class="d-flex justify-content-center align-items-center">
                            <div class="d-flex flex-column">
                                <span class="text-xs text-secondary mb-1">
                                    <i class="far fa-clock me-1 text-info"></i> Last login:
                                </span>
                                <span class="text-sm font-weight-bold">
                                    <?php echo isset($last_login) && $last_login ? $last_login : '—'; ?>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== KPI GRID: Transport Specific ===== -->
        <div class="row kpi-grid-row">

            <!-- TOTAL REQUESTS -->
            <div class="col-xl-3 col-lg-6 col-md-6 mb-4">
                <div class="card kpi-ideal">
                    <div class="card-body kpi-body">
                        <div class="kpi-head">
                            <div>
                                <div class="kpi-title">TOTAL REQUEST</div>
                                <div class="kpi-sub">seluruh pengajuan</div>
                            </div>
                            <div class="kpi-ic bg-gradient-primary">
                                <i class="fas fa-file-alt"></i>
                            </div>
                        </div>
                        <div class="kpi-big">
                            <?= number_format($total_requests ?? 0, 0, ',', '.'); ?>
                        </div>
                        <div class="kpi-footnote">pengajuan kendaraan</div>
                    </div>
                </div>
            </div>

            <!-- PENDING REQUESTS -->
            <div class="col-xl-3 col-lg-6 col-md-6 mb-4">
                <div class="card kpi-ideal">
                    <div class="card-body kpi-body">
                        <div class="kpi-head">
                            <div>
                                <div class="kpi-title">PENDING</div>
                                <div class="kpi-sub">menunggu approval</div>
                            </div>
                            <div class="kpi-ic bg-gradient-warning">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                        <div class="kpi-big">
                            <?= number_format($pending_requests ?? 0, 0, ',', '.'); ?>
                        </div>
                        <div class="kpi-footnote">butuh tindakan segera</div>
                    </div>
                </div>
            </div>

            <!-- TOTAL VEHICLES -->
            <div class="col-xl-3 col-lg-6 col-md-6 mb-4">
                <div class="card kpi-ideal">
                    <div class="card-body kpi-body">
                        <div class="kpi-head">
                            <div>
                                <div class="kpi-title">ARMADA</div>
                                <div class="kpi-sub">total kendaraan</div>
                            </div>
                            <div class="kpi-ic bg-gradient-info">
                                <i class="fas fa-car"></i>
                            </div>
                        </div>
                        <div class="kpi-big">
                            <?= number_format($total_vehicles ?? 0, 0, ',', '.'); ?>
                        </div>
                        <div class="kpi-footnote">terdaftar di sistem</div>
                    </div>
                </div>
            </div>

            <!-- AVAILABLE VEHICLES -->
            <div class="col-xl-3 col-lg-6 col-md-6 mb-4">
                <div class="card kpi-ideal">
                    <div class="card-body kpi-body">
                        <div class="kpi-head">
                            <div>
                                <div class="kpi-title">TERSEDIA</div>
                                <div class="kpi-sub">siap digunakan</div>
                            </div>
                            <div class="kpi-ic bg-gradient-success">
                                <i class="fas fa-check-circle"></i>
                            </div>
                        </div>
                        <div class="kpi-big">
                            <?= number_format($available_vehicles ?? 0, 0, ',', '.'); ?>
                        </div>
                        <div class="kpi-footnote">kendaraan status available</div>
                    </div>
                </div>
            </div>

            <!-- REQUESTS TODAY -->
            <div class="col-xl-3 col-lg-6 col-md-6 mb-4">
                <div class="card kpi-ideal">
                    <div class="card-body kpi-body">
                        <div class="kpi-head">
                            <div>
                                <div class="kpi-title">HARI INI</div>
                                <div class="kpi-sub">pengajuan hari ini</div>
                            </div>
                            <div class="kpi-ic bg-gradient-danger">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                        </div>
                        <div class="kpi-big">
                            <?= number_format($requests_today ?? 0, 0, ',', '.'); ?>
                        </div>
                        <div class="kpi-footnote"><?= date('d M Y'); ?></div>
                    </div>
                </div>
            </div>

        </div>
        <!-- ===== END KPI GRID ===== -->

        <div class="row mt-1">
            <div class="col-lg-7 mb-lg-0 mb-4">
                <div class="card z-index-2 chart-ideal">
                    <div class="card-header pb-0 pt-3 bg-transparent">
                        <h6 class="text-capitalize mb-1">Request Overview</h6>
                        <p class="text-sm mb-0">
                            <i class="fa fa-arrow-up text-success"></i>
                            <span class="font-weight-bold">Statistik Pengajuan Kendaraan 2025</span>
                        </p>
                    </div>
                    <div class="card-body p-3">
                        <div class="chart">
                            <canvas id="chart-requests" class="chart-canvas" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Slide Show -->
            <div class="col-lg-5">
                <div class="card card-carousel overflow-hidden h-100 p-0">
                    <div id="carouselExampleCaptions" class="carousel slide h-100" data-bs-ride="carousel">
                        <div class="carousel-inner border-radius-lg h-100">
                            <div class="carousel-item h-100 active" style="background-image: url('assets/assets/img/p2tl_pln.png'); background-size: cover;">
                            </div>
                            <div class="carousel-item h-100" style="background-image: url('assets/assets/img/Pln_stop_listrik_ilegal.png'); background-size: cover;">
                            </div>
                            <div class="carousel-item h-100" style="background-image: url('assets/assets/img/penertiban.png'); background-size: cover;">
                            </div>
                        </div>
                        <button class="carousel-control-prev w-5 me-3" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next w-5 me-3" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Script Chart -->
        <script>
        document.addEventListener("DOMContentLoaded", function () {
            if (typeof Chart === "undefined") return;

            const labels = <?= json_encode($chart_labels ?? []); ?>;
            const values = <?= json_encode($chart_requests ?? []); ?>;

            const el = document.getElementById("chart-requests");
            if (el) {
                new Chart(el, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Jumlah Request",
                            data: values,
                            tension: 0.4,
                            borderWidth: 3,
                            fill: true,
                            backgroundColor: 'rgba(94, 114, 228, 0.1)',
                            borderColor: '#5e72e4'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                grid: {
                                    drawBorder: false,
                                    display: true,
                                    drawOnChartArea: true,
                                    drawTicks: false,
                                    borderDash: [5, 5]
                                },
                                ticks: {
                                    display: true,
                                    padding: 10,
                                    color: '#fbfbfb',
                                    font: { size: 11, family: "Open Sans", style: 'normal', lineHeight: 2 },
                                }
                            },
                            x: {
                                grid: {
                                    drawBorder: false,
                                    display: false,
                                    drawOnChartArea: false,
                                    drawTicks: false,
                                    borderDash: [5, 5]
                                },
                                ticks: {
                                    display: true,
                                    color: '#ccc',
                                    padding: 20,
                                    font: { size: 11, family: "Open Sans", style: 'normal', lineHeight: 2 },
                                }
                            },
                        },
                    },
                });
            }
        });
        </script>

        <!-- Latest Requests Table -->
        <div class="row mt-4">
            <div class="col-lg-7 mb-lg-0 mb-4">
                <div class="card">
                    <div class="card-header pb-0 p-3">
                        <div class="d-flex justify-content-between">
                            <h6 class="mb-2">Request Terakhir</h6>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table align-items-center">
                            <thead class="table-light">
                                <tr>
                                    <th>Pemohon</th>
                                    <th>Tujuan</th>
                                    <th>Keperluan</th>
                                    <th class="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php if (!empty($latest_requests)): ?>
                                    <?php foreach ($latest_requests as $r): ?>
                                        <tr>
                                            <td>
                                                <div class="d-flex px-2 py-1 align-items-center">
                                                    <div class="icon icon-shape bg-gradient-primary shadow-primary text-center rounded-circle" style="width: 28px; height: 28px;">
                                                        <i class="ni ni-single-02 text-white" style="font-size: 14px;"></i>
                                                    </div>
                                                    <div class="ms-3">
                                                        <h6 class="text-sm mb-0"><?= htmlspecialchars($r['user_name'] ?? '—'); ?></h6>
                                                        <p class="text-xs text-muted mb-0"><?= date('d/m/Y H:i', strtotime($r['created_at'])); ?></p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p class="text-xs font-weight-bold mb-0">Tujuan:</p>
                                                <h6 class="text-sm mb-0"><?= htmlspecialchars($r['tujuan'] ?? '—'); ?></h6>
                                            </td>
                                            <td>
                                                <p class="text-xs text-muted mb-0"><?= htmlspecialchars($r['keperluan'] ?? '—'); ?></p>
                                            </td>
                                            <td class="text-center">
                                                <span class="badge badge-sm bg-gradient-<?= strpos(strtolower($r['status']), 'pending') !== false ? 'warning' : 'success'; ?>">
                                                    <?= strtoupper(htmlspecialchars($r['status'])); ?>
                                                </span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                <?php else: ?>
                                    <tr>
                                        <td colspan="4" class="text-center text-muted py-5">
                                            <i class="fas fa-inbox text-muted" style="font-size: 48px;"></i>
                                            <p class="mt-3">Belum ada data pengajuan</p>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Activity History -->
            <div class="col-lg-5">
                <div class="card">
                    <div class="card-header pb-0 p-3 d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">Riwayat Aktivitas</h6>
                        <a href="<?= base_url('Notifikasi'); ?>" class="btn btn-sm btn-outline-primary mb-0">Lihat Semua</a>
                    </div>
                    <div class="card-body p-3">
                        <?php if (!empty($riwayat_aktivitas)): ?>
                            <div class="activity-scroll">
                                <ul class="list-group">
                                    <?php foreach ($riwayat_aktivitas as $n): ?>
                                        <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                                            <div class="d-flex align-items-center">
                                                <div class="icon bg-gradient-dark shadow text-center d-flex align-items-center justify-content-center me-3" style="width: 28px; height: 28px; border-radius: 50%;">
                                                    <i class="ni ni-notification-70 text-white" style="font-size: 12px;"></i>
                                                </div>
                                                <div class="d-flex flex-column">
                                                    <h6 class="mb-1 text-dark text-sm"><?= htmlspecialchars($n['email'] ?? '—'); ?></h6>
                                                    <span class="text-xs"><?= htmlspecialchars($n['deskripsi'] ?? '—'); ?></span>
                                                    <span class="text-xs text-muted"><?= date('d M Y H:i', strtotime($n['tanggal_waktu'])); ?></span>
                                                </div>
                                            </div>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php else: ?>
                            <div class="text-center text-muted py-5">
                                <i class="ni ni-notification-70 text-muted" style="font-size: 48px;"></i>
                                <p class="mt-3">Belum ada aktivitas terbaru</p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<style>
.kpi-ideal{ height: 168px; border-radius: 14px; transition: transform .18s ease, box-shadow .18s ease; }
.kpi-ideal:hover{ transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,.08); }
.kpi-body{ padding: 16px !important; display:flex; flex-direction:column; height:100%; }
.kpi-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px; }
.kpi-title{ font-size: 12px; letter-spacing: .6px; font-weight: 900; color:#344767; text-transform: uppercase; }
.kpi-sub{ font-size: 11px; color:#7b8ca4; margin-top:3px; }
.kpi-ic{ width: 38px; height: 38px; border-radius: 14px; display:flex; align-items:center; justify-content:center; box-shadow: 0 6px 14px rgba(0,0,0,.12); }
.kpi-ic i{ color:#fff; font-size: 17px; }
.kpi-big{ font-size: 30px; font-weight: 900; color:#344767; line-height:1; flex: 1; display:flex; align-items:center; }
.kpi-footnote{ font-size: 11px; color:#7b8ca4; margin-top:auto; }
.chart-ideal{ border-radius: 14px; }
.activity-scroll{ max-height: 355px; overflow-y: auto; }
</style>
