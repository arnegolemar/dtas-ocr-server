const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class StudentClass {

  constructor(data) {
    this.personalInfo = (data.personalInfo) ? data.personalInfo : "";
    this.createdAt = (data.createdAt) ? data.createdAt : "";
    this.studentID = (data.studentID) ? data.studentID : "";
    this.password = (data.password) ? data.password : "";
    this.files = (data.files) ? data.files : [];
    this.profilePic = (data.profilePic) ? data.profilePic : {};
    this._id = (data._id) ? data._id : "";
  }

  save() {
    return new Promise((resolve, reject) => {
      var newStudent = new Student({
        personalInfo: this.personalInfo,
        files: this.files,
        studentID: this.studentID,
        profilePic: this.profilePic,
        password: this.password,
      });

      newStudent.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update() {
    return new Promise((resolve, reject) => {
      Student.findById(this._id, (err, student) => {
        student.personalInfo = this.personalInfo;
        student.profilePic = this.profilePic;
        student.files = this.files;
        student.save();
      })
        .then((data) => {

          resolve({ success: true });
        })
        .catch(err => {
          reject({ success: false });
        });

    }); // end promise
  }
  ///================ static methods ======================

  static count(filter = {}) {

    return new Promise(resolve => {
      Student
        .find(filter)
        .count()
        .then(count => {
          resolve(count)
        })
    })

  }

  static getStudents(page = 1, count = 10, filter = {}, sort = { 'studentID': 1 }, select = []) {

    return new Promise((resolve, reject) => {

      Student
        .find(filter)
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

  static getStudents2(page = 1, count = 10, filter = {}, sort = { 'studentID': 1 }, select = []) {

    return new Promise((resolve, reject) => {

      Student
        .find(filter)
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

  static getStudentDetail(cond) {
    return new Promise(resolve => {
      Student
        .find(cond)
        .then(data => {
          resolve(data)
        })
    })
  }

  static updateFile(id, newFile) {
    return new Promise((resolve, reject) => {

      Student.findById(id, (err, student) => {
        var files = [...student.files]
   
        for (let i = 0; i < files.length; i++) {
          if (files[i].type == newFile.type && files[i].status == "current") {
            files[i].status = "old";
          }
        }

        files = [...files, newFile]

        Student.findByIdAndUpdate(id, { files: files }, { new: true }, (err, docs) => {

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

}

module.exports = StudentClass;
