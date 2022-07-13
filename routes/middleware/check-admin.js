//check if user's type is admin
module.exports = (req, res, next) => {
  if (req.userInfo.type = "admin"){
    next();
  }else {
    return res.status(401).json({
      message: 'Unauthorized!'
    });
  }
}
