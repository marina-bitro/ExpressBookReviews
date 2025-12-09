const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (exists)
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Check if username and password match
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

// only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Create JWT token, expires in 1 hour
        const token = jwt.sign({ username: username }, 'secretKey', { expiresIn: '1h' });

        return res.status(200).json({ message: "User successfully logged in", token });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
    }
    try {
        const decoded = jwt.verify(token, 'secretKey');
        req.user = decoded.username;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

// Add or modify a book review
regd_users.put("/auth/review/:isbn", verifyJWT, (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required in query" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update review for the logged-in user
    books[isbn].reviews[req.user] = review;

    return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

// Delete a book review for the logged-in user
regd_users.delete("/auth/review/:isbn", verifyJWT, (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[req.user]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete review of the current user
    delete books[isbn].reviews[req.user];

    return res.status(200).json({ message: "Review deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
