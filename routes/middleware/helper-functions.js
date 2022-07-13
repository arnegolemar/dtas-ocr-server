const https = require('https');


function GetValueOfProps (obj, props) {
  props = props.split(".");
  var x;
  for (x = 0; x < props.length; x++){
    obj = obj[props[x]];
  }
  return obj;
}


function sendPushNotification (app = '', opts = {}, otherData = {}) {
  /*
    app = 'transeekapp' or 'transeekdriver'

    options: {
      userid: ${5ca6f86e2c4dd23684569222} or all or drivers or passengers or arrays of IDS [5ca6f86e2c4dd23684569222, 5ca6f86e2c4dd23684569222, 5ca6f86e2c4dd23684569222],
      contents: "" // string content
      headings: ""// string content,
      data: {
        action: {
          PUSH_ACTION: 1, // refer numbers to the mobile app list of push notification actions/functions
          executeOnReceive: true, // or false
          executeOnOpen: false, // or true
        },
        other: otherData
      }
    }

  */

  var data = {
    filters: [
      {
    		field: "tag",
    		key: "userid",
    		value: opts.userid
    	}
    ],
    contents: {"en": opts.contents},
    headings: {"en": opts.headings},
    data: {
      action: opts.action
    },
    app_id: "f7cef5e0-962c-4e32-b19d-8c18f30b1c11",
    priority: 10
  };



  var transeekAppOneSignalID = "f7cef5e0-962c-4e32-b19d-8c18f30b1c11";
  var transeekAppOneSignalAPIKEY = "NzYyNjQzZTgtNmYwNS00ZjQxLTkxMDktODJmMTRlZTY3OGIw";

  var transeekDriverOneSignalID = "7341ac2e-e1fa-49ba-a6da-984fbbfce60c"
  var transeekDriverOneSignalAPIKEY = "Nzg5MjUzOWYtNTQzYS00YTIxLTg3NjAtZTQ5MjBiZDRmNTEx"

  var apiKey = transeekAppOneSignalAPIKEY;

  if (app == 'transeekapp') {
    data.app_id = transeekAppOneSignalID;
    apiKey = transeekAppOneSignalAPIKEY;
  }else if (app == 'transeekdriver'){
    data.app_id = transeekDriverOneSignalID;
    apiKey = transeekDriverOneSignalAPIKEY;
  }

  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic " + apiKey
  };

  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  }

  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });

  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();
}


function getDistance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
    if (unit=="M") { dist = (dist * 1.609344)*1000}
		return dist;
	}
}



module.exports = {
	GetValueOfProps,
  sendPushNotification,
  getDistance
}
