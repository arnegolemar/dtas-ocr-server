const Student = require('../models/Student');
const StudentClass = require('../modules/StudentClass');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')

const { TryCatch } = require('../routes/middleware/log-helper');
const { GetNewID } = require('../routes/middleware/registration-helper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    studentID = await GetNewID(Student, "studentID", 1, 5, data.batchID);
    studentID = studentID[0].split("-")[0] + "-" + studentID[0].split("-")[2]
    bcrypt.hash("password", 10, function (err, hash) {
      const newStudent = new StudentClass({
        ...data.student,
        password: hash,
        studentID: studentID
      });

      newStudent
        .save()
        .then(data => {
          res.json({ success: true, student: data });
        })
    });
  }, "Add new Student", "Server - api/student.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    const student = new StudentClass({
      ...data.student
    });

    student
      .update()
      .then(data => {
        res.json(data);
      })
      .catch((err) => {
        res.json({ success: false, error: err });
      });
  }, "Add Update Student", "Server - api/student.js -> Line: 19 - 30", 2, req, res);
}

exports.get = (req, res) => {
  TryCatch((res, req) => {

    var data = (req.query.filters) ? JSON.parse(req.query.filters) : {};
    var cond = data.find;

    var keys = Object.keys(cond || []);
    console.log("***********!!!!");
    console.log(cond);
    keys.map((key, i) => {
      regexFilter = new RegExp(["", cond[key], ""].join(""), "i");
      if (key == "name") {
        delete cond[key];
        cond["$or"] = [
          { ["personalInfo.name.first"]: regexFilter }, { ["personalInfo.name.mid"]: regexFilter }, { ["personalInfo.name.last"]: regexFilter }
        ];
      } else {
        cond[key] = regexFilter;
      }
    });

    if (req.query.value) {
      cond = (cond) ? [cond] : [];
      var value = JSON.parse(req.query.value)
      console.log("--------------===");
      console.log(value);
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      if (props == "name") {
        cond.push({ $or: [{ ["personalInfo.name.first"]: regex }, { ["personalInfo.name.mid"]: regex }, { ["personalInfo.name.last"]: regex }] });
      } else {
        cond.push({ [props]: regex });
      }

      cond = {
        $and: cond
      };
    }
    console.log("=============!__");
    console.log(cond);
    StudentClass.getStudents(data.page, data.count, cond, data.sort, data.select)
      .then(students => {
        StudentClass.count(cond).then((count) => {
          res.json({ status: true, data: { students: students, count: count } });
        })
      })
      .catch(error => {
        res.json({ error: 'error message' });
      });

  }, "Get Students", "Server - api/student.js -> Line: 19 - 30", 2, req, res);
}

exports.login = (req, res) => {
  TryCatch((res, req) => {
    var username = req.body.username;
    var password = req.body.password;
    console.log("AAAAAAAAA");
    console.log(username);
    console.log(password);

    Student.find({
      studentID: username,
    })
      .then(student => {
        console.log(student);

        if (student.length == 0) {
          return res.status(404).send();
        }


        bcrypt.compare(password, student[0].password, (err, result) => {
          if (result) {

            const token = jwt.sign(
              {
                id: student[0]._id,
                name: student[0].personalInfo.name,
              },
              'SECRET',
              {
                expiresIn: '1y'
              }
            );

            return res.json({
              info: {
                id: student[0]._id,
                personalInfo: student[0].personalInfo,
                profilePic: student[0].profilePic,
              },
              token: token
            })
          } else {
            return res.status(404).send();
          }
        })

      }).catch(err => {
        return res.status(404).send();
      })


  }, "Login Student", "Server - api/student.js -> Line: 19 - 30", 2, req, res);
}

exports.getMyInfo = (req, res) => {
  TryCatch((res, req) => {
    var student = req.userInfo.id;

    console.log("___________");
    console.log(student);

    StudentClass.getStudents(1, 1, { _id: mongoose.Types.ObjectId(student) })
      .then(students => {
        var toReturn = {
          personalInfo: students[0].personalInfo,
          profilePic: students[0].profilePic,
          _id: students[0]._id,
          studentID: students[0].studentID,
        }
        res.json({
          success: true,
          data: toReturn
        })
      })
      .catch(error => {
        res.json({ error: 'error message' });
      });

  }, "Get Student info", "Server - api/student.js -> Line: 19 - 30", 2, req, res);
}

exports.updatePassword = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    Student.findById(req.userInfo.id, (err, student) => {
      // student.password = password;

      bcrypt.compare(data.old, student.password, (err, result) => {
        if (result) {
          bcrypt.hash(data.new, 10, function (err, hash) {
            student.password = hash;
            student.save()
          });
          res.json({ success: true });

        } else {
          res.json({ success: false, message: "Old Password didn't match" });
        }
      })

    });

  }, "Add Update student Password", "Server - api/student.js -> Line: 19 - 30", 2, req, res);
}