const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class RoleClass {

  constructor (data) {
    this.name = (data.name)?data.name:""; 
    this.routes = (data.routes)?data.routes:[];
    this.systems = (data.systems)?data.systems:[];
    this.createdAt = (data.roleID)?data.createdAt:"";
    this._id = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newRole = new Role({
        name: this.name,
        routes: this.routes,
        systems: this.systems,
      });

      newRole.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update (){
    console.log("__________");
    console.log(this);
    return new Promise ((resolve, reject) => {
      Role.findById(this._id, (err, role) => {
        role.name = this.name;
        role.routes = this.routes;
        role.systems = this.systems;
        role.save();
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
        Role
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static getRoles (page = 1, count = 10, filter = {}, sort = {'name': 1}, select = []) {

      return new Promise ((resolve, reject) => {

        Role
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

    static getRoleDetail (cond) {
      return new Promise (resolve => {
        Role
          .find(cond)
          .then(data => {
            resolve(data)
          })
      })
    }

  }

module.exports = RoleClass;
