const express = require("express");
const fs = require("fs").promises;
const path = require("path"); // Xử lý đường dẫn file

// Tạo 1 router riêng cho articles (hoặc users)
const router = express.Router();

// Đường dẫn file đến data.json
const DATA_FILE = path.join(__dirname, "../data.json");

// Function: Đọc dữ liệu từ file
async function readComments() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Function: Ghi dữ liệu vào file (Đã sửa tên tham số cho đúng logic)
async function writeComments(comments) {
    await fs.writeFile(DATA_FILE, JSON.stringify(comments, null, 2), "utf-8");
}

// API: GET /api/articles - Đọc tất cả dữ liệu
router.get("/", async (req, res) => {
    try {
        const comments = await readComments();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// GET /api/articles/:id - Đọc 1 bài viết theo ID
router.get("/:id", async (req, res) => {
    try {
        const Id = parseInt(req.params.id); 
        const comments = await readComments();
        const comment = comments.find((c) => c.id === Id);
        if (comment) {
           
            res.status(200).json(comment);
        } else {
            res.status(404).json({ message: "không tồn tại" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// POST /api/articles - Thêm 1 bài viết mới
router.post("/", async (req, res) => {  
    try {
        const { articleId, author, content, date } = req.body;
        if (!articleId|| !author || !content || !date) {
            return res.status(400).json({ message: "Thiếu thông tin" });
        }
        const comments = await readComments();
        const newComment = {
            id: comments.length > 0 ? comments[comments.length - 1].id + 1 : 1,
            articleId,
            author,
            content,
            date
        };

        comments.push(newComment);
       
        await writeComments(comments);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// PUT /api/articles/:id - Cập nhật 1 bài viết
router.put("/:id", async (req, res) => {
    try {
        const Id = parseInt(req.params.id);
         const { articleId, author, content, date } = req.body;
        if (!articleId|| !author || !content || !date) {
            return res.status(400).json({ message: "Thiếu thông tin" });
        }
        const comments = await readComments();
        const commentIndex = comments.findIndex((c) => c.id === Id);
        if (commentIndex === -1) {
            return res.status(404).json({ message: "không tồn tại" });
        }
        comments[commentIndex] = { ...comments[commentIndex], articleId, author, content, date };
        await writeComments(comments);
        res.status(200).json(comments[commentIndex]);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// DELETE /api/articles/:id - Xóa 1 bài viết
router.delete("/:id", async (req, res) => {
    try {
        const Id = parseInt(req.params.id);
        const comments = await readComments();
        const commentIndex = comments.findIndex((c) => c.id === Id);
        if (commentIndex === -1) {
            return res.status(404).json({ message: "không tồn tại" });
        }
        const deletedComment = comments.splice(commentIndex, 1)[0];
        await writeComments(comments);
        res.status(200).json(deletedComment);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }   
});

module.exports = router;