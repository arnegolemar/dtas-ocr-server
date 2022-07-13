const Document = require('../models/Document');
const DocumentClass = require('../modules/DocumentClass');
const mongoose = require('mongoose')

const { TryCatch } = require('../routes/middleware/log-helper');
const { GetNewID } = require('../routes/middleware/registration-helper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    documentID = await GetNewID(Document, "documentID", 1, 3, "O");
    const newDocument = new DocumentClass({
      ...data.document,
      documentID: documentID[0]
    });

    newDocument
      .save()
      .then(data => {
        res.json({ status: true, document: data });
      })
  }, "Add new Document", "Server - api/document.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    const document = new DocumentClass({
      ...data.document
    });

    document
      .update()
      .then(data => {
        res.json({ status: true, documents: data });
      })
      .catch((err) => {
        res.json({ status: false, error: err });
      });
  }, "Add Update Document", "Server - api/document.js -> Line: 19 - 30", 2, req, res);
}

exports.get = (req, res) => {
  TryCatch((res, req) => {

    var data = (req.query.filters) ? JSON.parse(req.query.filters) : {};
    var cond = data.find;
    var keys = Object.keys(cond || []);

    keys.map((key, i) => {
      if (key == "owner") {
        cond[key] = mongoose.Types.ObjectId(cond[key]);
      } else if (key == "_id") {
        cond[key] = mongoose.Types.ObjectId(cond[key]);
      } else if (key == "office") {
        cond["currentAction.office"] = mongoose.Types.ObjectId(cond[key]);
        delete cond.office;
      } else if (key == "actStatus") {
        cond["currentAction.status"] = cond[key];
        delete cond.actStatus;
      } else {
        cond[key] = new RegExp(["", cond[key], ""].join(""), "i")
      }
    });

    if (req.query.value) {
      cond = (cond) ? [cond] : [];
      var value = JSON.parse(req.query.value)
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      if (props == "office") {
        cond.push({ "currentAction.office": cond.office });
      } else if (props == "actStatus") {
        cond.push({ "currentAction.status": cond.actStatus });
      } else {
        cond.push({ [props]: regex });
      }

      cond = {
        $and: cond
      };
    }

    DocumentClass.getDocuments(data.page, data.count, cond, data.sort, data.select)
      .then(documents => {
        DocumentClass.count(cond).then((count) => {
          res.json({ status: true, data: { documents: documents, count: count } });
        })
      })
      .catch(error => {
        res.json({ error: 'error message' });
      });

  }, "Get Document", "Server - api/document.js -> Line: 19 - 30", 2, req, res);
}

exports.move = (req, res) => {
  TryCatch((res, req) => {
    var { document } = req.body;
    const movedBy = req.userInfo.id;
    const officeF = req.userInfo.office._id;

    DocumentClass
      .moveDocument({ ...document, movedBy, officeF })
      .then(data => {
        if (data.success) {
          res.json(data);
        } else {
          res.json({ success: false, documents: data });
        }
      })
      .catch((err) => {
        res.json({ success: false, error: err });
      });

  }, "Move Document", "Server - api/document.js -> Line: 19 - 30", 2, req, res);
}


exports.receive = (req, res) => {
  TryCatch((res, req) => {
    var { document } = req.body.document;
    const receivedBy = req.userInfo.id;
    const office = req.userInfo.office._id;
    DocumentClass
      .receiveDocument(document, receivedBy)
      .then(data => {
        if (data.success) {
          res.json(data);
        } else {
          res.json({ success: false, documents: data });
        }
      })
      .catch((err) => {
        res.json({ success: false, error: err });
      });

  }, "Receive Document", "Server - api/document.js -> Line: 19 - 30", 2, req, res);
}


exports.activities = (req, res) => {
  TryCatch((res, req) => {

    var id = req.query.document;

    console.log("---!!!!");
    console.log(id);

    DocumentClass.getActivities(id)
      .then(activities => {
        res.json(activities)
      })
      .catch(error => {
        res.json({ success: false, error: error });
      });

  }, "Get Document", "Server - api/document.js -> Line: 19 - 30", 2, req, res);
}