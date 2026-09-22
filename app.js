const express = require("express");
const app = express();
const port = 3000;

// Middleware để parse JSON body từ client gửi lên
app.use(express.json());

// Import router quản lý bài viết
const articleRouter = require('./routes/articleRouter');

// Router GET / kiểm tra server có hoạt động không
// localhost:3000/
app.get("/", (req, res) => {
    res.status(200).json({
        message: "REST API đang hoạt động...",
    });
});

// Gắn articleRouter vào đường dẫn /api/articles
app.use("/api/articles", articleRouter);

// Middleware xử lý khi đường dẫn API không tồn tại (Phải đặt ở cuối cùng các route)
app.use((req, res) => {
    res.status(404).json({
        message: "API không tồn tại"
    });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang hoạt động tại: http://localhost:${port}`);
});