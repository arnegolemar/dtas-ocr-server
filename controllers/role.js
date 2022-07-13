const Role = require('../models/Role');
const RoleClass = require('../modules/RoleClass');

const { TryCatch } = require('../routes/middleware/log-helper');
const { GetNewID } = require('../routes/middleware/registration-helper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    console.log(data);

    roleID = await GetNewID(Role, "roleID", 1, 5, "ROLE");
    const newRole = new RoleClass({
      ...data.role,
      roleID: roleID[0]
    });

    newRole
      .save()
      .then(data => {
        res.json({ status: true, role: data });
      })
  }, "Add new Role", "Server - api/role.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;
    console.log(data.role);
    const role = new RoleClass({
      ...data.role
    });

    role
      .update()
      .then(data => {
        res.json({ status: true, roles: data });
      })
      .catch((err) => {
        res.json({ status: false, error: err });
      });
  }, "Add Update Role", "Server - api/role.js -> Line: 19 - 30", 2, req, res);
}

exports.get = (req, res) => {
  TryCatch((res, req) => {

    var data = (req.query.filters) ? JSON.parse(req.query.filters) : {};
    var cond = data.find;

    var keys = Object.keys(cond || []);

    keys.map((key, i) => {
      cond[key] = new RegExp(["", cond[key], ""].join(""), "i")
    });

    if (req.query.value) {
      cond = [cond];
      var value = JSON.parse(req.query.value)
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      cond.push({ [props]: regex });

      cond = {
        $and: cond
      };
    }

    RoleClass.getRoles(data.page, data.count, cond, data.sort, data.select)
      .then(roles => {
        RoleClass.count(cond).then((count) => {
          res.json({ status: true, data: { roles: roles, count: count } });
        })
      })
      .catch(error => {
        res.json({ error: 'error message' });
      });

  }, "Get Roles", "Server - api/role.js -> Line: 19 - 30", 2, req, res);
}
