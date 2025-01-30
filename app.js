const express = require('express');
const app = express();
const qrCode = require('qrcode');
const stream = require('stream');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const config = process.env;

app.use(express.json());

function checkData(data) {
    if (typeof data === 'string' && data.trim() !== '') {
        return true;
    } else {
        return false;
    }
}

app.get('/', async (req, res) => {
    const data = req.query.data;
    console.log(checkData(data));
    if(!checkData(data)) return res.status(400).json({ message: 'Invalid data' });

    // สร้าง path สำหรับไฟล์ QR code ที่จะดาวน์โหลด
    const filePath = path.join(__dirname, 'qrCode.png');

    const passThrough = stream.PassThrough();

    try {
        // สร้าง QR code และบันทึกลงไฟล์
        await qrCode.toFileStream(passThrough, data, { type: 'png', width: 150 });

        // เขียน QR code ลงไฟล์
        const writeStream = fs.createWriteStream(filePath);
        passThrough.pipe(writeStream);

        // เมื่อบันทึกไฟล์เสร็จแล้ว
        writeStream.on('finish', () => {
            // ตั้งค่า header ให้เบราว์เซอร์ดาวน์โหลดไฟล์
            res.setHeader('Content-Disposition', 'attachment; filename="qrCode.png"');
            res.setHeader('Content-Type', 'image/png');

            // ส่งไฟล์ QR code ไปยังเบราว์เซอร์
            fs.createReadStream(filePath).pipe(res);
        });

    } catch (err) {
        return res.status(500).json({ message: 'Error generating QR code', error: err });
    }
});

// สำหรับ route 404
app.use((req, res) => {
    return res.status(404).json({ message: 'Page not found' });
});

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});