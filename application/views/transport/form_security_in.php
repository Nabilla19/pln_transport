<main class="main-content position-relative border-radius-lg">
    <?php $this->load->view('layout/navbar'); ?>
    <div class="container-fluid py-4">
    <div class="row">
        <div class="col-md-6 mx-auto">
            <div class="card">
                <div class="card-header pb-0">
                    <h6>Security Check-In (Berangkat)</h6>
                </div>
                <div class="card-body">
                    <form action="<?= base_url('transport/security_checkin/'.$request['id']) ?>" method="post" enctype="multipart/form-data">
                        <div class="row">
                            <div class="col-12">
                                <div class="alert alert-info alert-dismissible fade show" role="alert">
                                    <span class="alert-icon"><i class="fas fa-camera"></i></span>
                                    <span class="alert-text">
                                        <strong>Info:</strong> Untuk mengambil foto langsung dari kamera, buka halaman ini di <strong>perangkat mobile</strong> (HP/Tablet). 
                                        Di desktop, Anda bisa pilih file gambar dari komputer.
                                    </span>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-control-label">KM Awal</label>
                                    <input class="form-control" type="number" name="km_awal" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-control-label">Jam Berangkat</label>
                                    <input class="form-control" type="time" name="jam_berangkat" value="<?= date('H:i') ?>" required>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-control-label">Foto Driver + Mobil (Berangkat)</label>
                            <div class="input-group">
                                <input class="form-control" type="file" name="foto_driver_berangkat" 
                                       id="foto_driver_berangkat"
                                       accept="image/*" 
                                       capture="environment">
                                <button type="button" class="btn btn-outline-primary mb-0" onclick="openCamera('driver')">
                                    <i class="fas fa-camera"></i> Live Cam
                                </button>
                            </div>
                            <input type="hidden" name="capture_driver" id="capture_driver_input">
                            <small class="form-text text-muted">Tap "Live Cam" untuk ambil foto langsung atau pilih file</small>
                            <div id="preview_driver_berangkat" class="mt-2" style="display:none;">
                                <img id="img_driver_berangkat" class="img-fluid rounded shadow-sm" style="max-height: 200px;">
                                <span class="badge bg-success mt-1">Foto Berhasil Diambil</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-control-label">Foto KM (Berangkat)</label>
                            <div class="input-group">
                                <input class="form-control" type="file" name="foto_km_berangkat" 
                                       id="foto_km_berangkat"
                                       accept="image/*" 
                                       capture="environment">
                                <button type="button" class="btn btn-outline-primary mb-0" onclick="openCamera('km')">
                                    <i class="fas fa-camera"></i> Live Cam
                                </button>
                            </div>
                            <input type="hidden" name="capture_km" id="capture_km_input">
                            <small class="form-text text-muted">Tap "Live Cam" untuk ambil foto langsung atau pilih file</small>
                            <div id="preview_km_berangkat" class="mt-2" style="display:none;">
                                <img id="img_km_berangkat" class="img-fluid rounded shadow-sm" style="max-height: 200px;">
                                <span class="badge bg-success mt-1">Foto Berhasil Diambil</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end mt-4">
                            <button type="submit" class="btn btn-danger btn-sm">Simpan & Berangkatkan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    </div>
</main>

<!-- Camera Modal -->
<div class="modal fade" id="cameraModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content bg-dark border-0">
            <div class="modal-header border-0 pb-0">
                <h6 class="modal-title text-white">Live Camera Capture</h6>
                <button type="button" class="btn-close text-white" data-bs-dismiss="modal" onclick="stopCamera()"></button>
            </div>
            <div class="modal-body p-0 position-relative">
                <video id="video" width="100%" height="auto" autoplay playsinline class="bg-black"></video>
                <div class="controls position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center">
                    <button type="button" class="btn btn-dark btn-fab rounded-circle shadow" onclick="switchCamera()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button type="button" class="btn btn-primary btn-lg rounded-circle shadow p-4" onclick="takeSnapshot()">
                        <i class="fas fa-camera fa-2x"></i>
                    </button>
                    <div style="width: 48px;"></div> <!-- Spacer -->
                </div>
            </div>
        </div>
    </div>
</div>

<canvas id="canvas" style="display:none;"></canvas>

<script>
let currentStream = null;
let currentFacingMode = 'environment';
let currentTarget = null;

async function openCamera(target) {
    currentTarget = target;
    const modal = new bootstrap.Modal(document.getElementById('cameraModal'));
    modal.show();
    startCamera();
}

async function startCamera() {
    if (currentStream) {
        stopCamera();
    }
    
    const constraints = {
        video: { facingMode: currentFacingMode }
    };
    
    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('video');
        video.srcObject = currentStream;
    } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Gagal mengakses kamera. Pastikan izin telah diberikan.");
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

function switchCamera() {
    currentFacingMode = (currentFacingMode === 'user' ? 'environment' : 'user');
    startCamera();
}

function takeSnapshot() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Update preview
    if (currentTarget === 'driver') {
        document.getElementById('img_driver_berangkat').src = dataUrl;
        document.getElementById('preview_driver_berangkat').style.display = 'block';
        document.getElementById('capture_driver_input').value = dataUrl;
        document.getElementById('foto_driver_berangkat').value = ''; // Clear file input
    } else {
        document.getElementById('img_km_berangkat').src = dataUrl;
        document.getElementById('preview_km_berangkat').style.display = 'block';
        document.getElementById('capture_km_input').value = dataUrl;
        document.getElementById('foto_km_berangkat').value = ''; // Clear file input
    }
    
    // Close modal
    const modalElement = document.getElementById('cameraModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
    stopCamera();
}

// Image preview functionality for fallback file input
function setupImagePreview(inputId, previewId, imgId, hiddenId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('File harus berupa gambar!');
                this.value = '';
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file maksimal 2MB!');
                this.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById(imgId).src = event.target.result;
                document.getElementById(previewId).style.display = 'block';
                // Clear live capture if file is selected
                if(hiddenId) document.getElementById(hiddenId).value = '';
            };
            reader.readAsDataURL(file);
        }
    });
}

setupImagePreview('foto_driver_berangkat', 'preview_driver_berangkat', 'img_driver_berangkat', 'capture_driver_input');
setupImagePreview('foto_km_berangkat', 'preview_km_berangkat', 'img_km_berangkat', 'capture_km_input');
</script>

<style>
.btn-fab {
    width: 48px;
    height: 48px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.bg-black { background-color: #000; }
</style>
