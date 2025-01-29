const express = require('express');
const app = express();
const qrCode = require('qrcode')
const stream = require('stream')

require('dotenv').config();
const config = process.env;

app.use(express.json());

app.get('/genarate', (req, res, next) => {
    res.send('asdasd')
})

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
 
    const passThrough = stream.PassThrough()
    await qrCode.toFileStream(passThrough, data, { type: 'png', width: 150 })
    passThrough.pipe(res)
})

app.use((req, res) => {
    return res.status(404).json({ message: 'Page not found' });
})

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});