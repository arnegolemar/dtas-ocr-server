const Notif = require('../models/Notif');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class NotifClass {

  constructor (data) {
    this.source = (data.source)?data.source:null; 
    this.receiver = (data.receiver)?data.receiver:null;
    this.receivers = (data.receivers)?data.receivers:[];
    this.type = (data.type)?data.type:"";
    this.msg = (data.msg)?data.msg:"";
    this.status = (data.status)?data.status:"";
    this._id = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newNotif = new Notif({
        source: this.source,
        receiver: this.receiver,
        receivers: this.receivers,
        type: this.type,
        msg: this.msg,
        status: this.status,
      });

      newNotif.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update (){
    return new Promise ((resolve, reject) => {
      Notif.findById(this._id, (err, role) => {
        role.source = this.source;
        role.receiver = this.receiver;
        role.receivers = this.receivers;
        role.type = this.type;
        role.msg = this.msg;
        role.status = this.status;
        role.save();
      })
        .then(() => resolve({ success: true }))
        .catch(err => {
            reject({ success: false });
        });

    }); // end promise
  }
  ///================ static methods ======================

    static count (filter = {}) {

      return new Promise (resolve => {
        Notif
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static getNotifs (page = 1, count = 10, filter = {}, sort = {'date': 1}, select = []) {
      console.log(filter);
      return new Promise ((resolve, reject) => {

        Notif
          .find(filter)
          .sort(sort)
          .select(select)
          .skip((page*count) - count)
          .limit(count)
          .then(data => {
            resolve(data)
          }).
          catch(err => {
            console.log(err);
            reject({
              success: false,
              error: err
            })
          })

      }) 

    }

    static getNotifDetail (cond) {
      return new Promise (resolve => {
        Notif
          .find(cond)
          .then(data => {
            resolve(data)
          })
      })
    }

  }

module.exports = NotifClass;
