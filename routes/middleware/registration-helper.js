// const PersonalInfo = require('../../models/PersonalInfo');
// const User = require('../../models/User');
// const CreditTransaction = require('../../models/CreditTransaction');
// const Branch = require('../../models/Branch');

function arrangeNumber (value, places) {
  var valLen = (value+"").length;
  if (valLen >= places)
    return value

  var zeros = "";

  while (valLen++ < places)
    zeros = zeros + "0";
  return zeros + (value + "");
}

async function GetNewID (Collection, field, count = 1, digit, prefix, postfix = "", del = "-") {
  var ids = [];
  var temp;
  await Collection
    .find()
    .select([field])
    .limit(1)
    .sort({[field]: -1})
    .then(data => {
      
      if (data.length > 0 && data[0][field]){
        var prevID = data[0][field].split("-");
        var date = new Date();
        var y = date.getFullYear() + "", m = date.getMonth()+1, num = 0;
        date = (y[2] + "" + y[3]) + (arrangeNumber(m*1, 2));

        if (prevID[1] == date){
          num = (prevID[2]*1)+1;
        }
        for (var x = 0; x < count; x++) {
          ids.push(
            prefix + ((prefix!= "")?del:"") + date + del + (arrangeNumber(num + x, digit)) + ((postfix!= "")?del:"") + postfix
          );
        }
      }else {
        var date = new Date();
        var y = date.getFullYear() + "", m = date.getMonth()+1;

        for (var x = 0; x < count; x++) {
          ids.push(
            prefix + ((prefix!= "")?del:"") + (y[2] + "" + y[3]) + (arrangeNumber(m*1, 2)) + del + (arrangeNumber(x, digit)) + ((postfix!= "")?del:"") + postfix
          );
        }
      }
    })
    .catch(err => {
      return err;
    });
    
    return ids;
}

module.exports = {
  // GetNewCustomerID,
  // GetNewTransactionID,
  // GetNewBranchID,
  // GetNewUserID,
  GetNewID,
}
