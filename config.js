// config.js - Configuration File
// JANGAN di-commit atau dibagikan!

module.exports = {
    telegram: {
        botToken: 'Token_telelu', // Ganti dengan token botmu
        adminId: [id lu, id lu]  // Ganti dengan ID Telegram admin (bisa array)
    },
    server: {
        port: 8080, // Port untuk server web lokal
        cloudflaredPath: './cloudflared', // Path ke binary cloudflared
        sessionTimeout: 300 // Timeout sesi website dalam detik
    },
    messages: {
        welcome: "🔓 *GeoTracker Bot Active*\\n\\nPilih menu di bawah:",
        ownerUrl: "tele lu",
        developerUrl: "no wa lu",
        channelsUrl: "https://whatsapp.com/channel/yourchannel" // Ganti linknya
    }
};