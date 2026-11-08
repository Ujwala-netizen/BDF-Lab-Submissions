const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());

let db;

// GET all books with search, sorting, pagination and price filters
app.get("/books", async (req, res) => {
    try {
        const {
            search_q = "",
            order_by = "id",
            order = "ASC",
            limit = "10",
            offset = "0",
            min_price,
            max_price
        } = req.query;

        const allowedColumns = ["id", "title", "author", "price", "pages"];

        if (!allowedColumns.includes(order_by)) {
            return res.status(400).json({
                message: "Invalid order_by value"
            });
        }

        const sortOrder = order.toUpperCase();

        if (!["ASC", "DESC"].includes(sortOrder)) {
            return res.status(400).json({
                message: "Order must be ASC or DESC"
            });
        }

        const limitValue = Number(limit);
        const offsetValue = Number(offset);

        if (
            !Number.isInteger(limitValue) || limitValue <= 0 ||
            !Number.isInteger(offsetValue) || offsetValue < 0
        ) {
            return res.status(400).json({
                message: "Invalid limit or offset"
            });
        }

        if (
            (min_price !== undefined &&
                (min_price.trim() === "" || !Number.isFinite(Number(min_price)))) ||
            (max_price !== undefined &&
                (max_price.trim() === "" || !Number.isFinite(Number(max_price))))
        ) {
            return res.status(400).json({
                message: "Price filters must be numeric"
            });
        }

        if (
            min_price !== undefined &&
            max_price !== undefined &&
            Number(min_price) > Number(max_price)
        ) {
            return res.status(400).json({
                message: "Minimum price cannot exceed maximum price"
            });
        }

        let sql = "SELECT * FROM book WHERE 1=1";
        const params = [];

        if (search_q.trim() !== "") {
            sql += " AND title LIKE ?";
            params.push(`%${search_q}%`);
        }

        if (min_price !== undefined) {
            sql += " AND price >= ?";
            params.push(Number(min_price));
        }

        if (max_price !== undefined) {
            sql += " AND price <= ?";
            params.push(Number(max_price));
        }

        sql += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;

        params.push(limitValue, offsetValue);

        const books = await db.all(sql, params);

        res.status(200).json({
            message: "Books retrieved successfully",
            books: books
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve books"
        });
    }
});


// GET book by ID
app.get("/books/:bookId", async (req, res) => {
    try {
        const book = await db.get(
            "SELECT * FROM book WHERE id = ?",
            [req.params.bookId]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book retrieved successfully",
            book: book
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve book"
        });
    }
});


// POST new book
app.post("/books", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim()
        ) {
            return res.status(400).json({
                message: "Valid title and author are required"
            });
        }

        if (
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(price)
        ) {
            return res.status(400).json({
                message: "Price must be a valid number"
            });
        }

        if (
            pages !== undefined &&
            (!Number.isInteger(pages) || pages <= 0)
        ) {
            return res.status(400).json({
                message: "Pages must be a positive integer"
            });
        }

        const result = await db.run(
            `INSERT INTO book (title, author, price, pages)
             VALUES (?, ?, ?, ?)`,
            [title.trim(), author.trim(), price, pages || null]
        );

        res.status(201).json({
            message: "Book added successfully",
            bookId: result.lastID
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add book"
        });
    }
});


// PUT update book
app.put("/books/:bookId", async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(price)
        ) {
            return res.status(400).json({
                message: "Valid title, author and numeric price are required"
            });
        }

        if (
            pages !== undefined &&
            (!Number.isInteger(pages) || pages <= 0)
        ) {
            return res.status(400).json({
                message: "Pages must be a positive integer"
            });
        }

        const result = await db.run(
            `UPDATE book
             SET title = ?, author = ?, price = ?, pages = ?
             WHERE id = ?`,
            [
                title.trim(),
                author.trim(),
                price,
                pages || null,
                req.params.bookId
            ]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update book"
        });
    }
});


// DELETE book
app.delete("/books/:bookId", async (req, res) => {
    try {
        const result = await db.run(
            "DELETE FROM book WHERE id = ?",
            [req.params.bookId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete book"
        });
    }
});


// Initialize database and start server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: "./books.db",
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                price REAL NOT NULL,
                pages INTEGER
            )
        `);

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log("Server running at port " + PORT);
        });

    } catch (error) {
        console.error("Database/Server error:", error.message);
    }
};

initializeDBAndServer();