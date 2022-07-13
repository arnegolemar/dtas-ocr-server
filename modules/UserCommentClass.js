const UserComment = require('../models/UserComment');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

class UserCommentClass {

  constructor (data) {
    this.commentID   = (data.commentID)?data.commentID:""; 
    this.commentType = (data.commentType)?data.commentType:1; 
    this.user        = (data.user)?data.user:null;
    this.location    = (data.location)?data.location:"";

    this.comment     = (data.comment)?data.comment:"";
    this.replies     = (data.replies)?data.replies:[]; 

    this.resolved    = (data.resolved)?data.resolved:0;
    this.viewed      = (data.viewed)?data.viewed:0;
    this.date        = (data.date)?data.date:undefined;

    this._id         = (data._id)?data._id:"";
  }

  save () {
    return new Promise ((resolve, reject) => {
      var newUserComment = new UserComment({
        commentID    :this.commentID, 
        commentType  :this.commentType,
        user         :this.user,
        location     :this.location,
        comment      :this.comment,
        replies      :this.replies, 
        resolved     :this.resolved,
        viewed       :this.viewed,
        date         :this.date,
      });

      newUserComment.save()
        .then((data) => {
          resolve(data);
        })
    }); // end promise
  }

  update (){
    return new Promise ((resolve, reject) => {
      UserComment.findById(this._id, (err, userComment) => {
        userComment.commentID   = this.commentID; 
        userComment.commentType = this.commentType;
        userComment.user        = this.user;
        userComment.location    = this.location;
        userComment.comment     = this.comment;
        userComment.replies     = this.replies; 
        userComment.resolved    = this.resolved;
        userComment.viewed      = this.viewed;
        userComment.save();
      })
        .then((data) => resolve({ status: true , data: data}))
        .catch(err => {
            reject({ status: false , error: err});
        });

    }); // end promise
  }
  ///================ static methods ======================

    static count (filter = {}) {

      return new Promise (resolve => {
        UserComment
          .find(filter)
          .count()
          .then(count => {
            resolve(count)
          })
      })

    }

    static getUserComments (page = 1, count = 10, filter = {}, sort = {'date': -1}, select = []) {

      return new Promise ((resolve, reject) => {

        UserComment
          .find(filter)
          .populate({path: "user"})
          .populate({path: "replies.user"})
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

      }) 

    }

    static getUserCommentDetail (cond) {
      return new Promise (resolve => {
        UserComment
          .find(cond)
          .then(data => {
            resolve(data)
          })
      })
    }

  }

module.exports = UserCommentClass;
