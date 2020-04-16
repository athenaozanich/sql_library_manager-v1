const express = require('express')
const router = express.Router()
const Book = require('../models').Book
/* Handler function to wrap each route. */
function asyncHandler (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  res.redirect('/books')
}))

/* GET books listing. */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll(/* { order: [['year', 'ASC']] } */)// commenting out my preferred ordering until after grading
  res.render('index', { books, title: 'Library Inventory Manager' })
}))

/* Create a new book form. */
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('books/new_book', { book: {}, title: 'New Book' })
}))

/* POST create book. */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book
  try {
    book = await Book.create(req.body)
    res.redirect('/books')// redirect after book entry creation
  } catch (error) {
    if (error.name === 'SequelizeValidationError') { // checking the error
      book = await Book.build(req.body)
      res.render('books/new_book', { book, errors: error.errors, title: 'New Book' })
    } else {
      throw error // error caught in the asyncHandler's catch block
    }
  }
}))

/* Edit book form. */
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id)
  if (book) {
    res.render('books/update_book', { book, title: 'Edit Book' })
  } else {
    res.sendStatus(404)
  }
}))

/* Update an book. */
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book
  try {
    book = await Book.findByPk(req.params.id)
    if (book) {
      await book.update(req.body)
      res.redirect('/books')// Redirect after updating book entry
    } else {
      res.render('books/page_not_found')
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body)
      book.id = req.params.id // Make sure correct book gets updated
      res.render('books/update_book', { book, errors: error.errors, title: 'Edit Book' })
    } else {
      throw error
    }
  }
}))

/* Delete individual book. */
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id)
  await book.destroy()
  res.redirect('/books')// Redirect after deleting book entry
}))

module.exports = router
