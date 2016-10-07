var solc = require('solc');
var  fs = require('fs');
var Promise = require("bluebird");
var crypto = Promise.promisifyAll(require("crypto"));
var Web3 = require('web3');
var web3 = new Web3(); 

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];
  });

var input =fs.readFileSync(__dirname+'/Securities.sol','utf8');

var output = solc.compile(input, 1);
var bc = output.contracts['Securities'].bytecode;
var abi =  output.contracts['Securities'].interface;
var contract1 = web3.eth.contract(JSON.parse(abi));
var contractInstance;
if(contractInstance===undefined){
 contractInstance = contract1.new({from: web3.eth.accounts[0], data: bc, gas: 1000000});
}
else{
contractInstance= contract1.at(contractInstance.address);
}

var PORT = 9099;
var express = require('express');
var app = express();
var fs = require('fs');
var Entities = require('html-entities').XmlEntities;
entities = new Entities();



app.post('/Security', function (req, res) {
    if (req.method == 'POST') {
        var jsonString = '';

        req.on('data', function (data) {
            jsonString += data;
        });

        req.on('end', function () {

            console.log('Received Payload Body : '+jsonString);
            var body=JSON.parse(jsonString);
            var action = body.action;
            var security = body.security;
            var company = body.company;
            var symbol = body.symbol;
            var securityType = body.securityType;
            var created = body.created;
            var issued = body.issued;
            var numberOutstanding = body.numberOutstanding;
            var privateSecurity = body.privateSecurity;;
            var primaryFeePct = body.primaryFeePct;
            var secondaryFeePct = body.secondaryFeePct;

           
            if(action=='AddSecurityDetails'){
	            var result=contractInstance.AddSecurityDetails(security,company,symbol,securityType,created,issued,numberOutstanding,privateSecurity,primaryFeePct,secondaryFeePct,{from:account,gas:800000});
              if(result!=undefined){
                res.writeHead(200, {
                'Content-Type': 'application/json'
                });
	            res.end(JSON.stringify({
		          status : 'success'
                }));
              }
            else{
	            res.end(JSON.stringify({
		          status : 'failed',
              error_code : '1'
                  }));
                }
            }
            else{
            res.writeHead(400, {
            'Content-Type': 'application/json'
              });
	          res.end(JSON.stringify({
		          status : 'failed',
              error_code : '400'
                }));
              }
        });
    }
});


app.get('/getAllSecurities', function(req, res) {
	
	var result=contractInstance.GetAllSecurities();
	
    console.log('Response for GetAllSecurities from Blockchain : '+result);
    var IDs=[];
    var Symbols=[];
    var len=result[0].length;
    for(var i=0;i<len;i++){
        IDs.push(result[0][i]);
        Symbols.push(Bytes32ToString(result[1][i]));
    }

	res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
		status : 'success',
        Securities : {
            ID : JSON.stringify(IDs),
            Symbol : JSON.stringify(Symbols)
        }
		
        }));
	
	
}); 


app.get('/Security/:id',function(req, res) {
	
    var securityId=req.params.id;
    var result = contractInstance.GetSecurityDetailsById_Part1(securityId);
    var result2 = contractInstance.GetSecurityDetailsById_Part2(securityId);
    var security = result[0];
    var company = result[1];
    var symbol = result[2];
    var securityType = result[3];
    var created = result[4];
    var issued = result[5];
    var numberOutstanding = result[6];
    var privateSecurity = result2[0];
    var primaryFeePct = result2[1];
    var secondaryFeePct = result2[2];


	/*var symbolString = '';
    for (var i = 0; i < symbol.length; i += 2){
    symbolString += String.fromCharCode(parseInt(symbol.substr(i, 2), 16));
	}
    var mystr=symbolString.replace('\0','').replace(/\0/g,'');*/

  
	res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
		status : 'success',
        security : security,
        company : company,
        symbol :  Bytes32ToString(symbol),
        securityType : securityType,
        created : Bytes32ToString(created),
        issued : Bytes32ToString(issued),
        numberOutstanding :  numberOutstanding,
        private : privateSecurity,
        primaryFeePct : primaryFeePct,
        secondaryFeePct : secondaryFeePct
		
        }));
	
	
});


  
  function Bytes32ToString(inputStr){
    var OutputStr = '';
    for (var i = 0; i < inputStr.length; i += 2){
    OutputStr += String.fromCharCode(parseInt(inputStr.substr(i, 2), 16));
	}
    return OutputStr.replace('\0','').replace(/\0/g,'');
  }




app.listen(PORT, function() {
    console.log('app listening on port ', PORT);
});
