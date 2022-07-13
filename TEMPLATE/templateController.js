const Temp1 = require('../models/Temp1');
const Temp1Class = require('../modules/Temp1Class');

const { TryCatch }    = require('../routes/middleware/log-helper');
const { GetNewID }    = require('../routes/middleware/registration-helper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    temp3ID = await GetNewID (Temp1, "temp3ID", 1, 3, "O");
    const newTemp1 = new Temp1Class({
      ...data.temp3,
      temp3ID: temp3ID[0]
    });

    newTemp1
      .save()
      .then(data => {
        res.json({status: true, temp3: data});
      })
  }, "Add new Temp1", "Server - api/temp3.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    const temp3 = new Temp1Class({
      ...data.temp3
    });

    temp3
      .update()
      .then(data => {
        res.json({status: true, temp3s: data});
      })
      .catch((err) => {
        res.json({status: false, error: err});
      });
  }, "Add Update Temp1", "Server - api/temp3.js -> Line: 19 - 30", 2, req, res);
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

    Temp1Class.getTemp1s(data.page, data.count, cond, data.sort, data.select)
      .then(temp3s => {
        Temp1Class.count(cond).then((count) => {
          res.json({status: true, data:{ temp3s: temp3s, count: count}});
        })
      })
      .catch(error => {
        res.json({error: 'error message'});
      });

  }, "Get Temp1s", "Server - api/temp3.js -> Line: 19 - 30", 2, req, res);
}
