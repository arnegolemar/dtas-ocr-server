const Office = require('../models/Office');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class OfficeClass {

  constructor (data) {
    this.division = (data.division)?data.division:""; 
    this.section = (data.section)?data.section:"";
    this.code = (data.code)?data.code:"";
    this.createdAt = (data.createdAt)?data.createdAt:"";
    this.officeID = (data.officeID)?data.officeID:"";
    this._id = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newOffice = new Office({
        division: this.division,
        section: this.section,
        code: this.code,
        officeID: this.officeID,
      });

      newOffice.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update (){
    console.log("------------------->>>>>>===");
    console.log(this);
    return new Promise ((resolve, reject) => {
      Office.findById(this._id, (err, office) => {
        office.division = this.division;
        office.section = this.section;
        office.code = this.code;
        office.save();
      })
        .then((data) => {

          resolve({ status: true });
        })
        .catch(err => {
            reject({ status: false });
        });

    }); // end promise
  }
  ///================ static methods ======================

    static count (filter = {}) {

      return new Promise (resolve => {
        Office
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static getOffices (page = 1, count = 10, filter = {}, sort = {'officeID': 1}, select = []) {

      return new Promise ((resolve, reject) => {

        Office
          .find(filter)
          .sort(sort)
          .select(select)
          .skip((page*count) - count)
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

    static getOfficeDetail (cond) {
      return new Promise (resolve => {
        Office
          .find(cond)
          .then(data => {
            resolve(data)
          })
      })
    }

  }

module.exports = OfficeClass;
