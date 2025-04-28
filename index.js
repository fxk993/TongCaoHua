const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 文件上传配置
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    },
    fileFilter: function (req, file, cb) {
        // 只允许图片文件
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('只允许上传图片文件！'), false);
        }
        cb(null, true);
    }
});

// 数据库连接配置
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'tongcaohua_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// 创建上传目录
const fs = require('fs');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('创建上传目录成功:', uploadDir);
    }
} catch (error) {
    console.error('创建上传目录失败:', error);
}

// 作品上传接口
app.post('/api/artworks', upload.single('image'), async (req, res) => {
    let connection;
    try {
        console.log('收到上传请求:', req.body);
        console.log('文件信息:', req.file);

        if (!req.file) {
            throw new Error('未收到图片文件');
        }

        const { title, category, description } = req.body;
        if (!title || !category || !description) {
            throw new Error('请填写所有必填字段');
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        console.log('尝试连接数据库...');
        connection = await pool.getConnection();
        console.log('数据库连接成功');

        try {
            console.log('执行SQL插入...');
            const [result] = await connection.execute(
                'INSERT INTO artworks (title, category, description, image_url, create_time) VALUES (?, ?, ?, ?, NOW())',
                [title, category, description, imageUrl]
            );
            console.log('SQL执行成功，结果:', result);

            res.json({
                success: true,
                message: '作品上传成功',
                data: {
                    id: result.insertId,
                    title,
                    category,
                    description,
                    imageUrl
                }
            });
        } catch (sqlError) {
            console.error('SQL执行错误:', sqlError);
            throw sqlError;
        }
    } catch (error) {
        console.error('上传错误详情:', error);
        // 如果文件已上传但数据库操作失败，删除已上传的文件
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('已删除上传的文件:', req.file.path);
            } catch (unlinkError) {
                console.error('删除文件失败:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            message: '作品上传失败',
            error: error.message,
            stack: error.stack
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// 获取作品列表接口
app.get('/api/artworks', async (req, res) => {
    try {
        const { category, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        const connection = await pool.getConnection();
        try {
            let query = 'SELECT * FROM artworks WHERE status = 1';
            const params = [];

            if (category && category !== '全部作品') {
                query += ' AND category = ?';
                params.push(category);
            }

            query += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);

            const [rows] = await connection.execute(query, params);
            res.json({
                success: true,
                data: rows
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Get artworks error:', error);
        res.status(500).json({
            success: false,
            message: '获取作品列表失败',
            error: error.message
        });
    }
});

// 获取单个作品详情接口
app.get('/api/artworks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM artworks WHERE id = ? AND status = 1',
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '作品不存在'
                });
            }

            res.json({
                success: true,
                data: rows[0]
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Get artwork detail error:', error);
        res.status(500).json({
            success: false,
            message: '获取作品详情失败',
            error: error.message
        });
    }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 