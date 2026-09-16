const express = require('express');
const app = express();
// const port = 3000;
app.get('/Hello', (req, res) => {
    res.send('Hello, World!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });