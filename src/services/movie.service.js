
const DatabaseHandler = require('../utils/DBHandler');
const FilterQuery = require('../utils/FilterQuery');
/**
 * Create a movie
 * @param {Object} movieBody
 * @returns {Promise<Movie>}
 */
const createMovie = async (movieBody) => {
  const dbHandler = new DatabaseHandler();
  return dbHandler.post(movieBody);
};

/**
 * Query for movies
 * @param {Object} filter -  filter
 * @param {Object} options - Query options
 * @param {number} [options.duration] - Sort option in the format: sortField:(desc|asc)
 * @param {Array} [options.genres] - Maximum number of results per page (default = 10)
 * @returns {Promise<QueryResult>}
 */
const queryMovies = async (options) => {
  const dbHandler = new DatabaseHandler();
  const movies = dbHandler.getAll();

  if (options && Object.keys(options).length === 0) {
    return movies[Math.floor(Math.random()*movies.length)];
  }

  const filterHandler = new FilterQuery();
  return filterHandler.filter(movies, options);
};

module.exports = {
  createMovie,
  queryMovies,
};
