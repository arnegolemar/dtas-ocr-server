const express = require('express');
const router = express.Router();
const User = require('../../controllers/user');
const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');

router.get('/get', User.get);

router.post('/new', checkAuth, checkAdmin, User.new);

router.post('/update', checkAuth, User.update);

router.post('/update-files', checkAuth, User.updateFilesList);

router.post('/login', User.login);

router.post('/update-password', checkAuth, User.updatePassword);

router.post('/upload-file', checkAuth, User.uploadFile);

router.get('/check-similar-account', User.checkSimilarAccount)

router.get('/checkpassword', checkAuth, User.checkpassword);

router.get('/get-my-info', checkAuth, User.getMyInfo);

router.get('/get-file', checkAuth, User.getFile);

router.get('/get-notifs', User.getNotifs);



// // @route   Get api/item
// // @desc    get items
// // @access  Public


// router.get('/generate-password', (req, res) => {

//   bcrypt.hash('password', 10, function(err, hash) {
//   // Store hash in your password DB.
//     return res.json({password: hash})
//   });


// });

// router.get('/checkpassword', checkAuth, (req, res) => {
//   TryCatch((res, req) => {

//     User
//       .find({
//         _id: mongoose.Types.ObjectId(req.userInfo.id)
//       })
//       .select("password")
//       .then(data => {
//           bcrypt.compare(req.query.password, data[0].password, (err, result) => {
//               res.json(result);
//           });    
//       })
//   }, "Check Password", "Server - api/admin/user.js -> Line: 19 - 30", 2, req, res);
// });

// router.post('/savepassword', checkAuth, (req, res) => {
//   TryCatch((res, req) => {

//     bcrypt.hash(req.body.password, 10, function(err, hash) {
//       User.findById(mongoose.Types.ObjectId(req.userInfo.id), (err, user) => {
//         user.password   = hash,
//         user.save();
//       })
//         .then(data => {
//           res.json({status: true})
//         })
//         .catch(err => {
//           res.json({status: false, error: err})
//         })
//     });
//   }, "Save New Password", "Server - api/admin/user.js -> Line: 19 - 30", 2, req, res);

// });

// router.get('/', checkAuth, (req, res) => {

//   // var q = (req.data.q == undefined) ? '' : req.data.q;

//   User.find({}, {password: 0})
//     .populate({path: 'branch'})
//     .populate({path: 'role'})
//     .then(users => {
//       return res.json(users);
//     })
//     .catch(err => {
//       return res.status(404).send();
//     })


// });



module.exports = router;
