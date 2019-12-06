const request = require("request");
const http = require('http');
http.globalAgent.options.ca = require('ssl-root-cas').create();
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const restClient = require("./rest-client.js");


app.use(cors());

const server = http.createServer(app);

// create the server
const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ server });
 
wss.on('connection', function connection(ws, req, client) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  console.log("****************", "client connected");
  console.log(wss.clients.length);
});

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send("Hellow World");
});

app.post("/stream", (req, res) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(req.body));
    }
  });
  res.status(200).json(req.body);
})

app.post("/stream/addToCart", (req, res) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const result = {event: req.body.events[0].SKU_ID, data: req.body.events[0]};
      console.log(result, JSON.stringify(result));
      client.send(JSON.stringify(result));
    }
  });
  res.status(200).json(req.body);
})

app.get("/getAddtoCartDetails/:id", (req, res) => {
  let skuId = req.params.id;
  let username = 'abhishek.a.karmakar@oracle.com';
  let pass = 'Oracle@123';
  let auth = 'Basic ' + new Buffer(username + ":" + pass).toString("base64");
  let options = {
    method: 'GET',
    url: 'https://api.oracleinfinity.io/v1/account/hsj8iasxuf/dataexport/oeyeea8yvj/data',  
    qs: {
      begin: '2019/11/28/00',
      end: 'latest',
      format: 'json',
      timezone: 'Asia/Calcutta'
    },
    headers: { Authorization: auth } 
  };
  
  let endResult = {quantity: 0};
  request(options, function (error, response) {
    if (error) throw new Error(error);
    let result = JSON.parse(response.body);
    if (result.dimensions && result.dimensions.length>0) {
      result.dimensions.forEach(dimension => {
        if (dimension.value == skuId) {
          dimension.measures.forEach(measure => {
            if (measure.guid == "Cart Adds") {
              endResult.quantity = measure.value;
            }
          })
        }
      })
    }
    res.status(200).json(endResult);
  });
})

app.get("/getMostViewedPage", (req, res) =>{
  var request = require("request");
  var username = 'abhishek.a.karmakar@oracle.com';
  var pass = 'Oracle@123';
  var auth = 'Basic ' + new Buffer(username + ":" + pass).toString("base64");
  var options = { method: 'GET',
  url: 'https://api.oracleinfinity.io/v1/account/hsj8iasxuf/dataexport/napwrnrlu4/data',  
  qs: { begin: '2019/11/28/00',
  end: 'latest',
  format: 'json',
  timezone: 'Asia/Calcutta' },
  headers: { Authorization: auth } };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    
    if(req.query){
        res.status(200).json(JSON.parse(response.body).dimensions.slice(0, req.query["count"]));
    }else{
        res.status(200).json(JSON.parse(response.body).dimensions[0].value);
    }
    
  });
});

app.post("/postClientErrors", function(req, res) {
  const payload = req.body;
  var options = {
    method: 'POST',
    "rejectUnauthorized": false,
    url: 'https://day384-191101-sql-263h.dq.lan/services/rest/connect/v1.3/incidents',
    headers:
    {
      Authorization: 'Basic YWRtaW46',
      "Content-Type": "application/json"
    },
    json: true,
    body: {
      "primaryContact":
      {
        "id": 2
      },
      "subject": "CHADS Incident "+ payload.errorMessage,
      "customFields": {
        "c": {
          "ic_text": JSON.stringify(payload)
        }
      }
    }
  };
  request(options, function (error, response, body) {
    if (error) console.log(error);

    console.log(body);
    res.status(204);
  });

})

 
var product_emailMap = {};
function createProductEmailMapping(details) {
  var orgRequest = details.organizationRequest;
  var ownerOfPurchaseList = orgRequest.owner;
  var email =
    ownerOfPurchaseList.firstName +
    "." +
    ownerOfPurchaseList.lastName +
    "@oracle.com";
  var productsList = orgRequest.items;
  productsList.forEach(function(item) {
    if (!product_emailMap[item.productId]) {
      product_emailMap[item.productId] = [];
    }
    product_emailMap[item.productId].push(email);
  });
  console.log(product_emailMap);
}
function generateMergeTriggerRecordsForEmails(emailList) {
  var mapRecordsFun = function(currentEmail) {
    var p = {
      fieldValues: [currentEmail, "some city"],
      optionalData: [
        {
          name: "FIRST_NAME",
          value: currentEmail
        },
        {
          name: "LAST_NAME",
          value: currentEmail
        }
      ]
    };
    return p;
  };
  return emailList.map(mapRecordsFun);
}
function updateEmailTemplate(productDetails) {
  var offerEndDate = new Date(productDetails.endDate);
  var emailContent = `
  <html>
  <style>
  body { background-color: linen;}h1,h2,h3,img {color: maroon;  margin-left: 40px;}
  em{color:RED}
  </style>
  <head>
  <title>Price reduced...</title>
  </head>
  <body>
  <h3>Coaxial Audio Cable is on <em>SALE</em></h3>
  <a href="http://busgk0712.us.oracle.com:8080/coaxial-audio-cable/product/prod10027">
  <img src="http://busgk0712.us.oracle.com:8080/ccstore/v1/images/?source=/file/v978911732589130808/products/coaxialcable_LARGE.jpg&height=200&width=200"/>
  </a>
  <h2>BUY @ $${productDetails.listPrice}</h1>
  <h3>Hurry Up, This Offer is valid till ${offerEndDate}</h1>
  </body>
  </html>`;
  var payLoad = {
    documentPath: "/contentlibrary/diwakara/f1/new.htm",
    content: emailContent
  };
  restClient.getAuthToken().then(res => {
    console.log("-------", res.authToken);
    var authHeader = { Authorization: res.authToken };
    restClient
      .makePostCall(
        "clDocs/contentlibrary/diwakara/f1/new.htm",
        authHeader,
        payLoad
      )
      .then(res => {
        console.log("------------123", res);
      });
  });
}
app.post("/chads/email", function(req, res) {
  res.send("Hellow World");
  if (req.body.organizationRequest.owner) {
    createProductEmailMapping(req.body);
    return;
  }
  console.log("req.body-----", req.body);
  var productDetails = req.body.organizationRequest;
  var emailList = product_emailMap[productDetails["productId"]];
  emailList.push("diwakara.kammara@oracle.com");
  emailList.push("chandrakanth.challa@oracle.com");
  emailList.push("hari.pala@oracle.com");
  emailList.push("abhishek.a.karmakar@oracle.com");
  console.log("emailList for ", emailList);
  updateEmailTemplate(productDetails);
  var records = generateMergeTriggerRecordsForEmails(emailList);
  console.log("----------records generated", records);
  var email_payload = {
    mergeTriggerRecordData: {
      mergeTriggerRecords: records,
      fieldNames: ["EMAIL_ADDRESS_", "CITY_"]
    },
    mergeRule: {
      htmlValue: "H",
      matchColumnName1: "EMAIL_ADDRESS_",
      matchColumnName2: null,
      optoutValue: "O",
      insertOnNoMatch: true,
      defaultPermissionStatus: "OPTIN",
      rejectRecordIfChannelEmpty: "E",
      optinValue: "I",
      updateOnMatch: "REPLACE_ALL",
      textValue: "T",
      matchOperator: "NONE"
    }
  };
  restClient.getAuthToken().then(res => {
    console.log("-----", res.authToken);
    var authHeader = { Authorization: res.authToken };
    restClient
      .makePostCall("campaigns/test-12345/email", authHeader, email_payload)
      .then(res => {
        console.log("------------123", res);
      });
  });
});
server.listen(process.env.PORT || 8000, function() { });
