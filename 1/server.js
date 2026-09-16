const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
const dataPath = path.join(__dirname, 'data.json');

// 1. GET /data
app.get('/data', (req, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Lỗi đọc file' });
        
        try {
            const parsedData = JSON.parse(data);
            res.json(parsedData);
        } catch (parseErr) {
            res.status(400).json({ message: 'File data.json bị rỗng hoặc sai cú pháp JSON!' });
        }
    });
});

// 2. POST /update
app.post('/update', (req, res) => {
    const newData = req.body;
    
    // Kiểm tra nếu body gửi lên bị rỗng
    if (!newData || Object.keys(newData).length === 0) {
        return res.status(400).json({ message: 'Body request không được để trống!' });
    }

    fs.writeFile(dataPath, JSON.stringify(newData, null, 4), (err) => {
        if (err) return res.status(500).json({ message: 'Lỗi ghi file' });
        res.json({ message: 'The data has been updated' });
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));