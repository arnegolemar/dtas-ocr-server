const Log = require('../../models/Log');

function TryCatch (callback, functionality, location, level, req, res) {
  try {
    callback(res, req);
  } catch (e){
    res.json({success: false, msg: e.message});

    var sockets = Object.keys(req.io.of('/admin').sockets);
    console.log(sockets);


    const error = new Log({
      message: e.message,
      level: level,
      functionality: functionality,
      location: location,
    });
    error.save().then((data) => {
      req.io.of('/admin').emit('log-error', data);
    });
  }
  return 1;
}

module.exports = {
	TryCatch
}
