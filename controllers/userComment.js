const mongoose = require('mongoose');

const UserComment = require('../models/UserComment');
const UserCommentClass = require('../modules/UserCommentClass');

const { TryCatch }    = require('../routes/middleware/log-helper');
const { GetNewID }    = require('../routes/middleware/registration-helper');

exports.new = (req, res) => {
  TryCatch(async (res, req) => {
    var data = req.body;
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLL");
    console.log(req.userInfo);

    commentID = await GetNewID (UserComment, "commentID", 1, 3, "CMMT");
    const newUserComment = new UserCommentClass({
      ...data.userComment,
      user: req.userInfo.id,
      commentID: commentID[0]
    });


    newUserComment
      .save()
      .then(data => {
        res.json({status: true, userComment: data});
      })
  }, "Add new userComment", "Server - api/userComment.js -> Line: 19 - 30", 2, req, res);
}

exports.update = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    const userComment = new UserCommentClass({
      ...data.userComment
    });

    userComment
      .update()
      .then(data => {
        res.json({status: true, userComments: data});
      })
      .catch((err) => {
        res.json({status: false, error: err});
      });
  }, "Add Update userComment", "Server - api/userComment.js -> Line: 19 - 30", 2, req, res);
}


exports.commentReply = (req, res) => {
  TryCatch((res, req) => {
    var data = req.body;

    UserCommentClass.getUserComments(1, 1, {_id: data.commentId})
      .then(comment => {

        const userComment = new UserCommentClass({
          commentID: comment[0].commentID,
          commentType: comment[0].commentType,
          user: comment[0].user._id,
          location: comment[0].location,
          comment: comment[0].comment,
          replies: [...comment[0].replies, {
            msg: data.reply,
            user: mongoose.Types.ObjectId(req.userInfo.id),
            date: new Date(),
          }],
          resolved: comment[0].resolved,
          viewed: comment[0].viewed,
          date: comment[0].date,
          _id: comment[0]._id,
        });

        userComment
          .update()
          .then(data => {
            if (data.status) {
              res.json({
                status: true,
                userId: req.userInfo.id,
                date: data.data.replies[data.data.replies.length-1].date
              })                
            }else {
              res.json({status: false, error: data.error});
            }
          })
          .catch((err) => {
            res.json({status: false, error: err});
          });
      
      })
      .catch((err) => {
        res.json({
          status: false,
          error: err
        })
      });

  //   const userComment = new UserCommentClass({
  //     ...data.userComment
  //   });

  //   userComment
  //     .update()
  //     .then(data => {
  //       res.json({status: true, userComments: data});
  //     })
  //     .catch((err) => {
  //       res.json({status: false, error: err});
  //     });
  }, "Add Update userComment", "Server - api/userComment.js -> Line: 19 - 30", 2, req, res);
}

exports.getMine = (req, res) => {
  TryCatch((res, req) => {
    
    var data = (req.query.filters)?JSON.parse(req.query.filters):{};
    var cond = data.find;
    
    var keys = Object.keys(cond || []);

    var userId = mongoose.Types.ObjectId(req.userInfo.id);

    keys.map((key, i) => {
      cond[key] = new RegExp(["", cond[key], ""].join(""), "i")
    });

    if (req.query.value){
      cond = (cond)?[cond]:[];
      var value = JSON.parse(req.query.value)
      var props = value.props;
      var regex = new RegExp(["", value.keyword, ""].join(""), "i");

      // if (props == "userComment"){
      //   cond.push({ $or: [{["division"]: regex}, {["section"]: regex}, {["code"]: regex}]});
      // } else {
      // }
      cond.push({[props]: regex});

      cond = {
        $and: cond
      };
    }


    UserCommentClass.getUserComments(data.page, data.count, {...cond, user: userId}, data.sort, data.select)
      .then(userComments => {
        UserCommentClass.count({...cond, user: userId}).then((count) => {
          res.json({status: true, data:{ userComments: userComments, count: count}});
        })
      })
      .catch(error => {
        res.json({error: 'error message'});
      });

  }, "Get UserComments", "Server - api/userComment.js -> Line: 19 - 30", 2, req, res);
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

      // if (props == "userComment"){
      //   cond.push({ $or: [{["division"]: regex}, {["section"]: regex}, {["code"]: regex}]});
      // } else {
      // }
      cond.push({[props]: regex});

      cond = {
        $and: cond
      };
    }

    UserCommentClass.getUserComments(data.page, data.count, cond, data.sort, data.select)
      .then(userComments => {
        UserCommentClass.count(cond).then((count) => {
          res.json({status: true, data:{ userComments: userComments, count: count}});
        })
      })
      .catch(error => {
        res.json({error: 'error message'});
      });

  }, "Get UserComments", "Server - api/userComment.js -> Line: 19 - 30", 2, req, res);
}