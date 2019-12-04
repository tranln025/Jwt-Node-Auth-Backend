const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ')[1];
    let payload = jwt.verify(token, 'super_secret_key');
    req.userId = payload._id; //set user id for routes to use
    next();
  } else {
    res.sendStatus(403);
  }
};
