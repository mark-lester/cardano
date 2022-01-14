#!/usr/bin/node
let argv = require('minimist')(process.argv.slice(2));
const DEBUG=argv['d'] || false
const VERBOSE=argv['v'] || false
const PRINT_GRID=argv['p'] || false
const REVERSE_IT=argv['R'] ? false : true
console.log("REVERSE="+REVERSE_IT)
let DICTIONARIES=argv['_']
if (DICTIONARIES.length === 0){
	console.error("Usage: cardano.js <list of dictionary files>")
	process.exit()
}
const DEFAILT_MIRROR_FILE='mirror.def'
const MIRROR_FILE=argv['m'] || DEFAILT_MIRROR_FILE
const DEFAILT_RABUS_FILE='rabuses.def'
const RABUS_FILE=argv['r'] || DEFAILT_RABUS_FILE
const DEFAILT_SPECIAL_FILE='special.list'
const SPECIAL_FILE=argv['s'] || DEFAILT_SPECIAL_FILE
const DEFAULT_CARDANO_OBJECT_FILE='cardano.object'
const CARDANO_OBJECT_FILE=argv['c']||DEFAULT_CARDANO_OBJECT_FILE

const MINIMUM_WORD_LENGTH=argv['w']||4
const fs = require('fs')
let Specials={}
let Avalue="A".charCodeAt(0);
let rabuses=getRabuses()
let BIG_REGEXP=getExpression()
let data=getObject(CARDANO_OBJECT_FILE)
grids=getGrids(data)
	.map(ScanGrid)
	.sort((b,a) => (a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0))

let best=grids.filter(g=>g.score === grids[0].score).map(g=>g.grid[0].length)
console.log("BEST GRID"+(best.length>1?'S':'')+" "+best)
console.log("SCORE "+grids[0].score)
if (VERBOSE)
	grids.map(g=>console.log(g.grid[0].length,g.score,g.hits.length,g.hits.map(h=>h.match+"@"+h.address)))
else
	grids.map(g=>console.log(g.grid[0].length,g.score,g.hits.length))

if (PRINT_GRID)
	getGrid(data,PRINT_GRID).map(l=>console.log(l.join('')))
process.exit()

function getExpression(){
	let words=[]
	let special=getWords(SPECIAL_FILE,2).map(latinize)
	special.map(s=>{
		Specials[s]=1;
		words=words.concat(permutator(s))
	})
	words=words.filter(onlyUnique)
if (DEBUG) console.log("PERMUTED="+words)
	DICTIONARIES.map(d=>words=words.concat(getWords(d).map(latinize)))
if (DEBUG) console.log("DICTIONARY SIZE="+words.length)

	let exp=words.join('|')
	return new RegExp(exp,'g')
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}


function latinize(text){
	return text
		.toUpperCase()
		.replace(/J/,'I')
		.replace(/U/,'V')
//		.replace(/F/,'S')
}

function findStuff(exp,s){
	let m
	let output=[]
	do {
		m = exp.exec(s);
		if (m) {
if (DEBUG) console.log("MATCH="+m[0])
			output.push({
				match:m[0],
				start:m.index
    			})
		}
	} while (m);
	return output
} 

function getGrids(data){
//	data=latinize(data)
	let width=4
	let output=[]
	do {
		output.push(getGrid(data,width))
		width++
	} while (data.length/width > 4)

	return output
}

function getGrid(data,length){
	let offset=0
	let output=[]
	while (offset <= data.length){
		output.push(data.slice(offset,offset+length))
		offset+=length
	}
	return output
}

function ScanGrid(grid){
const Product = (accumulator, curr) => accumulator * curr;
const Sum = (accumulator, curr) => accumulator + curr;
	let output={
		hits:[],
		score:0,
		scores:[],
		grid:grid
	}
if (DEBUG) console.log("GRID WIDTH "+grid[0].length)
if (DEBUG > 1) grid.map(g=>console.log(g.join('')))

	rabuses.map(r => {
		getInstances(r,grid).map(i =>{
if (DEBUG > 1) console.log("SEARCH "+i.text)
			var hits=findStuff(BIG_REGEXP,i.text)
			if (REVERSE_IT){
				console.log("REVERSE="+i.reversal)
				hits=hits.concat(findStuff(BIG_REGEXP,i.reversal))
			}

			if (!hits.length)
				return

			hits.map(m=>{
				m.rabus=r
				m.instance=i
				m.address=codify(r,i,m)
				m.code=hashCode(m.address)
				m.score=rateMatch(m.match)
if (DEBUG) console.log("MATCH "+m.match)

			})

			let tmatched=hits.map(m=>m.match.length*Factor(m.natch)).reduce(Sum)
			let total=rateLength(tmatched)/Math.pow(2,hits.length)
			hits.map(m=>m.score=total)
			output.hits=output.hits.concat(hits)
		})
	})
	let found={}
	output.hits=output.hits
		.sort((a,b)=>
			(a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 
				(a.rabus.cells.length > b.rabus.cells.length ) ? 1 :
				((b.rabus.cells.length > a.rabus.cells.length ) ? -1 : 0)
		))
		.filter(hit=>{
			if (found[hit.code])
				return false
			found[hit.code]=1
			output.scores.push(hit.score)
			return true
		})
if (DEBUG) console.log("REDUCED HITS "+output.hits.length)
	if (output.scores.length)
		output.score=output.scores.reduce(Sum)
	return output
}

function codify(r,i,m){
	let cstring=""
	let c=[]
	r.cells.slice(i,m.match.length).map(c=>{
		return (c.col+i.ox+1) +":"+ (c.row+i.oy+1)
	})
	.sort()
	.map(s=>{
		cstring+=s+","
	})
	return cstring
if (DEBUG > 1) console.log("CODING "+cstring,hashCode(cstring))
}


function rateMatch(match){
	return rateLength(match.length*Factor(match))
}

function Factor(match){
	return 1
	return (Specials[match] || 0) + 1
}

function rateLength(length){
	return Math.pow(2,length)
}


function getInstances(rabus,grid){
	let width=0
	grid.map(l=>width=Math.max(width,l.length))
	let output=[]
	const height=grid.length
	let ox,oy;

	for (ox=0;ox+rabus.width <= width;ox++){
		for (oy=0;oy+rabus.height <= height+1;oy++){
			output.push(pluckInstance(rabus,grid,ox,oy))
		}
	}
	return output
}

function getWords(file,length){
	let data
	length=length || MINIMUM_WORD_LENGTH
	try {
		data = fs.readFileSync(file, 'utf8')
	} catch (err) {
		console.error(err)
	}
	return data.split(/\W+/)
		.filter(word => word.length >= length)
}

function getRabuses(){
	let rabuses=getRabuseFile(RABUS_FILE)
	let mirror=getRabuseFile(MIRROR_FILE) || []
	let flipped=mirror.map(r=> ( {
			width:r.width,
			height:r.height,
			cells: r.cells.slice(0).reverse()
		})
	)

	return mirror.concat(flipped).concat(rabuses)
}

function getRabuseFile(file){
	let data
	try {
		data = fs.readFileSync(file, 'utf8')
	} catch (err) {
		console.error(err)
	}
	return data.split(/\n\s*\n/)
	.filter(r => r.length > 0)
	.map(parseRabus)
}

function getObject(file){
	let data
	try {
		data = fs.readFileSync(file, 'utf8')
	} catch (err) {
		console.error(err)
	}
	return data.replace(/\W+/g,'').split('')
}


function pluckInstance(rabus,grid,ox,oy){
	function pluckCell(cell){
		if (!grid[oy+cell.row])
			return undefined

		return grid[oy+cell.row][ox+cell.col]
	}
	var text=rabus.cells.map(pluckCell).join('')
	var reversal=REVERSE_IT ? text.split('').slice(0).reverse().join('') : ''
	return {
		rabus:rabus,
		ox:ox,
		oy:oy,
		text:text,
		reversal:reversal
	}
}


function parseRabus(def){
	let row=0
	let width=0
	let cells=[]
	function parseLine(line){
		row++
		let col=0
		function parseCell(val){
			col++
			if (val === ' ')
				return undefined
			if (width < col)
				width=col
			return {
				row:row-1,
				col:col-1,
				order:alphanum(val)
			}
		}

		cells=cells.concat(line.split('').map(parseCell))
	}

	def.split(/\n/).map(parseLine)
	cells=cells
		.filter(c=>c!=undefined)
		.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0))

	return {
		width:width,
		height:row,
		cells:cells
	}
}

function alphanum(val){
	if (val.match(/\d/))
		return val+0
	return val.toUpperCase().charCodeAt(0) - Avalue + 10
}

	

function permutator(input){
	let chars=input.split('')
	let results=[]

	function permute(array,memo){
		let cur
		let i
		memo=memo||[]
		if (array.length===0){
			results.push(memo.join(''))
		} else {

			for (i=0;i<array.length;i++){
				let curr=array.slice()
				let next=curr.splice(i,1)
				
				permute(curr.slice(),memo.concat(next))
			}
		}
		return results
	}
	return permute(chars)
}

function hashCode(text) {
  let hash = 0, i, chr;
  if (text.length === 0) return hash;
  for (i = 0; i < text.length; i++) {
    chr   = text.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

String.prototype.hashCode = function() {
  let hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
