const request = require("request");

var server_URL = "https://api-004.stage3.responsys.net/rest/api/v1.3/";
var login_URL="https://login.stage3.responsys.net/rest/api/v1.3/";

let is_proxy_enabled = process.env.PORT != 8000 ? false : true;

function setProxy(options) {
  if (is_proxy_enabled) {
    options.proxy = "http://www-proxy.us.oracle.com/";
  }
}

function getAuthToken() {
  var payload = {
    user_name: "ws_stage3qa66",
    password: "Welcome1234!",
    auth_type: "password"
  };

  var options = {
    method: "POST",
    url: login_URL + "/auth/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    form: payload
  };

  setProxy(options);
  return new Promise(function(resolve, reject) {
    console.log("-------------->",payload);
    request(options, function(error, response, body) {
      if (error) console.log(error);
      resolve(JSON.parse(body));
      console.log(body);
    });
  });
}
function doPost(uri, extraHeaders, payload) {
  console.log("uri is-------", uri);
  console.log("extraHeaders is-------", extraHeaders);
  console.log("payload is -------", payload);
  var options = {
    json: true,
    method: "POST",
    url: server_URL + uri,
    headers: {
      "Content-Type": "application/json"
    },
    body: payload
  };

  setProxy(options);
  if (extraHeaders) {
    for (var property in extraHeaders) {
      options.headers[property] = extraHeaders[property];
    }
  }
  console.log("options is---------", options);
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) console.log(error);
      console.log(body);
      resolve(body);
    });
  });
}

exports.makePostCall = doPost;
exports.getAuthToken = getAuthToken;
