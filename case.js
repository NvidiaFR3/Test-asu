require('./settings');
const os = require('os');
const { execSync } = require('child_process');


function speed() {
    return new Date().getTime();
}

function runtime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d} hari ${h} jam ${m} menit ${s} detik`;
}

function formatp(bytes) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

module.exports = async (Nvidia, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || msg.data;

    if (!text) return;

    const usedPrefix = global.multiPrefix.find(p => text.startsWith(p));
    let command;

    if (msg.data) {
        command = text.toLowerCase();
    } else if (usedPrefix) {
        const args = text.slice(usedPrefix.length).trim().split(' ');
        command = args.shift().toLowerCase();
    } else {
        return;
    }

    switch (command) {
        case 'start':
        case 'menu':
            Nvidia.sendPhoto(chatId, global.menuImage, {
                caption: `Halo, saya ${global.botname}!\nSilakan pilih menu di bawah ini.`,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '📞 Contact Owner (WhatsApp)', url: global.contact_wa },
                            { text: '💬 Contact Owner (Telegram)', url: global.contact_tele }
                        ],
                        [
                            { text: '📋 All Menu', callback_data: 'allmenu' },
                            { text: '📡 Ping Server', callback_data: 'ping' }
                        ]
                    ]
                }
            });
            break;

        case 'allmenu':
            NvidiaReply(Nvidia, chatId, `📋 All Menu:\n\n• ${global.multiPrefix.join('start\n• ')}start\n• ${global.multiPrefix.join('ping\n• ')}ping\n• ${global.multiPrefix.join('menu\n• ')}menu`);
            break;

        case 'ping':
        case 'uptime': {
            let timestamp = speed();
            let latensi = speed() - timestamp;

            const localTime = new Date().toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour12: false
            });

            let networkStatus = 'Unknown';
            try {
                execSync('ping -c 1 google.com', { stdio: 'ignore' });
                networkStatus = 'Online';
            } catch (err) {
                networkStatus = 'Offline';
            }

            let publicIP = 'Tidak Diketahui';
            try {
                publicIP = execSync('curl -s ifconfig.me').toString().trim();
            } catch (e) {}

            // CPU & RAM
            const cpuUsage = os.loadavg()[0].toFixed(2);
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMemPercent = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
            const osInfo = `${os.type()} ${os.release()} (${os.arch()})`;
            const hostname = os.hostname();
            const vpsUptime = runtime(os.uptime());

            let respon = `
──────────────────────────────
          🖥️ SERVER STATUS
──────────────────────────────
📡 Hostname        : ${hostname}
💻 OS              : ${osInfo}
🧠 Total RAM        : ${formatp(totalMem)}
📊 RAM Digunakan    : ${usedMemPercent}%
🧮 CPU Load         : ${cpuUsage}
🧩 Total CPU Core   : ${os.cpus().length} Core
⏱️ VPS Uptime       : ${vpsUptime}
🕒 Waktu Lokal      : ${localTime}
🌐 Status Jaringan  : ${networkStatus}
🌍 IP Publik        : ${publicIP}

──────────────────────────────
            🤖 BOT INFO
──────────────────────────────
⚡ Kecepatan Respon : ${latensi.toFixed(4)} detik
🟢 Runtime Bot      : ${runtime(process.uptime())}
🛠️ Versi Bot        : ${global.versi}
📛 Nama Bot         : ${global.botname}

──────────────────────────────
          💡 TIPS PENGGUNAAN
──────────────────────────────
✅ Pastikan koneksi internet stabil.
📜 Ketik *.menu* untuk melihat semua fitur.
──────────────────────────────
`;

            NvidiaReply(Nvidia, chatId, respon);
        }
            break;

        // Default
        default:
            NvidiaReply(Nvidia, chatId, '❌ Command tidak dikenal!');
    }
};