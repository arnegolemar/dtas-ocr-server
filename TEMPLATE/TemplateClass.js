const Temp1 = require('../models/Temp1');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class Temp1Class {

  constructor (data) {
    this.createdAt = (data.createdAt)?data.createdAt:"";
    this.temp3ID = (data.temp3ID)?data.temp3ID:"";
    this._id = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newTemp1 = new Temp1({
        temp3ID: this.temp3ID,
      });

      newTemp1.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update (){
    return new Promise ((resolve, reject) => {
      Temp1.findById(this._id, (err, temp3) => {
        temp3.save();
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
        Temp1
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static getTemp1s (page = 1, count = 10, filter = {}, sort = {'temp3ID': 1}, select = []) {

      return new Promise ((resolve, reject) => {

        Temp1
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

    static getTemp1Detail (cond) {
      return new Promise (resolve => {
        Temp1
          .find(cond)
          .then(data => {
            resolve(data)
          })
      })
    }

  }

module.exports = Temp1Class;
