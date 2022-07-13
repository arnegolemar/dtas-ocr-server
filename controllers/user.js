const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')

const User = require('../models/User');
const Document = require('../models/Document');
const UserClass = require('../modules/UserClass');
const StudentClass = require('../modules/StudentClass');
const NotifClass = require('../modules/NotifClass');
const DocumentClass = require('../modules/DocumentClass');

const { TryCatch } = require('../routes/middleware/log-helper');
const { GetNewID } = require('../routes/middleware/registration-helper');

const nodeTesseractOcr = require("node-tesseract-ocr")
const pdf2pic = require("pdf2pic");//fromPath
const PDFImage = require("pdf-image").PDFImage;
const pdf2img = require('pdf2img');
const { ocrSpace } = require('ocr-space-api-wrapper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;
    userID = await GetNewID(User, "userID", 1, 3, "APP");
    bcrypt.hash('password', 10, function (err, hash) {
      // Store hash in your password DB.
      var newUser = new User({
        username: (data.name.first + "." + data.name.last).replace(/\s/g, '').toLowerCase(),
        password: hash,
        name: data.name,
        designation: data.designation,
        status: data.status,
        office: data.office,
        pds: data.pds,
        role: data.role,
        userID: userID[0],
        userType: 0,
      });

      newUser.save()
        .then(user => {
          res.json({ success: true, user: user });
        })
        .catch(err => {
          res.json({ success: false, error: err });
        })
    });
  }, "Add new User", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;
    const user = new UserClass({
      ...data
    });

    user
      .update()
      .then(data => {
        res.json({ success: true, users: data });
      })
      .catch((err) => {
        res.json({ success: false, error: err });
      });
  }, "Add Update User", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.get = (req, res) => {
  TryCatch((res, req) => {

    var data = (req.query.filters) ? JSON.parse(req.query.filters) : {};
    var cond = data.find;

    var keys = Object.keys(cond || []);
    keys.map((key, i) => {
      regexFilter = new RegExp(["", cond[key], ""].join(""), "i");
      if (key == "name") {
        delete cond[key];
        cond["$or"] = [
          { ["name.first"]: regex }, { ["name.mid"]: regex }, { ["name.last"]: regex }
        ];
      } else {
        cond[key] = regexFilter;
      }
    });

    if (req.query.value) {
      cond = (cond) ? [cond] : [];
      var value = JSON.parse(req.query.value)
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      if (props == "name") {
        cond.push({ $or: [{ ["name.first"]: regex }, { ["name.mid"]: regex }, { ["name.last"]: regex }] });
      } else {
        cond.push({ [props]: regex });
      }

      cond = {
        $and: cond
      };
    }


    UserClass.getUsers(data.page, data.count, cond, data.sort, data.select)
      .then(users => {
        UserClass.count(cond).then((count) => {
          res.json({ status: true, data: { users: users, count: count } });
        })
      })
      .catch(error => {
        res.json({ error: 'error message' });
      });

  }, "Get Users", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.login = (req, res) => {
  TryCatch((res, req) => {
    var username = req.body.username;
    var password = req.body.password;
    User.find({
      username: username,
      userType: "0"
    })
      .populate('office')
      .populate('role')
      .then(user => {
        if (user.length == 0) {
          return res.status(404).send();
        }


        bcrypt.compare(password, user[0].password, (err, result) => {
          if (result) {

            const token = jwt.sign(
              {
                id: user[0]._id,
                name: user[0].name,
                role: user[0].role,
                office: user[0].office,
                designation: user[0].designation,
                // routes: user[0].routes
              },
              'SECRET',
              {
                expiresIn: '1y'
              }
            );

            return res.json({
              info: {
                name: user[0].name,
                office: user[0].office,
                role: user[0].role,
                username: user[0].username,
                designation: user[0].designation,
                status: user[0].status,
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


  }, "Login User", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.checkSimilarAccount = (req, res) => {
  TryCatch((res, req) => {

    var name = JSON.parse(req.query.user);

    var regex = new RegExp(["", name.first.toLowerCase(), ""].join(""), "i");
    var regex2 = new RegExp(["", name.last.toLowerCase(), ""].join(""), "i");


    UserClass.getUsers(1, 1000, { $or: [{ ["name.first"]: regex }, { ["name.last"]: regex2 }] })
      .then(users => {
        res.json({ status: true, data: { users: users } });
      })
      .catch(error => {
        res.json({ error: 'error message' });
      });


  }, "Login User", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.checkpassword = (req, res) => {
  TryCatch((res, req) => {
    User
      .find({
        _id: mongoose.Types.ObjectId(req.userInfo.id)
      })
      .select("password")
      .then(data => {
        bcrypt.compare(req.query.password, data[0].password, (err, result) => {
          res.json({ match: result });
        });
      })
  }, "Check password", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.getMyInfo = (req, res) => {
  TryCatch((res, req) => {
    User
      .find({
        _id: mongoose.Types.ObjectId(req.userInfo.id)
      })
      .then(data => {
        res.json({ info: data });
      })
  }, "Check password", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.updatePassword = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    // User.find({
    //   _id: mongoose.Types.ObjectId(req.userInfo.id)
    // })
    //   .then(user => {

    //     bcrypt.compare(data.old, user[0].password, (err, result) => {
    //       if (result) {

    //       } else {
    //         return res.status(404).send();
    //       }
    //     })

    //   }).catch(err => {
    //     return res.status(404).send();
    //   })
    User.findById(req.userInfo.id, (err, user) => {
      // user.password = password;

      bcrypt.compare(data.old, user.password, (err, result) => {
        if (result) {
          bcrypt.hash(data.new, 10, function (err, hash) {
            user.password = hash;
            user.save()
          });
          res.json({ status: true });

        } else {
          res.json({ status: false, message: "Old Password didn't match" });
        }
      })

    });

  }, "Add Update User Password", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.uploadFile = (req, res) => {
  TryCatch((res, req) => {

    const userID = (req.body.hasOwnProperty("userId")) ? req.body.userId : req.userInfo.id;
    const type = req.body.type,
      name = req.body.name,
      path = req.body.path;
    file = req.files.file;

    var filePath = "";

    if (type == "avatar") {
      filePath = 'client/public/images/users/' + path;
    } else if (type == "students") {
      filePath = 'client/public/images/students/' + path;
    } else if (type == "student-files") {
      filePath = 'client/public/images/student-files/' + path;
    } else {
      filePath = 'client/public/other-files/' + type + '/' + path;
    }

    file.mv(filePath, async (err) => {
      if (err) {
        res.json({ status: false, message: "Error: Failed to Upload File" });
      } else {
        const fileSave = {
          type: type,
          status: "current",
          dateUploaded: new Date(),
          name: name,
          path: path,
        };

        if (type == "avatar") {
          UserClass
            .updateFile(userID, {
              ...fileSave
            })
            .then((result) => {
              if (result.status) {
                res.json({ status: true, message: "File Successfully Uploaded", files: result.files });
              } else {
                res.json({ status: true, message: "Failed to Update Info" });
              }
            })

        } else if (type == "students") {

          StudentClass
            .updateFile(req.body.studentId, {
              ...fileSave
            })
            .then((result) => {
              if (result.status) {
                res.json({ status: true, message: "File Successfully Uploaded", files: result.files });
              } else {
                res.json({ status: true, message: "Failed to Update Info" });
              }
            })

        } else if (type == "student-files") {

          // pdf2img.setOptions({
          //   type: 'png',                                // png or jpg, default jpg
          //   size: 1024,                                 // default 1024
          //   density: 600,                               // default 600
          //   outputdir: 'client/public/images/student-files/converted', // output folder, default null (if null given, then it will create folder name same as file name)
          //   outputname: 'test',                         // output file name, dafault null (if null given, then it will create image name same as input name)
          //   page: null                                  // convert selected page, default null (if null given, then it will convert all pages)
          // });

          // pdf2img.convert(filePath, (err, info) => {
          // });

          // var pdfImage = new PDFImage(filePath);

          // pdfImage.convertFile(0).then((imagePaths) => {
          //   // [ /tmp/slide-0.png, /tmp/slide-1.png ]
          // })
          // .catch(err => {
          // })

          // const options = {
          //   density: 100,
          //   saveFilename: name,
          //   savePath: "./converted",
          //   format: "png",
          //   width: 600,
          //   height: 600
          // };
          // const storeAsImage = pdf2pic.fromPath(filePath, options);
          // const pageToConvertAsImage = 1;
          // storeAsImage(pageToConvertAsImage).then((resolve) => {
          //   return resolve;
          // });
          var ext = filePath.split(".");
          ext = ext[ext.length - 1];
          var documentType = (ext == "pdf") ? "pdf" : "image";

          const config = {
            lang: "eng",
            oem: 1,
            psm: 3,
          }

          var documentID = await GetNewID(Document, "documentID", 1, 5, "FILE");

          var contextSCO = {
            id: "REQUEST FOR COURSE OFFERING",
            fields: {
              date: "",
              sem: "",
              ay: "",
              course: {
                code: "",
                title: "",
              },
            }
          }

          var contextCompletion = {
            id: "STUDENT'S PERSONAL AND ACADEMIC INFORMATION",
            fields: {
              date: { type: Date, default: Date.now },
              course: {
                code: { type: String },
                title: { type: String },
              },
              student: {
                fname: { type: String },
                lname: { type: String },
                id: { type: String },
                yr: { type: String },
                as: { type: String }, //academic standing
              },
              grade: { type: String },
              faculty: { type: String },
            }
          };

          var contextUnitover = {
            id: "UNIT LOAD OVERRIDE APPROVAL FORM",
            fields: {
              date: { type: Date, default: Date.now },
              sem: { type: String },
              ay: { type: String },
              student: {
                fname: { type: String },
                lname: { type: String },
                id: { type: String },
                yr: { type: String },
                as: { type: String }, //academic standing
              },
              units: {
                earned: { type: String },
                approved: { type: String },
              },
            }
          };

          var contextEBS = {
            id: "FACILITY [EQUIPMENT USE",
            fields: {
              date: { type: Date, default: Date.now },
              student: {
                fname: { type: String },
                lname: { type: String },
                id: { type: String },
              },

              facEquip: { type: String },
              college: { type: String },
              dept: { type: String },
            }
          };

          var temp = "";

          if (documentType == "image") {
            nodeTesseractOcr
              .recognize(filePath, config)
              .then(async (text) => {

                //   ...fileSave,
                //   type: fileSave.name.split("~")[1],
                // });

                // StudentClass
                //   .updateFile(req.body.studentId, {
                //     ...fileSave,
                //     type: fileSave.name.split("~")[1],
                //   })
                //   .then((result) => {
                //     if (result.status) {
                //       res.json({ status: true, message: "File Successfully Uploaded", files: result.files });
                //     } else {
                //       res.json({ status: true, message: "Failed to Update Info" });
                //     }
                //   })


                // =================  SAVE TO DOCUMENT MODEL

                const currentAction = {
                  status: "received",
                  remarks: "First Uploaded",
                  office: req.userInfo.office._id,
                  officeFrom: null,
                  receivedBy: req.userInfo.id,
                  movedBy: null,
                };

                const newDocument = new DocumentClass({
                  ...fileSave,
                  documentID: documentID[0],
                  owner: (req.body.studentId == "" || req.body.studentId == null) ? null : req.body.studentId,
                  ownerOffice: (req.body.studentId == "" || req.body.studentId == null) ? req.userInfo.office._id : null,
                  type: fileSave.name.split("~")[1],
                  tags: "",
                  content: "",
                  currentAction: currentAction,
                  actions: [{
                    ...currentAction
                  }]
                });

                newDocument
                  .save()
                  .then(data => {
                    // res.json({ status: true, document: data });
                    res.json({ status: true, message: "File Successfully Uploaded", files: data });
                  })
                  .catch(err => {
                    res.json({ status: true, message: "Failed to Upload File" });
                  })
                // =================  CLOSE


              })
              .catch((error) => {
              })

          } else if (documentType == "pdf") {
            const res2 = await ocrSpace(filePath, { apiKey: 'K84528173688957' });

            var content = res2.ParsedResults[0].ParsedText;
            var splitted = content.split("\r\n");
            var context = {};

            console.log("---------------- START ----------------");
            console.log(splitted);
            if (content.includes(contextSCO.id)) {
              console.log(contextSCO.id);
              context = {
                date: "",
                sem: "",
                ay: "",
                course: {
                  code: "",
                  title: "",
                },
              };

              for (let x = 0; x < splitted.length; x++) {
                if (splitted[x].includes("Date:")) {
                  temp = new Date(splitted[x].split(":")[1].trim(" "));
                  temp.setTime(temp.getTime() + (8 * 60 * 60 * 1000));
                  context.date = temp;
                } else if (splitted[x].includes("We would like to request the offering ofthe following subjects this")) {
                  temp = splitted[x].split(",")
                  context.ay = temp[1].trim(" ");

                  temp = splitted[x].split(" ");
                  for (let y = 0; y < temp.length; y++) {
                    if (temp[y].toLocaleLowerCase().includes("semester")) {
                      context.sem = temp[y - 1];
                    }
                  }
                } else if (splitted[x].includes("CODE")) {
                  context.course.code = splitted[x + 1].trim(" ");
                } else if (splitted[x].includes("COURSE TITLE")) {
                  context.course.title = splitted[x + 1].trim(" ");
                }
              }
            } else if (content.includes(contextCompletion.id)) {
              console.log(contextCompletion.id);
              context = {
                date: { type: Date, default: Date.now },
                course: {
                  code: { type: String },
                  title: { type: String },
                },
                student: {
                  fname: { type: String },
                  lname: { type: String },
                  id: { type: String },
                  yr: { type: String },
                  as: { type: String }, //academic standing
                },
                grade: { type: String },
                faculty: { type: String },
              }
            } else if (content.includes(contextUnitover.id)) {
              console.log(contextUnitover.id);
              context = {
                date: "",
                sem: "",
                ay: "",
                student: {
                  fname: "",
                  lname: "",
                  id: "",
                  yr: "",
                  as: "", //academic standing
                  prog: "",
                },
                units: {
                  earned: "",
                  approved: "",
                },
              }

              for (let x = 0; x < splitted.length; x++) {
                if (splitted[x].includes("IDNo_")) {
                  context.student.id = splitted[x].split(":")[1].trim(" ");
                } else if (splitted[x].includes("Name:")) {
                  temp = splitted[x].split(":")[1].trim(" ");
                  temp = temp.split(",");
                  context.student.fname = temp[0].trim(" ");
                  context.student.lname = temp[1].trim(" ");
                } else if (splitted[x].includes("Program:")) {
                  context.student.prog = splitted[x].split(":")[1].trim(" ");
                } else if (splitted[x].includes("Academic Standing:")) {
                  context.student.as = splitted[x].split(":")[1].trim(" ");
                } else if (splitted[x].includes("Total No. Units Earned")) {
                  context.units.earned = splitted[x].split(":")[1].trim(" ");
                } else if (splitted[x].includes("F UNITS APPROVED:")) {
                  context.units.approved = splitted[x].split(":")[1].trim(" ");
                } else if (splitted[x].includes("TERM:")) {
                  context.sem = splitted[x + 1].trim(" ");
                  context.ay = splitted[x + 1].trim(" ");
                }


              }

            } else if (content.includes(contextEBS.id)) {
              console.log(contextEBS.id);
              context = {
                date: "",
                student: {
                  fname: "",
                  lname: "",
                  id: "",
                },

                facEquip: "",
                college: "",
                dept: "",
              }
              for (let x = 0; x < splitted.length; x++) {
                if (splitted[x].includes("Facility/ Equipment/s Requested")) {
                  context.facEquip = splitted[x].split(":")[1].trim(" ");
                } else if (splitted[x].includes("Date of Use")) {
                  temp = new Date(splitted[x].split(":")[1].trim(" "));
                  temp.setTime(temp.getTime() + (8 * 60 * 60 * 1000));
                  context.date = temp;
                } else if (splitted[x].includes("Name of Requisitioner & Signature:")) {
                  temp = splitted[x].split(":");
                  if (temp[1] == "") {
                    context.student = {
                      fname: splitted[x + 1],
                      lname: splitted[x + 1],
                      id: "",
                    }
                  } else {
                    context.student = {
                      ...context.student,
                      fname: temp[1]
                    }
                  }
                } else if (splitted[x].includes("College / Department (Course & yr. If applicable)")) {
                  temp = splitted[x].split(":");
                  context.college = temp[1];
                  context.dept = temp[1];
                }
              }



            } else {
              console.log("NONE");
            }
            console.log("**************!!!!!!!");
            console.log(context);
            
            const currentAction = {
              status: "received",
              remarks: "First Uploaded",
              office: req.userInfo.office._id,
              officeFrom: null,
              receivedBy: req.userInfo.id,
              movedBy: null,
            };

            console.log("^^^^^^^^^^^^^^^^^^^^^^");
            console.log(context);

            const newDocument = new DocumentClass({
              ...fileSave,
              documentID: documentID[0],
              owner: (req.body.studentId == "" || req.body.studentId == null) ? null : req.body.studentId,
              ownerOffice: (req.body.studentId == "" || req.body.studentId == null) ? req.userInfo.office._id : null,
              type: fileSave.name.split("~")[1],
              tags: "",
              context: context,
              content: "",
              currentAction: currentAction,
              actions: [{
                ...currentAction
              }]
            });

            newDocument
              .save()
              .then(data => {
                // res.json({ status: true, document: data });
                res.json({ status: true, message: "File Successfully Uploaded", files: data });
              })
              .catch(err => {
                res.json({ status: true, message: "Failed to Upload File" });
              })
            // =================  CLOSE

          }


        }

      }
    })
  }, "Check password", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.updateFilesList = (req, res) => {
  TryCatch((res, req) => {

    const userID = (req.body.hasOwnProperty("userId")) ? req.body.userId : req.userInfo.id;

    UserClass
      .updateFilesList(userID, req.body.files)
      .then((result) => {
        if (result.success) {
          res.json({ success: true, message: "Files Successfully Updated" });
        } else {
          res.json(result);
        }
      })
      .catch(err => {
        res.json({ success: false, error: err });
      })


  }, "Update Files List", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.getFile = (req, res) => {
  TryCatch((res, req) => {
    var filename = req.query.filename;
    const file = `client/public/other-files/pds/${filename}`;
    res.download(file); // Set disposition and send it.
  }, "Get File", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}

exports.getNotifs = (req, res) => {
  TryCatch((res, req) => {

    NotifClass
      .getNotifs(1, 10, {
        receivers: { $elemMatch: { id: mongoose.Types.ObjectId("6200bd35156c17279c12cdaa") } }
      })
      .then(data => {
        res.json({ data: data })
      })
      .catch(err => {
        res.json({ error: err })
      })


  }, "Save Job", "Server - api/user.js -> Line: 19 - 30", 2, req, res);
}