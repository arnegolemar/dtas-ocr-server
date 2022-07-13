const AppModule = require('../models/AppModule');
const AppModuleClass = require('../modules/AppModuleClass');

const { TryCatch }    = require('../routes/middleware/log-helper');
const { GetNewID }    = require('../routes/middleware/registration-helper');
const { MakeFolder, MakeFile, CreateModule }    = require('./app-module-helpers');


exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    appModuleID = await GetNewID (AppModule, "appModuleID", 1, 5 , "APPM");
    console.log("+=========================");
    console.log(appModuleID);
    const newAppModule = new AppModuleClass({
      ...data.appModule,
      appModuleID: appModuleID[0]
    });

    newAppModule
      .save()
      .then(data => {
        res.json({status: true, appModule: data});
      })
  }, "Add new appModule", "Server - api/appModule.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    const appModule = new AppModuleClass({
      ...data.appModule
    });
    
    appModule
      .update()
      .then(data => {
        res.json({status: true, appModules: data});
      })
      .catch((err) => {
        res.json({status: false, error: err});
      });
  }, "Add Update appModule", "Server - api/appModule.js -> Line: 19 - 30", 2, req, res);
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

      if (props == "appModule"){
        cond.push({ $or: [{["division"]: regex}, {["section"]: regex}, {["code"]: regex}]});
      } else {
        cond.push({[props]: regex});
      }

      cond = {
        $and: cond
      };
    }

    AppModuleClass.getAppModules(data.page, data.count, cond, data.sort, data.select)
      .then(appModules => {
        AppModuleClass.count(cond).then((count) => {
          res.json({status: true, data:{ appModules: appModules, count: count}});
        })
      })
      .catch(error => {
        res.json({error: 'error message'});
      });

  }, "Get appModules", "Server - api/appModule.js -> Line: 19 - 30", 2, req, res);
}

exports.generate = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    // MakeFolder("../client/hello/sssa");
    // MakeFile("../client/hello/", "sssa.js", "kakkakakkk");


    AppModuleClass.getAppModules(1, 1, {_id: data.id})
      .then(async appModules => {
        var res = await CreateModule({...appModules[0]});
      })
      .catch(error => {
        console.log(error);
      });

  }, "Add new appModule", "Server - api/appModule.js -> Line: 19 - 30", 2, req, res);
}
