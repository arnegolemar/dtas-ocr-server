const Office = require('../models/Office');
const OfficeClass = require('../modules/OfficeClass');

const { TryCatch }    = require('../routes/middleware/log-helper');
const { GetNewID }    = require('../routes/middleware/registration-helper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    officeID = await GetNewID (Office, "officeID", 1, 3, "O");
    const newOffice = new OfficeClass({
      ...data.office,
      officeID: officeID[0]
    });

    newOffice
      .save()
      .then(data => {
        res.json({status: true, office: data});
      })
  }, "Add new office", "Server - api/office.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    const office = new OfficeClass({
      ...data.office
    });

    office
      .update()
      .then(data => {
        res.json({status: true, offices: data});
      })
      .catch((err) => {
        res.json({status: false, error: err});
      });
  }, "Add Update office", "Server - api/office.js -> Line: 19 - 30", 2, req, res);
}

exports.get = (req, res) => {
  TryCatch((res, req) => {
    
    var data = (req.query.filters)?JSON.parse(req.query.filters):{};
    var cond = data.find;
    
    var keys = Object.keys(cond || []);

    keys.map((key, i) => {
      cond[key] = new RegExp(["", cond[key], ""].join(""), "i")
    });

    if (req.query.value){
      cond = (cond)?[cond]:[];
      var value = JSON.parse(req.query.value)
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      if (false){
      } else {
        cond.push({[props]: regex});
      }

      cond = {
        $and: cond
      };
    }

    OfficeClass.getOffices(data.page, data.count, cond, data.sort, data.select)
      .then(offices => {
        OfficeClass.count(cond).then((count) => {
          res.json({status: true, data:{ offices: offices, count: count}});
        })
      })
      .catch(error => {
        res.json({error: 'error message'});
      });

  }, "Get offices", "Server - api/office.js -> Line: 19 - 30", 2, req, res);
}
