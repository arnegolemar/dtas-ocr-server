const AppModule = require('../models/AppModule');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class AppModuleClass {

  constructor (data) {
    this.appModuleID = (data.appModuleID)?data.appModuleID:""; 
    this.isGenerated = (data.isGenerated)?data.isGenerated:false;
    this.moduleType = (data.moduleType)?data.moduleType:"";
    this.code = (data.code)?data.code:"";
    this.name = (data.name)?data.name:"";
    this.description = (data.description)?data.description:"";
    this.schemas = (data.schemas)?data.schemas:"";
    this.createdAt = (data.createdAt)?data.createdAt:"";
    
    this._id = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newAppModule = new AppModule({
        appModuleID: this.appModuleID,
        isGenerated: this.isGenerated,
        moduleType: this.moduleType,
        code: this.code,
        name: this.name,
        description: this.description,
        schemas: this.schemas,
        createdAt: this.createdAt,
      });

      newAppModule.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update (){
    return new Promise ((resolve, reject) => {
      AppModule.findById(this._id, (err, appModule) => {
        appModule.appModuleID = this.appModuleID;
        appModule.isGenerated = this.isGenerated;
        appModule.moduleType = this.moduleType;
        appModule.code = this.code;
        appModule.name = this.name;
        appModule.description = this.description;
        appModule.schemas = this.schemas;
        appModule.createdAt = this.createdAt;

        appModule.save();
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
        AppModule
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static getAppModules (page = 1, count = 10, filter = {}, sort = {'appModuleID': 1}, select = []) {

      return new Promise ((resolve, reject) => {

        AppModule
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

    static getAppModuleDetail (cond) {
      return new Promise (resolve => {
        AppModule
          .find(cond)
          .then(data => {
            resolve(data)
          })
      })
    }

  }

module.exports = AppModuleClass;
