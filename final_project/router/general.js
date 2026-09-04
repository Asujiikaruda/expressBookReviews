const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = Object.keys(books)
    .filter((isbn) => books[isbn].author.toLowerCase() === author.toLowerCase())
    .map((isbn) => ({ isbn: isbn, ...books[isbn] }));

  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksbyauthor: matchingBooks });
  }
  return res.status(404).json({ message: `No books found by author ${author}` });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = Object.keys(books)
    .filter((isbn) => books[isbn].title.toLowerCase() === title.toLowerCase())
    .map((isbn) => ({ isbn: isbn, ...books[isbn] }));

  if (matchingBooks.length > 0) {
    return res.status(200).json({ booksbytitle: matchingBooks });
  }
  return res.status(404).json({ message: `No books found with title ${title}` });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// ========== Tasks 10-13: Axios with async/await & Promises ==========

// Task 10: Get all books using async/await + Axios
public_users.get('/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list" });
  }
});

// Task 11: Get book by ISBN using Promise callbacks + Axios
public_users.get('/books/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(404).json({ message: `Book with ISBN ${isbn} not found` }));
});

// Task 12: Get books by author using async/await + Axios
public_users.get('/books/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: `No books found by author ${req.params.author}` });
  }
});

// Task 13: Get books by title using async/await + Axios
public_users.get('/books/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: `No books found with title ${req.params.title}` });
  }
});

module.exports.general = public_users;
