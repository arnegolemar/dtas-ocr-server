const AdminUser = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

class AdminClass {

  constructor (data) {
    console.log(data);
    this.personalInfo = {
      name: data.personalInfo.name,
    	address: (data.personalInfo.address)
                ?data.personalInfo.address
                :[{
                  addressline: "",
                	brgy:        "",
                	mun_city:    "",
                	prov:   		 "",
                	zipcode:   	 ""
                }],
    	contact: {
        prefix: (data.personalInfo.contact.prefix)?data.personalInfo.contact.prefix:"+63",
        number: data.personalInfo.contact.number,
      },
    	dob: data.personalInfo.dob,
    	email:(data.personalInfo.email)
              ?data.personalInfo.email
              :{
                emailAdd: "",
            		verified: false,
            		verificationCode: ""
              },
    },

  	this.accountInfo = {
      image:         (data.accountInfo.image)?data.accountInfo.image: "",
      verified:        (data.accountInfo.verified)?data.accountInfo.verified: false,
      verifiedDate:    (data.accountInfo.verifiedDate)?data.accountInfo.verifiedDate: "",
      username:    (data.accountInfo.username)?data.accountInfo.username: "",
      password:    (data.accountInfo.password)?data.accountInfo.password: "",
    };

    this.employeeID = (data.employeeID)?data.employeeID:"";
    this.role = (data.role)?data.role:"";
    this.position = (data.position)?data.position:"";
    this._id = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newAdminUser = new AdminUser();
      newAdminUser.personalInfo = this.personalInfo;
      newAdminUser.accountInfo = this.accountInfo;
      newAdminUser.employeeID = this.employeeID;
      newAdminUser.role = this.role;
      newAdminUser.position = this.position;

      newAdminUser.save()
        .then((data) => {
          resolve(data);
        })
    });
  }

  update (){
    return new Promise ((resolve, reject) => {
      AdminUser.findById(this._id, (err, adminUser) => {
        adminUser.personalInfo = this.personalInfo;
        adminUser.accountInfo = this.accountInfo;
        adminUser.employeeID = this.employeeID;
        adminUser.role = this.role;
        adminUser.position = this.position;
  
        adminUser.save()
          .then((data) => {
            resolve(data);
          })
    	}).then(() => resolve({ status: true }));
    }); 
  }

  ///================ static methods ======================

    static createNewRole (name, routes) {
      return new Promise (resolve => {
        var newRole = new Role({
          name: name,
          routes: routes,
        })

      newRole.save()
        .then(result => {
          resolve(result)
        })
        .catch(error => {
          reject({
            status: false,
            error: error
          })
        });
      });
    }

    static updateRole (id, name, routes) {
      return new Promise ((resolve, reject) => {
        Role.findById(id, (err, role) => {
          role.name = name;
          role.routes = routes;
          role.save();
        }).then((role) => resolve(role));
      });
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

      }) // end promise

    } // end getEmployees

    static countRoles (filter = {}) {

      return new Promise (resolve => {
        Role
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static count (filter = {}) {

      return new Promise (resolve => {
        AdminUser
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }
    
    static getAdminUsers (page = 1, count = 10, filter = {}, sort = {'employeeID': 1}, select = []) {

      return new Promise ((resolve, reject) => {

        AdminUser
          .find(filter)
          .populate("role")
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

      }) // end promise

    } // end getEmployees


    static getAdminUserDetail (cond) {

      return new Promise (resolve => {
        AdminUser
          .find(cond)
          .populate("role")
          .then(data => {
            resolve(data)
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

module.exports = AdminClass;
