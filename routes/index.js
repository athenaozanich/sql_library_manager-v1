const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Book = require('../models').Book;
/* Handler function to wrap each route. */
function asyncHandler (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
}
const paginate = (page, pageSize) => {
  const offset = page * pageSize;
  const limit = pageSize;

  return {
    offset,
    limit
  };
}
/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books/pg/1/');
}));

/* GET books listing. */
router.get('/books/pg/:pgNum/', asyncHandler(async (req, res) => {
  const currPg = req.params.pgNum || 1;
  const bksPrPg = 5;
  const { count, rows } = await Book.findAndCountAll({
    ...paginate(req.params.pgNum -1, bksPrPg)
  });
  const numOfPgs = Math.ceil(count / bksPrPg);
  const books = rows;
  const routePath = "/books/pg/";
  console.log(currPg);
  res.render('index', { routePath, currPg, numOfPgs, books, title: 'Library Inventory Manager' })
}));

router.get('/books/results/pg/:pgNum/', asyncHandler(async (req, res) => {
  const currPg = req.params.pgNum || 1;
  const bksPrPg = 5;
  const requestedQry = { [Op.like]: `%${req.query.query}%` }
  const { count, rows } = await Book.findAndCountAll({
    where: {
      [Op.or]: [
        {
          title: requestedQry
        },
        {
          author: requestedQry
        },
        {
          genre: requestedQry
        },
        {
          year: requestedQry
        }
      ]
    },
    ...paginate(req.params.pgNum -1 , bksPrPg)
  });
  const numOfPgs = Math.ceil(count / bksPrPg);
  const books = rows;
  const routePath = "/books/results/pg/";
  res.render('index', { qry: req.query.query, routePath, currPg, numOfPgs, books, title: 'Library Inventory Manager' });
}));

/* Create a new book form. */
router.get('/books/new/', asyncHandler(async (req, res) => {
  res.render('books/new_book', { book: {}, title: 'New Book' });
}));

/* POST create book. */
router.post('/books/new/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/pg/1/');// redirect after book entry creation
  } catch (error) {
    if (error.name === 'SequelizeValidationError') { // checking the error
      book = await Book.build(req.body);
      res.render('books/new_book', { book, errors: error.errors, title: 'New Book' });
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }
  }
}));

/* Edit book form. */
router.get('/books/:id/', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render('books/update_book', { book, title: 'Edit Book' });
}));

/* Update an book. */
router.post('/books/:id/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/books/pg/1/');// Redirect after updating book entry
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id; // Make sure correct book gets updated
      res.render('books/update_book', { book, errors: error.errors, title: 'Edit Book' });
    } else {
      throw error;
    }
  }
}));

/* Delete individual book. */
router.post('/books/:id/delete/', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect('/books/pg/1/');// Redirect after deleting book entry
}));

module.exports = router;
