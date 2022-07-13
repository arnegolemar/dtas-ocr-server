const Position = require('../models/Position');
const PositionClass = require('../modules/PositionClass');

const { TryCatch } = require('../routes/middleware/log-helper');
const { GetNewID } = require('../routes/middleware/registration-helper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;

    console.log(data);

    positionID = await GetNewID(Position, "positionID", 1, 5, "POS");
    const newPosition = new PositionClass({
      ...data.position,
      positionID: positionID[0]
    });

    newPosition
      .save()
      .then(data => {
        res.json({ status: true, position: data });
      })
  }, "Add new Position", "Server - api/position.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;
    console.log(data.position);
    const position = new PositionClass({
      ...data.position
    });

    position
      .update()
      .then(data => {
        res.json({ status: true, positions: data });
      })
      .catch((err) => {
        res.json({ status: false, error: err });
      });
  }, "Add Update Position", "Server - api/position.js -> Line: 19 - 30", 2, req, res);
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

    PositionClass.getPositions(data.page, data.count, cond, data.sort, data.select)
      .then(positions => {
        PositionClass.count(cond).then((count) => {
          res.json({ status: true, data: { positions: positions, count: count } });
        })
      })
      .catch(error => {
        res.json({ error: 'error message' });
      });

  }, "Get Positions", "Server - api/position.js -> Line: 19 - 30", 2, req, res);
}
