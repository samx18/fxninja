var cc = require('currency-codes');
var country = 'russia';
var countries = cc.countries();
//console.log(cc.country('India')["code"]);
var ccCode = cc.country(country);
if (countries.indexOf(country) > -1){
  console.log("Valid country");
  console.log(ccCode[0].code);
}
else{
    console.log("Invalid country");
  }
