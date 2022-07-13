const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const checkAuth = require('../middleware/checkAuth');
const checkAdmin = require('../middleware/check-admin');
const { GetNewUserID }    = require('../middleware/registration-helper');

const AdminClass = require('../../modules/AdminClass');
const UserClass = require('../../modules/UserClass');
const { TryCatch }    = require('../middleware/log-helper');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./client/public/images/avatar/admin");
    },
    filename: (req, file, cb) => {
      console.log(req);
      console.log(file);
        cb(null, new Date().toISOString().split("T")[0] + "-" + file.originalname);
    }
});
const upload = multer({storage: storage});

function arrangeNumber (value, places) {
  var valLen = (value+"").length;
  if (valLen >= places)
    return value

  var zeros = "";

  while (valLen++ < places)
    zeros = zeros + "0";
  return zeros + (value + "");
}

function generateEmployeeID () {
  return new Promise ((resolve, reject) => {
    AdminClass
    .count({})
    .then(data => {
      console.log(data);
      var date = new Date().getFullYear() + "";

      resolve("JVVA" + (date[2] + "" + date[3]) + "-" + (arrangeNumber(data*1, 4)));
    })
    .catch(err => {
      console.log(err);
      reject();
    })    
  })
}

router.post('/avatar/save', upload.single("picture"), checkAuth, checkAdmin, (req, res) => {
  TryCatch((res, req) => {
    const avatar  = req.file;
    res.json({success: true, filename: avatar.filename})
  }, "Save Admin User image", "Server - api/admin/driver.js -> Line: 67 - 72", 3, req, res);
});

router.post('/user/new', (req, res) => {
  TryCatch((res, req) => {
    var user = req.body.adminUser;
    console.log(user);
    console.log({
      ...user,
      accountInfo: {
        ...user.accountInfo,
        username: user.personalInfo.name.first.toLowerCase().split(" ")[0] + "." + user.personalInfo.name.last.toLowerCase(),
        password: "",
      }
    });

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash("transeek123", salt, function(err, hash) {
        generateEmployeeID()
          .then(empID => {
            const newAdminUser = new AdminClass({
              ...user,
              accountInfo: {
                ...user.accountInfo,
                username: user.personalInfo.name.first.toLowerCase().split(" ")[0] + "." + user.personalInfo.name.last.toLowerCase(),
                password: hash,
              },
              employeeID: empID,
              role: "5d707914c27c6431cc716b8e",
              position: "HEAD ADMIN",
            });  
    
            newAdminUser.save()
              .then((user) => {
                res.json({status: true, user: user});
              })
              .catch(err => res.json({status:false, error: err}));
          })
          .catch(err => {
            res.json({status: false, error: err});
          });

      });
    });
    
  }, "Add new Admin User", "Server - api/admin/adminUser.js -> Line: 19 - 30", 2, req, res);
});

router.post('/user/update', (req, res) => {
  TryCatch((res, req) => {
    var user = req.body.user;
    // console.log(user);
    console.log({
      ...user,
    });

    const newAdminUser = new UserClass({
      ...user,
    });  

    newAdminUser.update()
    .then((user) => {
      console.log("_________");
      console.log(user);
      res.json({status: true});
    })
    .catch(err => res.json({status:false, error: err}));
    
  }, "Add new Admin User", "Server - api/admin/adminUser.js -> Line: 19 - 30", 2, req, res);
});

router.get('/user/get', (req, res) => {
  TryCatch((res, req) => {
    var data = (req.query.filters)?JSON.parse(req.query.filters):{};
    var cond = data.find;
    if (req.query.value){
      cond = [cond];
      var value = JSON.parse(req.query.value)
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      cond.push({[props]: regex});
      
      cond = {
        $and: cond
      };
    }

    AdminClass.getAdminUsers(data.page, data.count, cond, data.sort, data.select)
      .then(users => {
        AdminClass.count(cond).then((count) => {
          res.json({status: true, data:{ adminUsers: users, count: count}});
        })
      })
      .catch(error => {
        res.json({error: 'error message'});
      });

  }, "Get Admin Users", "Server - api/admin/adminUser.js -> Line: 19 - 30", 2, req, res);
});

router.post('/role/add', (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;
    console.log(data);
    AdminClass
      .createNewRole(data.role.name, data.role.routes)
      .then(data => {
        res.json({status: true, role: data});
      })
  }, "Add new Role", "Server - api/admin/adminUser.js -> Line: 19 - 30", 2, req, res);
});

router.post('/role/update', (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;
    console.log(data);
    AdminClass
      .updateRole(data.role._id, data.role.name, data.role.routes)
      .then(data => {
        res.json({status: true, role: data});
      })
      .catch((err) => {
        res.json({status: false, error: err});
      });
  }, "Add Update Role", "Server - api/admin/adminUser.js -> Line: 19 - 30", 2, req, res);
});

router.get('/role/get', (req, res) => {
  TryCatch((res, req) => {
    var data = (req.query.filters)?JSON.parse(req.query.filters):{};
    var cond = data.find;
    if (req.query.value){
      cond = [cond];
      var value = JSON.parse(req.query.value)
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      cond.push({[props]: regex});
      
      cond = {
        $and: cond
      };
    }

    AdminClass.getRoles(data.page, data.count, cond, data.sort, data.select)
      .then(roles => {
        AdminClass.countRoles(cond).then((count) => {
          res.json({status: true, data:{ roles: roles, count: count}});
        })
      })
      .catch(error => {
        res.json({error: 'error message'});
      });

  }, "Get Roles", "Server - api/admin/adminUser.js -> Line: 19 - 30", 2, req, res);
});

router.get('/user/detail', checkAuth, checkAdmin, (req, res) => {
  TryCatch((res, req) => {
    var data = req.query;

    AdminClass
      .getAdminUserDetail({[data.prop]: data.value})
      .then(data => {
        res.json({status: true, adminUser: data});
      })
  }, "Get Admin User Detail", "Server - api/admin/adminUser.js -> Line: 19 - 30", 2, req, res);
});

module.exports = router;
