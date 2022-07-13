const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class DocumentClass {

  constructor(data) {
    console.log("---------------------------");
    console.log(data);
    this.documentID = (data.documentID) ? data.documentID : "",
      this.owner = (data.owner) ? data.owner : null,
      this.ownerOffice = (data.ownerOffice) ? data.ownerOffice : null,
      this.type = (data.type) ? data.type : "",
      this.status = (data.status) ? data.status : "",
      this.dateUploaded = (data.dateUploaded) ? data.dateUploaded : null,
      this.name = (data.name) ? data.name : "",
      this.path = (data.path) ? data.path : "",
      this.tags = (data.tags) ? data.tags : "",
      this.context = (data.context) ? data.context : "",
      this.content = (data.content) ? data.content : "",
      this.currentAction = (data.currentAction) ? data.currentAction : "",
      this.actions = (data.actions) ? data.actions : [],

      this._id = (data._id) ? data._id : "";
  }

  save() {
    console.log("***********************!@@@");
    console.log(this);
    return new Promise((resolve, reject) => {
      var newDocument = new Document({
        documentID: this.documentID,
        owner: this.owner,
        ownerOffice: this.ownerOffice,
        type: this.type,
        status: this.status,
        dateUploaded: this.dateUploaded,
        name: this.name,
        path: this.path,
        actions: this.actions,
        tags: this.tags,
        context: this.context,
        content: this.content,
        currentAction: this.currentAction,
        
      });

      Document.
        findOneAndUpdate(
          { owner: this.owner, type: this.type, status: "current" },
          { status: "old" },
        )
        .then(data2 => {

          newDocument.save()
            .then((data) => {
              resolve(data);
            })

        })
        .catch(err => {
          console.log("!!!!!!!!!@@@@");
          console.log(err);
        })

    }); // end promise
  }

  update() {
    return new Promise((resolve, reject) => {
      Document.findById(this._id, (err, document) => {
        document.documentID = this.documentID;
        document.owner = this.owner;
        document.ownerOffice = this.ownerOffice;
        document.type = this.type;
        document.status = this.status;
        document.dateUploaded = this.dateUploaded;
        document.name = this.name;
        document.path = this.path;
        document.actions = this.actions;
        document.tags = this.tags;
        document.context = this.context;
        document.content = this.content;
        document.currentAction = this.currentAction;
        document.save();
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

  static count(filter = {}) {

    return new Promise(resolve => {
      Document
        .find(filter)
        .count()
        .then(count => {
          resolve(count)
        })
    })

  }

  static getDocuments(page = 1, count = 10, filter = {}, sort = { 'documentID': 1 }, select = []) {

    return new Promise((resolve, reject) => {

      Document
        .find(filter)
        .populate({ path: "owner" })
        .populate({ path: "ownerOffice" })
        .populate({ path: "currentAction.office" })
        .populate({ path: "currentAction.officeFrom" })
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

  static getDocumentDetail(cond) {
    return new Promise(resolve => {
      Document
        .find(cond)
        .then(data => {
          resolve(data)
        })
    })
  }

  static moveDocument({ document, office, remarks = "", status, receivedBy = null, movedBy, officeF }) {

    return new Promise((resolve, reject) => {
      Document.findById(document, (err, docu) => {
        docu.actions = [...docu.actions, {
          status: status,
          remarks: remarks,
          office: (office != null)?mongoose.Types.ObjectId(office):null,
          receivedBy: (receivedBy != null)?mongoose.Types.ObjectId(receivedBy):null,
          date: new Date(),
          officeFrom: officeF,
          movedBy: movedBy,
        }]
        docu.currentAction = {
          status: status,
          remarks: remarks,
          office: (office != null)?mongoose.Types.ObjectId(office):null,
          receivedBy: (receivedBy != null)?mongoose.Types.ObjectId(receivedBy):null,
          date: new Date(),
          officeFrom: officeF,
          movedBy: movedBy,
        };

        docu.save();
      })
        .then((data) => {
          resolve({ data: data, success: true });
        })
        .catch(err => {
          reject({ err: err, success: false });
        });

    }); // end promise
  }

  static receiveDocument(document, receivedBy) {

    return new Promise((resolve, reject) => {
      Document.findById(document, (err, docu) => {
        docu.actions = [...docu.actions, {
          ...docu.currentAction,
          status: "received",
          receivedBy: (receivedBy != null)?mongoose.Types.ObjectId(receivedBy):null,
          date: new Date(),
        }]
        docu.currentAction = {
          ...docu.currentAction,
          status: "received",
          receivedBy: (receivedBy != null)?mongoose.Types.ObjectId(receivedBy):null,
          date: new Date(),
        };

        docu.save();
      })
        .then((data) => {
          resolve({ data: data, success: true });
        })
        .catch(err => {
          reject({ err: err, success: false });
        });

    }); // end promise
  }


  static getActivities(id) {
    return new Promise(resolve => {
      Document
        .find({_id: mongoose.Types.ObjectId(id)})
        .populate("actions.office")
        .populate("actions.officeFrom")
        .populate("actions.receivedBy")
        .populate("actions.movedBy")
        .then(data => {
          console.log("_____________________");
          console.log();
          resolve({success: true, activities: data[0].actions})
        })
        .catch(err => {
          reject({success: true, error: err})
        })
    })
  }
  
}

module.exports = DocumentClass;
