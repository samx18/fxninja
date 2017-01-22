var request = require('request');
const url1 = "http://api.fixer.io/latest?base="
const url2 = "&symbols="
let u = 1;
let base = "USD";

function fixer(base,symbol,callback){

	request.get(url1+base+url2+symbol, function(err,res,body){
		console.log(body);
		var info = JSON.parse(body); // convert JSON to JS Object
		console.log(info);
		console.log(info.rates[symbol]);
		callback(info.rates[symbol])
	});

}

function getFixer(base,symbol,callback){
	fixer(base,symbol,function(value){
	console.log(value);
	});
}
