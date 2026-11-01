const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

let db;

// GET all books
app.get("/books/", async (req, res) => {
    const books = await db.all("SELECT * FROM book");
    res.send(books);
});

// GET one book
app.get("/books/:bookId/", async (req, res) => {
    const book = await db.get(
        "SELECT * FROM book WHERE id = ?",
        [req.params.bookId]
    );
    res.send(book || "Book Not Found");
});

// POST book
app.post("/books/", async (req, res) => {
    const { title, author, price, pages } = req.body;
    const result = await db.run(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
        [title, author, price, pages]
    );
    res.send("Book Added Successfully. ID: " + result.lastID);
});

// PUT book
app.put("/books/:bookId/", async (req, res) => {
    const { title, author, price, pages } = req.body;
    const result = await db.run(
        "UPDATE book SET title=?, author=?, price=?, pages=? WHERE id=?",
        [title, author, price, pages, req.params.bookId]
    );
    res.send(result.changes ? "Book Updated Successfully" : "Book Not Found");
});

// DELETE book
app.delete("/books/:bookId/", async (req, res) => {
    const result = await db.run(
        "DELETE FROM book WHERE id=?",
        [req.params.bookId]
    );
    res.send(result.changes ? "Book Deleted Successfully" : "Book Not Found");
});


const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: "./books.db",
            driver: sqlite3.Database
        });

        await db.exec(
            "CREATE TABLE IF NOT EXISTS book (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "title TEXT, author TEXT, price INTEGER, pages INTEGER)"
        );

        const count = await db.get("SELECT COUNT(*) AS count FROM book");

        if (count.count === 0) {
            const books = [
                ["Wings of Fire", "A.P.J. Abdul Kalam", 250, 180],
                ["The Alchemist", "Paulo Coelho", 300, 200],
                ["Atomic Habits", "James Clear", 450, 320],
                ["Harry Potter", "J.K. Rowling", 500, 400],
                ["Ikigai", "Hector Garcia", 350, 190],
                ["Rich Dad Poor Dad", "Robert Kiyosaki", 400, 250],
                ["The Hobbit", "J.R.R. Tolkien", 550, 310],
                ["Think and Grow Rich", "Napoleon Hill", 280, 220]
            ];

            for (const book of books) {
                await db.run(
                    "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
                    book
                );
            }
        }

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log("Server running at port " + PORT);
        });

    } catch (error) {
        console.error("Database error:", error.message);
    }
};

initializeDBAndServer();