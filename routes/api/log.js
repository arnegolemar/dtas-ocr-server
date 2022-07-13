const express = require('express');
const router = express.Router();

// Places Model
const Log = require('../../models/Log');
const {TryCatch}    = require('../middleware/log-helper');

// @route   GET api/log
// @desc    Get All Logs
// @access  Public
router.get('/', (req, res) => {
  console.log((req.query.number*10) - 10);
  TryCatch((res, req) => {
    Log.find()
      .sort({ date: -1 })
      .skip((req.query.number*10) - 10)
      .limit(10)
      .then(log => {

        Log.aggregate(
           [
             {
                 $project: {
                     resolved: {  // Set to 1 if value < 10
                         $cond: [ { $eq: ["$resolved", 1 ] }, 1, 0]
                     },
                     unresolved: {  // Set to 1 if value > 10
                         $cond: [ { $eq: [ "$resolved", 0 ] }, 1, 0]
                     },
                     viewed: {  // Set to 1 if value < 10
                         $cond: [ { $eq: ["$viewed", 1 ] }, 1, 0]
                     },
                     unviewed: {  // Set to 1 if value > 10
                         $cond: [ { $eq: [ "$viewed", 0 ] }, 1, 0]
                     }
                 }
             },
             {
                 $group: {
                     _id: null,
                     resolved: { $sum: "$resolved" },
                     unresolved: { $sum: "$unresolved" },
                     viewed: { $sum: "$viewed" },
                     unviewed: { $sum: "$unviewed" }
                 }
             }
           ],
        )
        .then(count => {
            res.json({log: log, count: count[0]})
        });

      });
  }, "Get All Logs", "Server - api/logs.js -> Line: 13 - 15", 1, req, res);
});

// @route   POST api/log
// @desc    set status of log to viewed
// @access  Public
router.post('/viewed', (req, res) => {
  TryCatch((res, req) => {
    Log
      .findById(req.body.id, (err, log) => {
        log.viewed = 1;
        log.save();
      })
      .then(log => res.json({success: true}))
      .catch(err => {
        res.json({success: false, error: err});
      });
  }, "set status of log to viewed", "Server - api/logs.js -> Line: 30 - 38", 1, req, res);
}); 

// @route   POST api/log
// @desc    set status of log to resolved
// @access  Public
router.post('/resolved', (req, res) => {
  TryCatch((res, req) => {
    console.log(req.body);
    Log
      .findById(req.body.id, (err, log) => {
        log.resolved = 1;
        log.comment = req.body.comment;
        log.save();
      })
      .then(log => res.json({success: true}))
      .catch(err => {
        res.json({success: false, error: err});
      });
  }, "set status of log to resolved", "Server - api/logs.js -> Line: 47 - 55", 1, req, res);
});


// @route   POST api/log
// @desc    Save User Logs
// @access  Public
router.post('/usercomment', (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;
    var sockets = Object.keys(req.io.of('/admin').sockets);
    const error = new Log({
      message: data.message,
      level: data.level,
      functionality: data.functionality,
      location: data.location,
    });

    error.save().then((data) => {
      res.json({success: true});
      req.io.of('/admin').emit('log-error', data);
    });
  }, "Save User Logs", "Server - api/logs.js -> Line: 97 - 107", 1, req, res);
});


module.exports = router;
