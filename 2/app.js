const express = require('express');
const app = express();
const PORT = 3000;
const articles = require('./articles');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//get all articles
app.get('/articles',async (req, res) => {
    try {
        res.status(200).json(articles);
    } catch (err) {
        res.status(404).json({message:err.message});
    }
});
app.post('/articles',async (req, res) => {
    const newArticle = {
        id: articles.length + 1,
        title: req.body.title,
        date: req.body.date,
        text: req.body.text
    };
    articles.push(newArticle);
    res.status(201).json(newArticle);
});
app.put('/articles',async (req, res) => {
    try {
        res.status(403).end('PUT operation not supported on /articles');
    } catch (err) {
        res.status(400).json({message:err.message});
    }
});
app.delete('/articles',async (req, res) => {
    try {
        res.status(200).end('Deleting all articles');
    } catch (err) {
        res.status(400).json({message:err.message});
    }
});

app.get('/articles/:id',async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = articles.find(article => article.id === id);
        if (!article) {
            return res.status(404).send('Article not found');
        }
        res.status(200).json(article);
    }
    catch (err) {
        res.status(404).json({message:err.message});
    }
});
app.post('/articles/:id',async (req, res) => {
    try {
        res.status(403).end('POST operation not supported on /articles/'+ req.params.id);
    } catch (err) {
        res.status(400).json({message:err.message});
    }
});
app.put('/articles/:id',async (req, res) => {
    const index = articles.findIndex(article => article.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).send('Article not found');
    }
    articles[index] = { ...articles[index], ...req.body };
    res.status(200).json(articles[index]);
});
app.delete('/articles/:id',async (req, res) => {
    const index = articles.findIndex(article => article.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).send('Article not found');
    }
    const deletedArticle = articles.splice(index, 1);
    res.status(204).json(deletedArticle);
});
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));