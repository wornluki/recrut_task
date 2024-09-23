const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { movieService } = require('../services');

const createMovie = catchAsync(async (req, res) => {
  const movie = await movieService.createMovie(req.body);
  res.status(httpStatus.CREATED).send(movie);
});

const getMovies = catchAsync(async (req, res) => {
  const options = pick(req.query, ['duration', 'genres']);
  const result = await movieService.queryMovies(options);
  res.send(result);
});

module.exports = {
  createMovie,
  getMovies
};
