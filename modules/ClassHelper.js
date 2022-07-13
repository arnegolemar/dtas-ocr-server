var mongoose = require('mongoose');
class ClassHelper {

    static arrangeFilter (filter, ids = []) {
      if (filter.hasOwnProperty("date")) {
        var from = new Date(filter.date.from),
            to   = new Date(filter.date.to);
        
        if (filter.date.from === filter.date.to){
          delete filter.date;
          filter = {
            ...filter,
            day: from.getDate(),
            month: from.getMonth() + 1,
            year: from.getFullYear()
          }
        }else {
          to.setDate(to.getDate() + 1);
          filter.dateTemp = {
            $gte: from,
            $lt: to,
          }
          delete filter.date;
        }
      }

      var id = null;
      for (let x = 0, len = ids.length; x < len; x++) {
        id = ids[x];
        if (filter.hasOwnProperty(id)){
          filter[id] = mongoose.Types.ObjectId(filter[id]);
        }  
      }

      return filter;
    }

  }

module.exports = ClassHelper;
