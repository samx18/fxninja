function abc(x,callback){
  x=5;
  callback(console.log(x));
}

function defx(a,callback){
  abc(a, function(x){
    var b = 6;
    callback(console.log(b));
  })
}

function mainx(callback){
  const i =5;
  let u = 0;
  if (i === 5){
    defx(3,function(c){
      u = 15;
    });
  } else{
    u =3;
  }
  callback(u)
}

// mainx(function(u){
//   console.log(u);
// });
mainx()
