const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

/* -----------------------------
   TASK 10 – Get book list using async/await (Axios style)
------------------------------*/
function getBooksPromise() {
    return new Promise((resolve, reject) => {
        if (books) resolve(books);
        else reject("Unable to fetch book list");
    });
}

public_users.get('/async/books', async (req, res) => {
    try {
        const bookList = await getBooksPromise();
        return res.status(200).json(bookList);
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});


/* -----------------------------
   TASK 11 – Get book by ISBN using async/await
------------------------------*/
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) resolve(book);
        else reject("Book not found");
    });
}

public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const book = await getBookByISBN(req.params.isbn);
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


/* -----------------------------
   TASK 12 – Get books by Author using async/await
------------------------------*/
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const result = [];

        Object.keys(books).forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                result.push(books[key]);
            }
        });

        if (result.length > 0) resolve(result);
        else reject("No books found for this author");
    });
}

public_users.get('/async/author/:author', async (req, res) => {
    try {
        const authorBooks = await getBooksByAuthor(req.params.author);
        return res.status(200).json(authorBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


/* -----------------------------
   TASK 13 – Get books by Title using async/await
------------------------------*/
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const result = [];

        Object.keys(books).forEach(key => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                result.push(books[key]);
            }
        });

        if (result.length > 0) resolve(result);
        else reject("No books found with this title");
    });
}

public_users.get('/async/title/:title', async (req, res) => {
    try {
        const titleBooks = await getBooksByTitle(req.params.title);
        return res.status(200).json(titleBooks);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


module.exports.general = public_users;
