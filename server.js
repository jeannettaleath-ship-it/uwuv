const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// هذا الكود يرسل صفحة الموقع مباشرة عند فتح الرابط
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام التحكم الموحد</title>
    <style>
        body { background: #000; color: #fff; font-family: sans-serif; text-align: center; padding: 20px; margin: 0; }
        .box { background: #1a1a1a; padding: 30px; border-radius: 20px; margin-top: 50px; border: 1px solid #333; }
        .btn { display: block; width: 100%; padding: 20px; margin: 15px 0; border: none; border-radius: 12px; font-size: 20px; font-weight: bold; cursor: pointer; color: white; }
        .target-btn { background: #e74c3c; }
        .monitor-btn { background: #2ecc71; }
        #screen-view { width: 100%; max-width: 400px; border: 2px solid #444; display: none; margin-top: 20px; border-radius: 15px; }
    </style>
</head>
<body>
    <div id="main-menu" class="box">
        <h2>نظام التحكم</h2>
        <button class="btn target-btn" onclick="setupTarget()">بث شاشة هذا الجهاز</button>
        <button class="btn monitor-btn" onclick="setupMonitor()">عرض شاشة الجهاز الآخر</button>
    </div>

    <div id="working-area" style="display:none;">
        <h3 id="mode-title">جاري العمل...</h3>
        <p id="status">بانتظار الإذن...</p>
        <img id="screen-view" src="">
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const screenView = document.getElementById('screen-view');
        const status = document.getElementById('status');

        async function setupTarget() {
            document.getElementById('main-menu').style.display = 'none';
            document.getElementById('working-area').style.display = 'block';
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 10 } });
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                status.innerText = "✅ البث شغال";
                setInterval(() => {
                    if (socket.connected) {
                        canvas.width = 360; canvas.height = 640;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        socket.emit('screen_frame', canvas.toDataURL('image/jpeg', 0.4));
                    }
                }, 600);
            } catch (err) {
                alert("يجب إعطاء صلاحية مشاركة الشاشة");
                location.reload();
            }
        }

        function setupMonitor() {
            document.getElementById('main-menu').style.display = 'none';
            document.getElementById('working-area').style.display = 'block';
            screenView.style.display = 'inline-block';
            socket.on('update_monitor', (data) => {
                screenView.src = data;
                status.innerText = "✅ متصل بالبث";
            });
        }
    </script>
</body>
</html>
    `);
});

io.on('connection', (socket) => {
    socket.on('screen_frame', (data) => {
        socket.broadcast.emit('update_monitor', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Server running...'));
