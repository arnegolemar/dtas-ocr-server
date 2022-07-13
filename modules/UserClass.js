const User = require('../models/User');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class UserClass {

  constructor(data) {
    this.username = data.username || "";
    this.password = data.password || "";
    this.userType = data.userType || "";
    this.name = data.name || {};
    this.designation = data.designation || "";
    this.status = data.status || "";
    this.office = data.office || null;
    this.role = data.role || null;
    this.pds = data.pds || {};
    this.files = data.files || [];
    this.userID = data.userID || "";
    this._id = data._id || "";
  }

  save() {
    return new Promise((resolve, reject) => {
      var newUser = new User({
        username: this.username,
        password: this.password,
        userType: this.userType,
        name: this.name,
        designation: this.designation,
        status: this.status,
        office: this.office,
        role: this.role,
        pds: this.pds,
        files: this.files,
        userID: this.userID,
      });

      newUser.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update() {
    return new Promise((resolve, reject) => {
      User.findById(this._id, (err, user) => {
        user.username = this.username;
        user.password = this.password;
        user.userType = this.userType;
        user.name = this.name;
        user.designation = this.designation;
        user.status = this.status;
        user.office = this.office;
        user.role = this.role;
        user.pds = this.pds;
        user.files = this.files;
        user.userID = this.userID;
        user.save();
      })
        .then(() => resolve({ status: true }))
        .catch(err => {
          reject({ status: false });
        });

    }); // end promise
  }
  ///================ static methods ======================


  static count(filter = {}) {

    return new Promise(resolve => {
      User
        .find(filter)
        .count()
        .then(count => {
          resolve(count)
        })
    })

  }

  static getUsers(page = 1, count = 10, filter = {}, sort = { 'userID': 1 }, select = []) {
    return new Promise((resolve, reject) => {

      User
        .find(filter)
        .populate({ path: "office" })
        .populate({ path: "role" })
        .sort(sort)
        .select(select)
        .skip((page * count) - count)
        .limit(count)
        .then(data => {
          resolve(data)
        }).
        catch(err => {
          reject({
            status: false,
            error: err
          })
        })

    })

  }

  static getUserDetail(cond) {
    return new Promise(resolve => {
      User
        .find(cond)
        .then(data => {
          resolve(data)
        })
    })
  }

  static updateFile(id, newFile) {
    return new Promise((resolve, reject) => {

      // User.updateOne({
      //   _id: mongoose.Types.ObjectId(id)
      // }, {

      // });

      User.findById(id, (err, user) => {
        var files = [...user.files]

        if (newFile.type != "certificate") {
          for (let i = 0; i < files.length; i++) {
            if (files[i].type == newFile.type && files[i].status == "current") {
              files[i].status = "old";
            }
          }

        }

        files = [...files, newFile]

        User.findByIdAndUpdate(id, { files: files }, { new: true }, (err, docs) => {

          if (!err) {
            resolve({ status: true, files: docs.files })
          } else {
            reject({ status: false });

          }
        })

      }, { new: true })
        .then((data) => {

        })
        .catch(err => {
        });

    }); // end promise
  }

  static updateFilesList(userId, files) {
    return new Promise((resolve, reject) => {
      User.findById(userId, (err, user) => {

        user.files = files;
        user.save();
      })
        .then(() => resolve({ success: true }))
        .catch(err => {
          reject({ success: false, error: err });
        });

    }); // end promise
  }

}

module.exports = UserClass;
