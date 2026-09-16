const express = require('express');
const app = express();
const PORT = 3000;
const video = require('./video');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//get all videos
app.get('/video',async (req, res) => {
    try {
        res.status(200).json(video);
    } catch (err) {
        res.status(404).json({message:err.message});
    }
});
app.post('/video',async (req, res) => {
    const newVideo = {
        id: video.length + 1,
        title: req.body.title,
        duration: req.body.duration,
        description: req.body.description
    };
    video.push(newVideo);
    res.status(201).json(newVideo);
});
app.put('/video',async (req, res) => {
    try {
        res.status(403).end('PUT operation not supported on /videos');
    } catch (err) {
        res.status(400).json({message:err.message});
    }
});
app.delete('/video',async (req, res) => {
    try {
        res.status(200).end('Deleting all videos');
    } catch (err) {
        res.status(400).json({message:err.message});
    }
});

app.get('/video/:id',async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const videoItem = video.find(video => video.id === id);
        if (!videoItem) {
            return res.status(404).send('Video not found');
        }
        res.status(200).json(videoItem);
    }
    catch (err) {
        res.status(404).json({message:err.message});
    }
});
app.post('/video/:id',async (req, res) => {
    try {
        res.status(403).end('POST operation not supported on /video/'+ req.params.id);
    } catch (err) {
        res.status(400).json({message:err.message});
    }
});
app.put('/video/:id',async (req, res) => {
    const index = video.findIndex(video => video.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).send('Video not found');
    }
    video[index] = { ...video[index], ...req.body };
    res.status(200).json(video[index]);
});
app.delete('/video/:id',async (req, res) => {
    const index = video.findIndex(video => video.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).send('Video not found');
    }
    const deletedVideo = video.splice(index, 1);
    res.status(204).json(deletedVideo);
});
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));