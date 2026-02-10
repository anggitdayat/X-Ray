// CONFIGURASI
const BACKEND_URL = "https://esp32-backend.vercel.app"; // Ganti dengan URL Anda
const DEVICE_ID = "esp32_rumah"; // ID unik untuk ESP32 Anda

// DOM Elements
const statusElement = document.getElementById('device-status');
const ledButton = document.getElementById('led-button');

// Fungsi: Ambil status terkini dari ESP32
async function getDeviceStatus() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/state`);
        const data = await response.json();
        
        if (data.success) {
            updateUI(data.deviceState);
            return data.deviceState;
        }
    } catch (error) {
        console.error('Error fetching status:', error);
        statusElement.textContent = 'Status: Offline';
        statusElement.style.color = 'red';
    }
}

// Fungsi: Kirim perintah ke ESP32
async function sendCommand(command, value) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/control`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                command: command,
                value: value
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`✅ Berhasil: ${command} = ${value}`);
            getDeviceStatus(); // Refresh status
            return result;
        } else {
            showNotification(`❌ Gagal: ${result.error}`);
        }
    } catch (error) {
        console.error('Error sending command:', error);
        showNotification('❌ Gagal terhubung ke server');
    }
}

// Fungsi: Update tampilan UI
function updateUI(state) {
    if (!state) return;
    
    // Update status
    statusElement.textContent = `Status: Online (${state.led})`;
    statusElement.style.color = 'green';
    
    // Update tombol LED
    if (ledButton) {
        ledButton.textContent = state.led === 'ON' ? '🔴 MATIKAN LED' : '🟢 NYALAKAN LED';
        ledButton.className = state.led === 'ON' ? 'btn btn-danger' : 'btn btn-success';
    }
}

// Fungsi: Tampilkan notifikasi
function showNotification(message) {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        background: #333;
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeInOut 3s;
    `;
    
    document.body.appendChild(notification);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Fungsi: Setup event listeners
function setupEventListeners() {
    // Tombol LED
    if (ledButton) {
        ledButton.addEventListener('click', async () => {
            const currentState = await getDeviceStatus();
            const newState = currentState.led === 'ON' ? 'OFF' : 'ON';
            await sendCommand('led', newState);
        });
    }
    
    // Tombol kontrol lainnya bisa ditambah di sini
    // Contoh: relay, motor, dll.
}

// Fungsi: Auto-refresh status setiap 5 detik
function startAutoRefresh() {
    getDeviceStatus(); // Ambil status pertama kali
    setInterval(getDeviceStatus, 5000); // Refresh setiap 5 detik
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startAutoRefresh();
    
    console.log('ESP32 Controller initialized');
    console.log('Backend URL:', BACKEND_URL);
});

// Contoh HTML yang diperlukan:
/*
<div class="container">
    <h1>ESP32 Controller</h1>
    <div id="device-status">Status: Loading...</div>
    
    <div class="controls">
        <button id="led-button" class="btn">Loading...</button>
        <!-- Tambah tombol lain di sini -->
    </div>
    
    <div class="info">
        <p>Backend: <span id="backend-url">${BACKEND_URL}</span></p>
        <p>Device ID: <span id="device-id">${DEVICE_ID}</span></p>
    </div>
</div>
*/