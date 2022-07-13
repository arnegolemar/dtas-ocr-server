const Position = require('../models/Position');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class PositionClass {

  constructor (data) {
    this.name = (data.name)?data.name:""; 
    this.createdAt = (data.positionID)?data.createdAt:"";
    this._id = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newPosition = new Position({
        name: this.name,
      });

      newPosition.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update (){
    return new Promise ((resolve, reject) => {
      Position.findById(this._id, (err, position) => {
        position.name = this.name;
        position.save();
      })
        .then(() => resolve({ status: true }))
        .catch(err => {
            reject({ status: false });
        });

    }); // end promise
  }
  ///================ static methods ======================

    static count (filter = {}) {

      return new Promise (resolve => {
        Position
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static getPositions (page = 1, count = 10, filter = {}, sort = {'name': 1}, select = []) {

      return new Promise ((resolve, reject) => {

        Position
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

    static getPositionDetail (cond) {
      return new Promise (resolve => {
        Position
          .find(cond)
          .then(data => {
            resolve(data)
          })
      })
    }

  }

module.exports = PositionClass;
