#!/usr/bin/node

var fs = require("fs");
var text = fs.readFileSync("./sonnets.xml");
const cheerio = require('cheerio');
const $ = cheerio.load(text);
var stext=[]
$('page').each(function( page ) {
  var i= $( this ).attr('number')
  console.log("<page number=" +i + ">" +$( this ).text()+"</page>" );
});
