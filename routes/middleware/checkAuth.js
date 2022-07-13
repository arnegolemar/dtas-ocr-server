const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../../config/auth').JWT_SECRET;

module.exports = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    try {
      // verify token
      const decoded = jwt.verify(token, 'SECRET');

      req.userInfo = decoded;

      next(); // go to route
    } catch (e) {
      return res.status(401).json({
        message: 'Unauthorized asdasd!'
      });
    }

  }else {
    return res.status(401).json({
      message: 'Unauthorize asdasdasdasdasdd!'
    });
  }

}
