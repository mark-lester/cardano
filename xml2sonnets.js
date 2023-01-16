#!/usr/bin/node

var fs = require("fs");
var text = fs.readFileSync("./sonnets.xml");
const cheerio = require('cheerio');
const $ = cheerio.load(text);
var stext=[]
$('sonnet').each(function( sonnet ) {
  var i= $( this ).attr('number')
  if (!stext[i])
    stext[i]=""

  stext[i]+=$( this ).text();
});
stext.forEach((x, i) =>{
  console.log( i++ + ": " +x );

})
