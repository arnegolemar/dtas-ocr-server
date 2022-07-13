const fs = require('fs');
const { clientDirectory } = require('../config/keys');

async function CamelCase (name, upper1stChar = false) {
    var nameTemp = name;
    var newName = "";
    for (let x = 0; x < nameTemp.length; x++) {
        if (nameTemp[x] != " ") {
            if (x == 0) {
                newName += (upper1stChar)?nameTemp[x].toUpperCase():nameTemp[x];    
            }else {
                if (name[x-1] != " ") {
                    newName += nameTemp[x];
                }else {
                    newName += nameTemp[x].toUpperCase();
                }
            }

        }    
    }
    return newName;
}

async function GetAbbrev (name) {
    var splitted = name.split(" ");
    var abbr = "";

    for (let x = 0; x < splitted.length; x++) {
        abbr += splitted[x][0].toUpperCase();
    }

    return abbr;
}

async function MakeFolder (path) {

    var pathSplit = path.split("/");
    var directory = "";


    for (let x = 0; x < pathSplit.length; x++) {

        try {
            directory += pathSplit[x];

            if (pathSplit[x] != "." && pathSplit[x] != ".." && pathSplit[x] != "" && pathSplit[x] != " ") {
                if (!fs.existsSync(directory)){
                    fs.mkdirSync(directory);
                }
            }
    
            directory += "/";
        } catch(err) {
            return { success: false, error: err}
        }

    }

    return { success: true};
}

async function MakeFile (path, filename, content) {
    var res = await MakeFolder(path);    
    console.log("::::::::::::::-<<<<>>>");
    console.log(res);
    if (res.success) {
        fs.writeFileSync(path + filename, content);
        return { success: true };
    }else {
        return { success: false, error: res.err };
    }
}

async function CreateModule (data) {
    var module = data._doc;
    var res = {};

    var mName      = await CamelCase((module.name).toLowerCase(), true),
        mNameCamel = await CamelCase((module.name).toLowerCase()),
        abbr       = await GetAbbrev(module.name);

    // res = await SetUpServerAPI(module, mName, mNameCamel, abbr);
    // if (!res.success){ 
    //     console.log("===============================================================");
    //     console.log("ERROR: " + res.errorDetail);
    //     return res; 
    // }

    res = await SetUpClientUIs(module, mName, mNameCamel, abbr);
    if (!res.success){ 
        console.log("===============================================================");
        console.log("ERROR: " + res.errorDetail);
        return res; 
    }

    return { success: true };
}

async function SetUpServerAPI (data, name, nameCamel, abbr) {

    var res = {}; 
    // SCHEMA

    res = await SetUpSchema(data.schemas, name, nameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "SERVER: error in SetUpSchema" } }

    // CLASS
    res = await SetUpClass(data.schemas, name, nameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "SERVER: error in SetUpClass" } }

    // CONTROLLER
    res = await SetUpController(data.schemas, name, nameCamel, abbr);
    if (!res.success) { return { success: false, error: res, errorDetail: "SERVER: error in SetUpController" } }

    // API
    res = await SetUpAPI(name, nameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "SERVER: error in SetUpAPI" } }

    // Setup to SERVER.js
    res = await SetUpServerJS(nameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "SERVER: error in SetUpServerJS" } }

    return { success: true };
}

async function SetUpClientUIs (module, mName, mNameCamel, abbr) {

    var name = module.name.split(" ").join("_");

    // Setup to ACTION/types.js
    var res = await SetUpTypesInAction(name);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpTypesInAction" } }

    // ACTION
    var res = await SetUpActionFile(module, name, mNameCamel, mName);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpActionFile" } }

    // REDUCER
    var res = await CreateReducerFile(module, name, mNameCamel, mName);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in CreateReducerFile" } }

    // Setup to REDUCERS/ndex.js
    var res = await SetUpReducer(mNameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpReducer" } }

    // CREATE MODULE
    //---- FOLDER
    //---- INDEX
    var res = await SetUpComponentIndexFile(module, name, mNameCamel, mName);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpComponentIndexFile" } }

    //---- MODAL
    var res = await SetUpComponentModalFile(module, name, mNameCamel, mName);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpComponentModalFile" } }

    //---- TABLE
    var res = await SetUpComponentTableFile(module, name, mNameCamel, mName);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpComponentTableFile" } }

    //---- FORM
    var res = await SetUpComponentFormFile(module, name, mNameCamel, mName);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpComponentFormFile" } }

    // Setup to APP.js
    var res = await SetUpAppJS(mName, mNameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpAppJS" } }

    // Setup to config.js
    var res = await SetUpConfigJS(mName, mNameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpConfigJS" } }

    // Setup to Role Form Menu
    var res = await SetUpRoleFormMenu(mName, mNameCamel);
    if (!res.success) { return { success: false, error: res, errorDetail: "CLIENT: error in SetUpRoleFormMenu" } }
    
    // Setup to NAVBAR

    return { success: true };
}

async function SetUpSchema (schemas, name, nameCamel) {
    var content = ""; 

    content += "const mongoose = require('mongoose');\n";
    content += "const Schema = mongoose.Schema;\n\n";

    // Create Schema
    content += "const " + name + " = new Schema({\n\n";
    console.log("====================::::>>");
    console.log(schemas);
    
    content += "  " + nameCamel + "ID : {type: String},\n";

    for (let x = 0; x < schemas.length; x++) {
        content += "  " + schemas[x].fieldName + 
                   " : {type: " + 
                   schemas[x].type + 
                   (
                       (schemas[x].defaultValue != "")
                        ?(schemas[x].type == "String")
                            ?", default: '" +schemas[x].defaultValue + "'"
                            :", default: " +schemas[x].defaultValue
                        :""
                    ) 
                   + "},\n";
    }

    content += "\n});\n";

    content += "module.exports = mongoose.model('" + nameCamel.toLowerCase() + "', " + name + ");"

    return await MakeFile("./models/", name + ".js", content);
}

async function SetUpClass (schemas, name, nameCamel) {
    var content = ""; 
    content +="const " + name + " = require('../models/" + name + "');\n";
    content +="const jwt = require('jsonwebtoken');\n";
    content +="var mongoose = require('mongoose');\n\n";

    content +="class " + name + "Class {\n\n";

    content +="  constructor (data) {\n";
    content +="    this." + (nameCamel + "ID") + " = (data." + (nameCamel + "ID") + ")?data." + (nameCamel + "ID") + ":'';\n";

    for (let x = 0; x < schemas.length; x++) {        
        content +="    this." + schemas[x].fieldName + " = (data." + schemas[x].fieldName + ")?data." + schemas[x].fieldName + ":'';\n";
    }

    content +="    this._id = (data._id)?data._id:'';\n";
    content +="  }\n\n";

    content +="  save () {\n";
    content +="    return new Promise ((resolve, reject) => {\n";
    content +="      var new" + name + " = new " + name + "({\n";
    content += "        " + (nameCamel + "ID") + ": this." + (nameCamel + "ID") + ",\n";

    for (let x = 0; x < schemas.length; x++) {        
        content += "        " + schemas[x].fieldName + ": this." + schemas[x].fieldName + ",\n";
    }

    content +="      });\n";
    content +="      new" + name + ".save()\n";
    content +="        .then((data) => {\n";
    content +="          resolve(data);\n";
    content +="        })\n";
    content +="    }); // end promise\n";
    content +="  }\n\n";

    content +="  update (){\n";
    content +="    return new Promise ((resolve, reject) => {\n";
    content +="      " + name + ".findById(this._id, (err, " + nameCamel + ") => {\n";
    content +="        " + nameCamel + "." + ( nameCamel + "ID" ) + " = this." + ( nameCamel + "ID" ) + ";\n"
    for (let x = 0; x < schemas.length; x++) {        
        content +="        " + nameCamel + "." + schemas[x].fieldName + " = this." + schemas[x].fieldName + ";\n"
    }
    content +="        " + nameCamel + ".save();\n";
    content +="      })\n";
    content +="        .then(() => resolve({ status: true }))\n";
    content +="        .catch(err => {\n";
    content +="            reject({ status: false });\n";
    content +="        });\n";
    content +="    }); // end promise\n";
    content +="  }\n\n";

    content +="    static count (filter = {}) {\n";
    content +="      return new Promise (resolve => {\n";
    content +="        " + name + "\n";
    content +="          .find(filter)\n";
    content +="          .count()\n";
    content +="          .then(count => {\n";
    content +="            resolve(count)\n";
    content +="          })\n";
    content +="      })\n";
    content +="    }\n\n";

    content +="    static get" + name + "s (page = 1, count = 10, filter = {}, sort = {'" + nameCamel + "ID': 1}, select = []) {\n";
    content +="      return new Promise ((resolve, reject) => {\n";
    content +="        " + name + "\n";
    content +="          .find(filter)\n";
    content +="          .sort(sort)\n";
    content +="          .select(select)\n";
    content +="          .skip((page*count) - count)\n";
    content +="          .limit(count)\n";
    content +="          .then(data => {\n";
    content +="            resolve(data)\n";
    content +="          }).\n";
    content +="          catch(err => {\n";
    content +="            reject({\n";
    content +="              status: false,\n";
    content +="              error: err\n";
    content +="            })\n";
    content +="          })\n";
    content +="      })\n" ;
    content +="    }\n\n";

    content +="    static get" + name + "Detail (cond) {\n";
    content +="      return new Promise (resolve => {\n";
    content +="        " + name + "\n";
    content +="          .find(cond)\n";
    content +="          .then(data => {\n";
    content +="            resolve(data)\n";
    content +="          })\n";
    content +="      })\n";
    content +="    }\n\n";

    content +="  }\n\n";

    content +="module.exports = " + name + "Class;";

    return await MakeFile("./modules/", name + "Class.js", content);
}

async function SetUpController (schemas, name, nameCamel, abbr) {
    var content = ""; 

    content += "const " + name + " = require('../models/" + name + "');\n";
    content += "const " + name + "Class = require('../modules/" + name + "Class');\n";
    content += "const { TryCatch }    = require('../routes/middleware/log-helper');\n";
    content += "const { GetNewID }    = require('../routes/middleware/registration-helper');\n";

    content += "exports.new = (req, res) => {\n";
    content += "  TryCatch(async (res, req) => {\n\n";
    content += "    var data = req.body;\n";
    content += "    " + nameCamel + "ID = await GetNewID (" + name + ", '" + nameCamel + "ID', 1, 5 , 'GO" + abbr + "');\n";
    content += "    const new" + name + " = new " + name + "Class({\n";
    content += "      ...data." + nameCamel + ",\n";
    content += "      " + nameCamel + "ID: " + nameCamel + "ID[0]\n";
    content += "    });\n\n";
    content += "    new" + name + "\n";
    content += "      .save()\n";
    content += "      .then(data => {\n";
    content += "        res.json({status: true, " + nameCamel + ": data});\n";
    content += "      })\n\n";
    content += "  }, 'Add new " + nameCamel + "', 'Server - api/" + nameCamel + ".js -> Line: 19 - 30', 2, req, res);\n";
    content += "}\n\n";

    content += "exports.update = (req, res) => {\n";
    content += "  TryCatch((res, req) => {\n\n";
    content += "    var data = req.body;\n";
    content += "    const " + nameCamel + " = new " + name + "Class({\n";
    content += "      ...data." + nameCamel + "\n";
    content += "    });\n\n";
    content += "    " + nameCamel + "\n";
    content += "      .update()\n";
    content += "      .then(data => {\n";
    content += "        res.json({status: true, " + nameCamel + "s: data});\n";
    content += "      })\n";
    content += "      .catch((err) => {\n";
    content += "        res.json({status: false, error: err});\n";
    content += "      });\n\n";
    content += "  }, 'Add Update " + nameCamel + "', 'Server - api/" + nameCamel + ".js -> Line: 19 - 30', 2, req, res);\n";
    content += "}\n\n";

    content += "exports.get = (req, res) => {\n";
    content += "  TryCatch((res, req) => {\n\n";
    content += "    var data = (req.query.filters)?JSON.parse(req.query.filters):{};\n";
    content += "    var cond = data.find;\n";
    content += "    var keys = Object.keys(cond || []);\n";
    content += "    keys.map((key, i) => {\n";
    content += '      cond[key] = new RegExp(["", cond[key], ""].join(""), "i")\n';
    content += "    });\n\n";
    content += "    if (req.query.value){\n";
    content += "      cond = (cond)?[cond]:[];\n";
    content += "      var value = JSON.parse(req.query.value)\n";
    content += "      var props = value.props;\n";
    content += '      var regex = new RegExp(["", value.keyword, ""].join(""), "i");\n\n';

    content += "      if (false){\n\n";
    content += "      } else {\n";
    content += "        cond.push({[props]: regex});\n";
    content += "      }\n";
    content += "      cond = {\n";
    content += "        $and: cond\n";
    content += "      };\n";
    content += "    }\n\n";
    content += "    " + name + "Class.get" + name + "s(data.page, data.count, cond, data.sort, data.select)\n";
    content += "      .then(" + nameCamel + "s => {\n";
    content += "        " + name + "Class.count(cond).then((count) => {\n";
    content += "          res.json({status: true, data:{ " + nameCamel + "s: " + nameCamel + "s, count: count}});\n";
    content += "        })\n";
    content += "      })\n";
    content += "      .catch(error => {\n";
    content += "        res.json({error: 'error message'});\n";
    content += "      });\n\n";
    content += "  }, 'Get " + nameCamel + "s', 'Server - api/" + nameCamel + ".js -> Line: 19 - 30', 2, req, res);\n";
    content += "}\n\n";


    return await MakeFile("./controllers/", "" + nameCamel + ".js", content);
}

async function SetUpAPI (name, nameCamel) {
    var content = ""; 

    content += "const express = require('express');\n";
    content += "const router = express.Router();\n";
    content += "const " + name + " = require('../../controllers/" + nameCamel + "');\n\n";

    content += "const checkAuth = require('../middleware/checkAuth');\n";
    content += "const checkAdmin = require('../middleware/check-admin');\n\n";

    content += "router.get('/get', checkAuth, " + name + ".get);\n\n";
    content += "router.post('/new', checkAuth, checkAdmin, " + name + ".new);\n\n";
    content += "router.post('/update', checkAuth, " + name + ".update);\n\n";

    content += "module.exports = router;\n";

    return await MakeFile("./routes/api/", nameCamel + ".js", content);
}

// async function SetUpAPI (name, nameCamel) {
//   var contents = fs.readFileSync('./routes/api/admin.js', 'utf8');
//   var perLine = (contents + "").split("\n");
//   var newContent = "";

//   for (let x = 0; x < perLine.length; x++) {

//       newContent += perLine[x];

//       if ((perLine[x].trimRight("\r")) == "//=================~import controller~=================") {
//           newContent += "const Admin" + name + "Controller = require('../../controllers/" + nameCamel + "');\r";
//       }

//       if ((perLine[x].trimRight("\r")) == "//=================~use routes~=================") {
//           newContent += "router.get('/" + nameCamel + "/get', Admin" + name + "Controller.get);\n";
//           newContent += "router.post('/" + nameCamel + "/new', Admin" + name + "Controller.new);\n";
//           newContent += "router.post('/" + nameCamel + "/update', Admin" + name + "Controller.update);\n";
//       }
//   }

//   return await MakeFile('./routes/api/', "admin.js", newContent);


//   // fs.readFile('./server.js', function read (err, data) {
//   //     var content = data;
//   // });
// }

async function SetUpServerJS (nameCamel) {
    var contents = fs.readFileSync('./server.js', 'utf8');
    var perLine = (contents + "").split("\n");
    var newContent = "";

    for (let x = 0; x < perLine.length; x++) {

        newContent += perLine[x];

        if ((perLine[x].trimRight("\r")) == "//=================~import route~=================") {
            newContent += "const " + nameCamel + " = require('./routes/api/" + nameCamel + "');\r";
        }

        if ((perLine[x].trimRight("\r")) == "//=================~use route~=================") {
            newContent += "app.use('/api/" + nameCamel + "', " + nameCamel + ");\r";
        }
    }

    return await MakeFile('./', "server.js", newContent);


    // fs.readFile('./server.js', function read (err, data) {
    //     var content = data;
    // });
}

// ======================================================= CLIENT SIDE
async function SetUpTypesInAction (name) {

    var contents = fs.readFileSync(clientDirectory + 'src/actions/types.js', 'utf8');
    var perLine = (contents + "").split("\n");
    var newContent = "";

    newContent += "\n//=================== " + name + " ===================\n";
    newContent += "export const SET_" + name + "S = 'SET_" + name + "S';\n";
    newContent += "export const SET_" + name + "_DETAIL = 'SET_" + name + "_DETAIL';\n";
    newContent += "export const SET_" + name + "_DEFAULT = 'SET_" + name + "_DEFAULT';\n";
    newContent += "export const SET_SEARCHED_" + name + "S = 'SET_SEARCHED_" + name + "S';\n";
    newContent += "export const ADD_NEW_" + name + " = 'ADD_NEW_" + name + "';\n";
    newContent += "export const SET_" + name + "_VALUE = 'SET_" + name + "_VALUE';\n\n";

    return await MakeFile(clientDirectory + 'src/actions/', "types.js", contents + newContent);
    // return await MakeFile(clientDirectory + 'src/actions/', "server.js", newContent);
}

async function SetUpActionFile (module, name, nameCamel, name2) {
    var content = ""; 

    content += "import {\n";
    content += "  TOGGLE_ALERT,\n";
    content += "  CHANGE_ALERT,\n";
    content += "  SET_" + name + "_DETAIL,\n";
    content += "  SET_" + name + "_DEFAULT,\n";
    content += "  SET_" + name + "S,\n";
    content += "} from './types';\n\n";

    content += "import { SERVER_API, JWT } from '../config';\n";
    content += "import axios from 'axios';\n\n";

    content += "export const Set" + name2 + "Detail = (id) => (dispatch, getState) => {\n";
    content += "  const { toDisplay } = getState()." + nameCamel + ";\n";
    content += "  const " + nameCamel + " = toDisplay.filter((" + nameCamel + ") => " + nameCamel + "._id == id);\n\n";
    content += "  dispatch({\n";
    content += "    type: SET_" + name + "_DETAIL,\n";
    content += "    detail: {\n";
    content += "      " + nameCamel + ": [..." + nameCamel + "]\n";
    content += "    }\n";
    content += "  })\n\n";
    content += "}\n\n";

    content += "export const Set" + name2 + "Default = () => (dispatch) => {\n";
    content += "  dispatch({\n";
    content += "    type: SET_" + name + "_DEFAULT,\n";
    content += "  })\n";
    content += "}\n\n";

    content += "export const add" + name2 + " = () => (dispatch, getState) => {\n";
    content += "  dispatch({\n";
    content += "    type: TOGGLE_ALERT,\n";
    content += "    resType: 'loading',\n";
    content += "    msg: 'Adding " + name2 + "'\n";
    content += "  })\n\n";
    content += "  const { " + nameCamel + ", " + nameCamel + "s, gCount } = getState()." + nameCamel + ";\n\n";

    content += "  return new Promise((resolve, reject) => {\n\n";
    content += "    axios({\n";
    content += "      url: `${SERVER_API}/" + nameCamel + "/new`,\n";
    content += "      method: 'POST',\n";
    content += "      headers: {\n";
    content += "        'content-type': 'application/json',\n";
    content += "        Authorization: `Bearer ${localStorage.getItem(JWT)}`\n";
    content += "      },\n";
    content += "      data: {\n";
    content += "        " + nameCamel + ": {..." + nameCamel + "}\n";
    content += "      }\n";
    content += "    })\n";
    content += "    .then((res) =>{\n";
    content += "      if (res.data.status){\n";
    content += "        " + nameCamel + "s.unshift({...res.data." + nameCamel + "});\n";
    content += "        if (gCount > 10){\n";
    content += "          " + nameCamel + "s.pop();\n";
    content += "        }\n";
    content += "        dispatch({\n";
    content += "          type: SET_" + name + "S,\n";
    content += "          data: {\n";
    content += "            " + nameCamel + "s: [..." + nameCamel + "s],\n";
    content += "            count: gCount + 1,\n";
    content += "          }\n";
    content += "        })\n";
    content += "        dispatch({\n";
    content += "          type: CHANGE_ALERT,\n";
    content += "          resType: 'success',\n";
    content += "          msg: '" + name2 + " Successfully Added'\n";
    content += "        })\n";
    content += "      }else {\n";
    content += "        dispatch({\n";
    content += "          type: CHANGE_ALERT,\n";
    content += "          resType: 'failed',\n";
    content += "          msg: 'Failed to Updated " + name2 + "'\n";
    content += "        })\n";
    content += "      }\n";
    content += "    })\n";
    content += "    .catch(err => {\n";
    content += "      reject(err);\n";
    content += "    })\n\n";
    content += "  })\n";
    content += "}\n\n";

    content += "export const update" + name2 + " = () => (dispatch, getState) => {\n";
    content += "  dispatch({\n";
    content += "    type: TOGGLE_ALERT,\n";
    content += "    resType: 'loading',\n";
    content += "    msg: 'Updating " + name2 + "'\n";
    content += "  })\n\n";
    content += "  const { " + nameCamel + ", gCount } = getState()." + nameCamel + ";\n";
    content += "  const " + nameCamel + "s = [...getState()." + nameCamel + "." + nameCamel + "s];\n\n";
    content += "  return new Promise((resolve, reject) => {\n\n";
    content += "    axios({\n";
    content += "      url: `${SERVER_API}/" + nameCamel + "/update`,\n";
    content += "      method: 'POST',\n";
    content += "      headers: {\n";
    content += "        'content-type': 'application/json',\n";
    content += "        Authorization: `Bearer ${localStorage.getItem(JWT)}`\n";
    content += "      },\n";
    content += "      data: {\n";
    content += "        " + nameCamel + ": {..." + nameCamel + "}\n";
    content += "      }\n";
    content += "    })\n";
    content += "    .then((res) =>{\n\n";
    content += "      if (res.data.status){\n";
    content += "        " + nameCamel + "s.map((r) => {\n";
    content += "          if (" + nameCamel + "._id == r._id) {\n";
    content += "            r = {..." + nameCamel + "};\n";
    content += "          }\n";
    content += "          return r;\n";
    content += "        });\n\n";
    content += "        dispatch({\n";
    content += "          type: SET_" + name + "S,\n";
    content += "          data: {\n";
    content += "            " + nameCamel + "s: [..." + nameCamel + "s],\n";
    content += "            count: gCount,\n";
    content += "          }\n";
    content += "        })\n";
    content += "        dispatch({\n";
    content += "          type: CHANGE_ALERT,\n";
    content += "          resType: 'success',\n";
    content += "          msg: '" + name2 + " Successfully Updated'\n";
    content += "        })\n";
    content += "      }else {\n";
    content += "        dispatch({\n";
    content += "          type: CHANGE_ALERT,\n";
    content += "          resType: 'failed',\n";
    content += "          msg: 'Failed to Updated " + name2 + "'\n";
    content += "        })\n";
    content += "      }\n";
    content += "    })\n";
    content += "    .catch(err => {\n";
    content += "      reject(err);\n";
    content += "    })\n";
    content += "  })\n";
    content += "}\n";

    return await MakeFile(clientDirectory + 'src/actions/', nameCamel + "Action.js", content);
}

async function CreateReducerFile (module, name, nameCamel, name2) {

    var content = ""; 

    content += "import {\n";
    content += "  SET_" + name + "S,\n";
    content += "  SET_SEARCHED_" + name + "S,\n";
    content += "  ADD_NEW_" + name + ",\n";
    content += "  SET_" + name + "_DETAIL,\n";
    content += "  SET_" + name + "_VALUE,\n";
    content += "  SET_" + name + "_DEFAULT,\n";
    content += "} from '../actions/types';\n";
    content += "import { SetRegValueHelper, SpreadOps } from './reducer-helper';\n\n";
    
    content += "const initialState = {\n\n";
    
    content += "  " + nameCamel + "s: [],\n";
    content += "  searched: [],\n";
    content += "  toDisplay: [],\n";
    content += "  gCount: 0,\n";
    content += "  sCount: 0,\n";
    content += "  count: 0,\n";
    content += "  page: 1,\n";
    content += "  " + nameCamel + ": {},\n\n";
    
    content += "  " + nameCamel + "Default: {\n";
    content += "    " + nameCamel + "ID: '',\n";

    // content += "    division: '',\n";
    // content += "    section: '',\n";
    // content += "    code: '',\n";
    // content += "    createdAt: new Date()\n";
    
    for (let x = 0; x < module.schemas.length; x++) {
        // content += ("    " + module.schemas[x].fieldName + ": ,\n")

        content += "    " + module.schemas[x].fieldName + ": " + 
                   ((module.schemas[x].type == "String")
                    ? (module.schemas[x].defaultValue)
                        ?"'" + module.schemas[x].defaultValue + "',\n"
                        :"'',\n"
                    :module.schemas[x].defaultValue + ",\n")
    }

    content += "  },\n\n";
    
    content += "};\n\n";
    
    content += "var temp = '';\n";
    content += "initialState." + nameCamel + " = SpreadOps({...initialState." + nameCamel + "Default});\n\n";
    
    content += "export default function(state = initialState, action) {\n";
    content += "  switch (action.type) {\n\n";
    
    content += "    case SET_SEARCHED_" + name + "S:\n";
    content += "      return {\n";
    content += "        ...state,\n";
    content += "        searched: action.data." + nameCamel + "s,\n";
    content += "        toDisplay: action.data." + nameCamel + "s,\n";
    content += "        sCount: action.data.count,\n";
    content += "        count: action.data.count,\n";
    content += "        page: action.page\n";
    content += "      }\n\n";
    
    
    content += "    case SET_" + name + "S:\n";
    content += "      return {\n";
    content += "        ...state,\n";
    content += "        " + nameCamel + "s: (action.data)?action.data." + nameCamel + "s:state." + nameCamel + "s,\n";
    content += "        toDisplay: (action.data)?action.data." + nameCamel + "s:state." + nameCamel + "s,\n";
    content += "        gCount: (action.data)?action.data.count:state.gCount,\n";
    content += "        count: (action.data)?action.data.count:state.gCount,\n";
    content += "        page: (action.page)?action.page:1\n";
    content += "      }\n\n";
    
    content += "    case ADD_NEW_" + name + ":\n";
    content += "      return {\n";
    content += "        ...state,\n";
    content += "        " + nameCamel + "s: [action.data, ...state." + nameCamel + "s],\n";
    content += "        toDisplay: [action.data, ...state." + nameCamel + "s],\n";
    content += "        gCount: state.gCount + 1,\n";
    content += "        count: state.count + 1\n";
    content += "      }\n\n";
    
    content += "    case SET_" + name + "_DETAIL:\n";
    content += "      return {\n";
    content += "        ...state,\n";
    content += "        " + nameCamel + ": {...action.detail." + nameCamel + "[0]}\n";
    content += "      }\n\n";
    
    content += "    case SET_" + name + "_VALUE:\n";
    content += "      temp = {...state." + nameCamel + "};\n";
    content += "      temp = SetRegValueHelper(temp, action.value, action.props, action.props.length, 0);\n";
    
    content += "      return {\n";
    content += "        ...state,\n";
    content += "        " + nameCamel + ": {...temp}\n";
    content += "      }\n\n";
    
    
    content += "    case SET_" + name + "_DEFAULT:\n";
    content += "      return {\n";
    content += "        ...state,\n";
    content += "        " + nameCamel + ": SpreadOps({...state." + nameCamel + "Default}),\n";
    content += "      }\n\n";
      
    
    content += "    default:\n";
    content += "      return state\n\n";
    
    content += "  }\n";
    content += "}\n";
    
    return await MakeFile(clientDirectory + 'src/reducers/', nameCamel + "Reducer.js", content);
}

async function SetUpReducer (nameCamel) {
    var contents = fs.readFileSync(clientDirectory + 'src/reducers/index.js', 'utf8');
    var perLine = (contents + "").split("\n");
    var newContent = "";
  
    for (let x = 0; x < perLine.length; x++) {
  
        if ((perLine[x].trimRight("\r").trim(" ")) == "//=================~import reducer file~=================") {
            newContent += "import " + nameCamel + "Reducer from './" + nameCamel + "Reducer';\n";
        }
        if ((perLine[x].trimRight("\r").trim(" ")) == "//=================~combine reducer file~=================") {
            newContent += "  " + nameCamel + ": " + nameCamel + "Reducer,\n";
        }

        newContent += perLine[x];
  

    }
  
    return await MakeFile(clientDirectory + 'src/reducers/', "index.js", newContent);
  
}

async function SetUpComponentIndexFile (module, name, nameCamel, name2) {
    var content = "";

    content += "import React from 'react';\n";
    content += "import { connect } from 'react-redux';\n\n";
    
    content += "import {\n";
    content += "  GetList,\n";
    content += "} from '../../actions/helpers/displayAction';\n\n";
    
    content += "import {\n";
    content += "  SET_" + name + "S,\n";
    content += "  SET_SEARCHED_" + name + "S,\n";
    content += "} from './../../actions/types';\n\n";
    
    content += "import " + name2 + "Table from './" + name2 + "Table';\n";
    content += "import " + name2 + "Modal from './" + name2 + "Modal';\n\n";
    
    content += "class " + name2 + " extends React.Component {\n\n";
    
    content += "  constructor (props) {\n";
    content += "    super(props);\n";
    content += "    this.state = {\n";
    content += "      modal: false,\n";
    content += "      modalType: '',\n";
    content += "    }\n\n";
    
    content += "    this.toggleModal = this.toggleModal.bind(this); \n\n";
    
    content += "    props.GetList('" + nameCamel + "/get', SET_" + name + "S, 1, 10);\n";
    content += "  }\n\n";
    
      
    content += "  toggleModal (type) {\n";
    content += "    this.setState({\n";
    content += "      modal: !this.state.modal,\n";
    content += "      modalType: type,\n";
    content += "    });\n";
    content += "  }\n\n";
    
    content += "  render () {\n";
    content += "    return (\n\n";
    
    content += "      <div className='row justify-content-center'>\n";
    content += "        <div className='col-md-12'>\n";
    content += "          <div className='custom-cards-container'>\n";
    content += "            <div className='custom-cards rounded-container box-shadow-container'>\n";
    content += "              <" + name2 + "Modal toggle={this.toggleModal} modal={this.state.modal} modalType={this.state.modalType} />\n\n";
    
    content += "              <" + name2 + "Table\n";
    content += "                toggleModal={this.toggleModal}\n";
    content += "                title = {'" + name2 + "s'}\n";
    content += "                filter = {{}}\n";
    content += "                reducers = {{ get: SET_" + name + "S, search: SET_SEARCHED_" + name + "S }}\n";
    content += "                toggle={ () => {\n";
    content += "                  this.toggleModal('update')\n";
    content += "                }}\n";
    content += "              />\n";              
    content += "            </div>\n";
    content += "          </div>\n";
    content += "        </div>\n";
    content += "      </div>\n";
    content += "    );\n";
    content += "  }\n";
    content += "}\n\n";
    
    content += "const mapStateToProps = (state) => ({\n";
    content += "  " + nameCamel + ": state." + nameCamel + ",\n";
    content += "})\n\n";
    
    content += "export default connect(mapStateToProps, {\n";
    content += "  GetList,\n";
    content += "})(" + name2 + ");\n\n";

    return await MakeFile(clientDirectory + 'src/components/' + name2 + '/', "index.js", content);
    
}

async function SetUpComponentFormFile (module, name, nameCamel, name2) {

    var content = "";
    
    content += "import React from 'react';\n";
    content += "import { connect } from 'react-redux';\n";
    content += "import LabelInput from './../helpers/LabelInput';\n\n";

    content += "import {\n";
    content += "  ArrangeAmount,\n";
    content += "  SetValue,\n";
    content += "  ArrangeName,\n";
    content += "  GetList,\n";
    content += "} from '../../actions/helpers/displayAction';\n\n";

    content += "import {\n";
    content += "  GetDate,\n";
    content += "} from '../../actions/helpers/dateAction';\n\n";

    content += "import {\n";
    content += "  SET_" + name + "_VALUE,\n";
    content += "} from './../../actions/types';\n\n";
    
    content += "import {\n";
    content += "} from '../../actions/" + nameCamel + "Action';\n\n";

    content += "class " + name2 + "Form extends React.Component {\n";

    content += "  constructor (props) {\n";
    content += "    super(props);\n\n";
   
    content += "    this.state = {\n";
   
    content += "    }\n";
    content += "  }\n\n";
   
    content += "  render () {\n\n";

    content += "    const { " + nameCamel + " } = this.props." + nameCamel + ";\n\n";

    content += "    return (\n\n";

    content += "      <div id='" + nameCamel + "-form' className='entry-form'>\n";
    content += "        <div>\n";
    content += "          <div className='custom-container'>\n";
    content += "              <div className='custom-container-title'>\n";
    content += "                " + name2 + " Details\n";
    content += "              </div>\n";
    content += "              <div className='custom-container-body'>\n";
    content += "                <div className='row'>\n\n";

    for (let x = 0; x < module.schemas.length; x++) {

        content += "                  <div className='inpt-grp col-md-4'>\n";
        content += "                    <LabelInput case={1}\n";
        content += "                      label={'" + module.schemas[x].name + ": '} value={" + nameCamel + "." + module.schemas[x].fieldName + "} prop='" + module.schemas[x].fieldName + "' type='text' req={1} dtype={5} case={1}\n";
        content += "                      onChange={(e) => {\n";
        content += "                        this.props.SetValue(e, SET_" + name + "_VALUE);\n";
        content += "                      }}\n";
        content += "                    />\n";
        content += "                  </div>\n\n";
    
    }

    content += "                </div>\n";
    content += "              </div>\n";
    content += "          </div>\n";
    content += "        </div>\n";
    content += "      </div>\n";
    content += "    );\n";
    content += "  }\n\n";

    content += "}\n\n";

    content += "const mapStateToProps = (state) => ({\n";
    content += "  " + nameCamel + ": state." + nameCamel + ",\n";
    content += "});\n\n";

    content += "export default connect(mapStateToProps, {\n";
    content += "  ArrangeAmount,\n";
    content += "  GetDate,\n";
    content += "  SetValue,\n";
    content += "  ArrangeName,\n";
    content += "  GetList,\n";
    content += "})(" + name2 + "Form);\n\n";    

    return await MakeFile(clientDirectory + 'src/components/' + name2 + '/', name2 + "Form.js", content);
        
}

async function SetUpComponentModalFile (module, name, nameCamel, name2) {

    var content = "";

    content += "import React from 'react';\n";
    content += "import { connect } from 'react-redux';\n\n";
    
    content += "import InfoModal from './../helpers/InfoModal';\n";
    content += "import " + name2 + "Form from './" + name2 + "Form';\n\n";
    
    content += "import {\n";
    content += "  add" + name2 + ",\n";
    content += "  update" + name2 + ",\n";
    content += "} from '../../actions/" + nameCamel + "Action';\n\n";
    
    content += "const " + name2 + "Modal = (props) => {\n\n";
    
    content += "  var butts = [];\n";
    content += "  if (props.modalType == 'add'){\n";
    content += "    butts.push({type: 'ADD', callback: props.add" + name2 + "});\n";
    content += "  }\n";
    content += "  if (props.modalType == 'update'){\n";
    content += "    butts.push({type: 'UPDATE', callback: props.update" + name2 + "});\n";
    content += "  }\n\n";
    
    content += "  return (\n";
    content += "    <InfoModal\n";
    content += "      size = {'60%'}\n";
    content += "      modal = {props.modal}\n";
    content += "      toggle = {props.toggle}\n";
    content += "      title = {'" + name2 + "'}\n";
    content += "      form = {<" + name2 + "Form modalType={props.modalType}/>}\n";
    content += "      buttons = {butts}\n";
    content += "    />\n";
    content += "  );\n\n";
    
    content += "}\n\n";
    
    content += "const mapStateToProps = (state) => ({\n\n";
    
    content += "})\n\n";
    
    content += "export default connect(mapStateToProps, {\n";
    content += "  add" + name2 + ",\n";
    content += "  update" + name2 + ",\n";
    content += "})(" + name2 + "Modal);\n\n";

    return await MakeFile(clientDirectory + 'src/components/' + name2 + '/', name2 + "Modal.js", content);
}

async function SetUpComponentTableFile (module, name, nameCamel, name2) {

    var content = "";

    content += "import React, {Fragment} from 'react';\n";
    content += "import { connect } from 'react-redux';\n\n";

    content += "import {\n";
    content += "  ArrangeDate,\n";
    content += "  ArrangeName,\n";
    content += "  GetList,\n";
    content += "  GetDetail,\n";
    content += "} from '../../actions/helpers/displayAction';\n\n";

    content += "import {\n";
    content += "  Set" + name2 + "Detail,\n";
    content += "  Set" + name2 + "Default,\n";
    content += "} from '../../actions/" + nameCamel + "Action';\n\n";

    content += "import DataTable from '../helpers/DataTable';\n\n";

    content += "const " + name2 + "Table = (props) =>  {\n";
    content += "    return (\n\n";

    content += "      <Fragment>\n\n";

    content += "        <DataTable\n";
    content += "          addData={() => {\n";
    content += "            props.Set" + name2 + "Default();\n";
    content += "            props.toggleModal('add');\n";
    content += "          }}\n";
    content += "          title = {props.title}\n";
    content += "          filter = {props.filter}\n";
    content += "          api = {{ get: '" + nameCamel + "/get', search: '" + nameCamel + "/get' }}\n";
    content += "          dataBank = { props." + nameCamel + " }\n";
    content += "          reducers = {props.reducers}\n";
    content += "          search = {{\n";
    content += "            options: [ \n";

    content += "              {value: '" + nameCamel + "ID', text: '" + name2 + " ID'}, \n";

    for (let x = 0; x < module.schemas.length; x++) {        
        content += "              {value: '" + module.schemas[x].fieldName + "', text: '" + module.schemas[x].name + "'}, \n";
    }

    content += "            ],\n";
    content += "            select: [], suggest: false,\n";
    content += "          }}\n";
    content += "          table = {{\n\n";

    content += "            head: [\n";
    content += "              { name: '#'},\n";
    content += "              { name: '" + name2 + " ID' , prop: '" + nameCamel + "ID', selected: true},\n";
    for (let x = 0; x < module.schemas.length; x++) {        
        content += "              { name: '" + module.schemas[x].name + "' , prop: '" + module.schemas[x].fieldName + "'},\n";
    }
    content += "            ],\n\n";

    content += "            body: (" + nameCamel + ", i) => {\n\n";

    content += "              return (\n";
    content += "                <tr style={{fontSize: '11px'}} className='clickable' data-id={" + nameCamel + "._id} onClick={ async (e) => {\n\n";

    content += "                  await props.Set" + name2 + "Detail(" + nameCamel + "._id);\n\n";

    content += "                  props.toggle();\n";
    content += "                   // props.GetDetail('" + nameCamel + "/detail', SET_DEVICE_DETAIL, " + nameCamel + "._id)\n";
    content += "                   //   .then(data => {\n";
    content += "                   //     // props.toggle();\n";
    content += "                   //   });\n\n";
    content += "                }}>\n"
    content += "                  <td scope='col'>{ i + 1 }</td>\n";
    content += "                  <td scope='col'>{ " + nameCamel + "." + nameCamel + "ID }</td>\n";
    for (let x = 0; x < module.schemas.length; x++) {        
        content += "                  <td scope='col'>{ " + nameCamel + "." + module.schemas[x].fieldName + " }</td>\n";
    }
    content += "                </tr>\n";
    content += "              )\n";
    content += "            }\n";
    content += "          }}\n";
    content += "        />\n";
    content += "      </Fragment>\n";
    content += "    );\n";
    content += "}\n\n";

    content += "const mapStateToProps = (state) => ({\n";
    content += "  " + nameCamel + ": state." + nameCamel + "\n";
    content += "})\n\n";

    content += "export default connect(mapStateToProps, {\n";
    content += "  ArrangeDate,\n";
    content += "  ArrangeName,\n";
    content += "  GetList,\n";
    content += "  GetDetail,\n";
    content += "  Set" + name2 + "Detail,\n";
    content += "  Set" + name2 + "Default,\n";
    content += "})(" + name2 + "Table);\n\n";

    return await MakeFile(clientDirectory + 'src/components/' + name2 + '/', name2 + "Table.js", content);
}

async function SetUpAppJS (name, nameCamel) {
    var contents = fs.readFileSync(clientDirectory + 'src/App.js', 'utf8');
    var perLine = (contents + "").split("\n");
    var newContent = "";
    console.log("::::::::::::::::----->>>>>");
    console.log(name);
    console.log(nameCamel);
  
    for (let x = 0; x < perLine.length; x++) {
  
        if ((perLine[x].trimRight("\r").trim(" ")) == "//=================~add component to routes~=================") {
            newContent += "        {\n";
            newContent += "            path: '/" + nameCamel + "',\n";
            newContent += "            component: " + name + ",\n";
            newContent += "            layout: true\n";
            newContent += "        },\n\n";
        }

        newContent += perLine[x];
  
        if ((perLine[x].trimRight("\r").trim(" ")) == "//=================~import component~=================") {
            newContent += "import " + name + " from './components/" + name + "';\n";
        }

    }
  
    return await MakeFile(clientDirectory + 'src/', "App.js", newContent);
  
  
    // fs.readFile('./server.js', function read (err, data) {
    //     var content = data;
    // });
}

async function SetUpConfigJS (name, nameCamel) {
    var contents = fs.readFileSync(clientDirectory + 'src/config.js', 'utf8');
    var perLine = (contents + "").split("\n");
    var newContent = "";

    for (let x = 0; x < perLine.length; x++) {
  
        if ((perLine[x].trimRight("\r").trim(" ")) == "//=================~setup component in APP_ROUTES config~=================") {
            newContent += "    {\n";
            newContent += "      active: false,\n";
            newContent += "      path: '/" + nameCamel + "',\n";
            newContent += "      text: '" + name + "'\n";
            newContent += "    },\n\n";            
        }

        newContent += perLine[x];
  
    }
  
    return await MakeFile(clientDirectory + 'src/', "config.js", newContent);
  
  
    // fs.readFile('./server.js', function read (err, data) {
    //     var content = data;
    // });
}

async function SetUpRoleFormMenu (name, nameCamel) {
    var contents = fs.readFileSync(clientDirectory + 'src/components/Role/RoleForm.js', 'utf8');
    var perLine = (contents + "").split("\n");
    var newContent = "";
  
    for (let x = 0; x < perLine.length; x++) {
  
        if ((perLine[x].trimRight("\r").trim(" ")) == "//=================~setup to role form menu -links ~=================") {
            newContent += "      {value: '/" + nameCamel + "', text: '" + name + "' },\n";
        }
        if ((perLine[x].trimRight("\r").trim(" ")) == "//=================~setup to role form menu -access ~=================") {
            newContent += "      '/" + nameCamel + "': '" + name + "',\n";
        }

        newContent += perLine[x];
  
    }
  
    return await MakeFile(clientDirectory + 'src/components/Role/', "RoleForm.js", newContent);
  
}
  

module.exports = {
    MakeFolder,
    MakeFile,
    CreateModule,
}
  