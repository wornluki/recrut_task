const ApiError = require('../utils/ApiError');

const validateToken = async (req, resolve, reject) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    const token = req.headers.authorization.split(' ')[1];
    if (token !== 'valid-token') {
      return reject(new ApiError(401, "Unauthorized"));
    }
    return resolve(true);
  } else {
    return reject(new ApiError(401, "Unauthorized"));
  }
}

const auth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    validateToken(req, resolve, reject)
  }).then(() => {
    next();
  }).catch(err => {
    next(err);
  })
};

module.exports = auth;
