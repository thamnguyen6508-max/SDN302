const express = require("express");
const fs = require("fs").promises;
const path = require("path"); // Xử lý đường dẫn file

// Tạo 1 router riêng cho articles (hoặc users)
const router = express.Router();

// Đường dẫn file đến data.json
const DATA_FILE = path.join(__dirname, "../data.json");

// Function: Đọc dữ liệu từ file
async function readArticles() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Function: Ghi dữ liệu vào file (Đã sửa tên tham số cho đúng logic)
async function writeArticles(articles) {
    await fs.writeFile(DATA_FILE, JSON.stringify(articles, null, 2), "utf-8");
}

// API: GET /api/articles - Đọc tất cả dữ liệu
router.get("/", async (req, res) => {
    try {
        const articles = await readArticles();
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// GET /api/articles/:id - Đọc 1 bài viết theo ID
router.get("/:id", async (req, res) => {
    try {
        const Id = parseInt(req.params.id); 
        const articles = await readArticles();
        const article = articles.find((a) => a.id === Id);
        if (article) {
            // Sửa lỗi: Đổi `user` thành `article`
            res.status(200).json(article);
        } else {
            res.status(404).json({ message: "Bài viết không tồn tại" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// POST /api/articles - Thêm 1 bài viết mới
router.post("/", async (req, res) => {  
    try {
        const { title, content, author, date } = req.body;
        if (!title || !content || !author || !date) {
            return res.status(400).json({ message: "Thiếu thông tin" });
        }
        const articles = await readArticles();
        const newArticle = {
            id: articles.length > 0 ? articles[articles.length - 1].id + 1 : 1,
            title,
            content,
            author,
            date
        };

        articles.push(newArticle);
        // Sửa lỗi: Thay `writeUsers` bằng `writeArticles`
        await writeArticles(articles);
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// PUT /api/articles/:id - Cập nhật 1 bài viết
router.put("/:id", async (req, res) => {
    try {
        const Id = parseInt(req.params.id);
        const { title, content, author, date } = req.body;
        if (!title || !content || !author || !date) {
            return res.status(400).json({ message: "Thiếu thông tin" });
        }
        const articles = await readArticles();
        const articleIndex = articles.findIndex((a) => a.id === Id);
        if (articleIndex === -1) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }
        articles[articleIndex] = { ...articles[articleIndex], title, content, author, date };
        await writeArticles(articles);
        res.status(200).json(articles[articleIndex]);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// DELETE /api/articles/:id - Xóa 1 bài viết
router.delete("/:id", async (req, res) => {
    try {
        const Id = parseInt(req.params.id);
        const articles = await readArticles();
        const articleIndex = articles.findIndex((a) => a.id === Id);
        if (articleIndex === -1) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }
        const deletedArticle = articles.splice(articleIndex, 1)[0];
        await writeArticles(articles);
        res.status(200).json(deletedArticle);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }   
});

module.exports = router;