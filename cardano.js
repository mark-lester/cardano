#!/usr/bin/node
const fs = require('fs')
const util=require("node-util")
const DEFAULT_MIRROR_FILE='mirror.def'
const DEFAULT_RABUS_FILE='rabuses.def'
const DEFAULT_SPECIAL_FILE='special.list'
const DEFAULT_DICTIONARY='words.list'
const HIGHLIGHT=' style="color:red;"'

let argv = minimist(process.argv.slice(2));
const DEBUG=argv['d'] || false
const VERBOSE=argv['v'] || false
const PRINT_GRID=argv['p'] || false
const REVERSE_IT=argv['r'] ? false : true
const MINIMUM_GRID_WIDTH=argv['g']||3
const MAXIMUM_GRID_WIDTH=argv['G']
const MINIMUM_WORD_LENGTH=argv['w']||3
const MIRROR_FILE=argv['M'] 
const RABUS_FILE=argv['R'] 
const SPECIAL_FILE=argv['A']
const DICTIONARY_FILE=argv['D']
const OUTPUT_FILE=argv['O']
const PRINT_ALL=argv['P']
const PRINT_SPECIFIC=argv['p']
if (DEBUG) console.log("REVERSE="+REVERSE_IT)
let CARDANOS=argv['_']
if (CARDANOS.length === 0){
	console.error("Usage: cardano.js [options] <list of cardano files to test>")
	console.error(" -D [file] - dictionary/vocabulary file. try -D "+DEFAULT_DICTIONARY)
	console.error(" -A [file] - dictionary be anagrammised file, try -A "+DEFAULT_SPECIAL_FILE )
	console.error(" -R [file] - rabuses file, try -R "+DEFAULT_RABUS_FILE)
	console.error(" -M [file] - rabuses to mirror file, try -M "+DEFAULT_MIRROR_FILE )
	console.error(" -O [file] - output HTML to file")
	console.error(" ")
	console.error(" -p [grid width] - print grid of given width")
	console.error(" -P print grid all grids")
	console.error(" -g - minimum specic grid width")
	console.error(" -G - maximum specic grid width")
	console.error(" -w - minimum word length to filter dictionary, default is 3")
	console.error(" -v - verbose output, includes coordinate strings of all matches")
	console.error(" -d [debug level] - produce debug output to given debug level")
	console.error(" -r - turn reverse searching off, default is to search backwards and forwards")

	process.exit()
}


let Specials={}
let Avalue="A".charCodeAt(0);
let rabusId=1
let rabuses=getRabuses()
if (!rabuses.length)
	console.error("*** WARNING ***, You have no rabuses defined ")
if (!RABUS_FILE && !MIRROR_FILE)
	console.error("you need to specify a rabus file with -R or -M ")
if (DEBUG>2){
	console.log("RABUSES")
	console.log(util.inspect(rabuses, {showHidden: false, depth: null, colors: true}))
}
let BIG_REGEXP=getExpression(DICTIONARY_FILE)
let grids=undefined
CARDANOS.map(cardano=>{
	let data=getObject(cardano)
	let unsorted=getGrids(data).map(ScanGrid)
	grids=unsorted
		.sort((b,a) => (a.score > b.score) ? 1 : ((b.score > a.score) ? -1 : 0))
		.sort((b,a) => (a.instances > b.instances) ? 1 : ((b.instances > a.instances) ? -1 : 0))

	let best=grids.filter(g=>g.instances === grids[0].instances **g.score).map(g=>g.grid[0].length)

	if (grids[0].instances==0){
		console.log("*** NOTHING MATCHED "+cardano+" ***")
	} else {
		console.log("*** FILE "+cardano+" BEST"+(best.length>1?'S':'')+" "+best+" SCORE "+[grids[0].instances,grids[0].score] +" ***")
	}
	grids=grids.filter(g=>g.score)
	if (PRINT_ALL)
		grids=unsorted

	if (PRINT_SPECIFIC)
		grids=unsorted.filter(g=>g.grid[0].length == PRINT_SPECIFIC)

if (DEBUG>2) console.log(util.inspect(grids, {showHidden: false, depth: null, colors: true}))

	if (VERBOSE)
		grids.map(g=>console.log([g.grid[0].length,g.score,g.hits.length,g.hits.map(h=>h.match+"@"+h.address+"("+h.score+")")]))
	else
		grids.map(g=>console.log([g.grid[0].length,g.score,g.hits.length]))
})
if (OUTPUT_FILE){
	OutputHTML(OUTPUT_FILE,grids)
}



function OutputHTML(filename,grids){
	let cube=grids.map(Grid)
	function Grid(grid){
		let out= grid.grid.map(Line)
if (DEBUG>1)console.log("OUTPUT GRID="+util.inspect(out, {showHidden: false, depth: null, colors: true}))
		grid.hits.map(colourHit)
		return out

		function Line(line){
			return line.map(Cell)
			function Cell(value){
				return {
					style:'',
					value:value
				}
			}
		}
		function colourHit(hit){
			hit.address.split(/,/).map(c=>{
				coord=c.split(/:/)
if (DEBUG>1)console.log("COORDS="+coord)
				out[coord[1]-1][coord[0]-1].style=HIGHLIGHT
			})
		}
	}
	let out=cube.map(Table).join("<p>\n")
	function Table(table){
		return table[0].length+"<br><table border=1>\n"+
			table.map(Line).join("\n")+
			"</table>\n"

		function Line(line){
			return "<tr>\n"+
				line.map(Cell).join("\n")+
				"</tr>\n"
			function Cell(cell){
				return "<td"+cell.style+">\n"+ cell.value+ "</td>"
			}
		}
	}

	return fs.writeFileSync(filename,out)
}


function getExpression(dictionary){
	let words=[]
	let special=SPECIAL_FILE ? getWords(SPECIAL_FILE,2).map(latinize) : []
	special.map(s=>{
		Specials[s]=1;
		words=words.concat(permutator(s))
	})
	words=words.filter(onlyUnique)
if (DEBUG) console.log("PERMUTED="+words)
	words=words.concat(getWords(dictionary).map(latinize))

if (DEBUG) console.log("DICTIONARY SIZE="+words.length)

	let exp=words.join('|')
	if (!words.length) {
		console.error("*** WARNING ***, There are no words in your dictionary.")
		if (!DICTIONARY_FILE && !SPECIAL_FILE)
			console.error("you need to specify a dictionary file with -D or -A ")
		console.error("This may be due to a minimum word length of "+MINIMUM_WORD_LENGTH+" being set")
		console.error("use -w [minimum word size] to inlude shorter words")
	}
	return new RegExp(exp,'g')
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}


function latinize(text){
if (DEBUG > 1)console.log("LATINIZING "+text)
	return text
		.toUpperCase()
		.replace(/J/,'I')
		.replace(/U/,'V')
//		.replace(/F/,'S')
}

function findStuff(exp,s,reversed){
	let m
	let output=[]
	do {
		m = exp.exec(s);
		if (m) {
			if (!m[0].length)
				return output

if (DEBUG) console.log("MATCH="+m[0])
			output.push({
				match:m[0],
				start:m.index,
				reversed:reversed
    			})
		}
	} while (m);
	return output
} 

function getGrids(data){
//	data=latinize(data)
	let width=MINIMUM_GRID_WIDTH
	let end=MAXIMUM_GRID_WIDTH || data.length/2
	let output=[]
	do {
		output.push(getGrid(data,width))
		width++
	} while (width <= end)

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

	let instanceId=0
	let cused={}
	rabuses.map(r => {
if (DEBUG>1) console.log("RABUS "+r.cells)
		getInstances(r,grid).map(i =>{
			iused={}
			
if (DEBUG > 1) console.log("SEARCH "+i.text)
			let hits=findStuff(BIG_REGEXP,i.text)
			if (REVERSE_IT){
if (DEBUG>1) console.log("REVERSE="+i.reversal)
				let reversed=findStuff(BIG_REGEXP,i.reversal,true)
				hits=hits.concat(reversed)
			}

			if (!hits.length)
				return
			instanceId++
if (DEBUG>1)console.log("INSTANCE="+util.inspect(i, {showHidden: false, depth: null, colors: true}))
if (DEBUG>1)console.log("HITS="+util.inspect(hits, {showHidden: false, depth: null, colors: true}))
			hits.map(m=>{
if (DEBUG) console.log("INSERT MATCH "+m.match+" REVRSED = "+m.reversed)
				m.rabus=r
				m.instanceId=instanceId
				m.address=codify(r,i,m)
if (DEBUG) console.log("INSERT ADDRESS "+m.address)
				m.address.split(/,/).map(c=>{
					iused[c]=cused[c]=true
				})
				m.code=hashCode(m.address)
				m.score=rateMatch(m.match)
			})
			let found={}
			hits=hits.filter(hit=>{
				if (found[hit.code])
					return false
				found[hit.code]=1
				return true
			})
/*
			let unused = i.text.length - hits.map(m=>m.match.length).reduce(Sum)
if (DEBUG) console.log("UNUSED="+unused)
			let total = hits.map(m=>m.score).reduce(Product)
if (DEBUG) console.log("TOTAL="+total)
			let factor=Math.pow(2,unused)
if (DEBUG) console.log("FACTOR="+factor)
			hits.map(m=>{
				m.score=total/factor
			})
//			let tmatched=hits.map(m=>m.match.length*Factor(m.natch.length-used)).reduce(Sum)
//			let total=rateLength(tmatched)/Math.pow(2,hits.length)
*/
			let total=Object.keys(cused).length
if (DEBUG) console.log("INSTANCE SCORE="+[total,Object.keys(cused)])
			hits.map(m=>m.score=total)

			output.hits=output.hits.concat(hits)
		})
	})
	let found={}
	output.hits=output.hits
		.sort((a,b)=>
			(a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 
				(a.rabus.cells.length > b.rabus.cells.length ) ? 1 :
				((b.rabus.cells.length > a.rabus.cells.length ) ? -1 : 0)
		))
		.filter(hit=>{
			if (found[hit.code])
				return false
			found[hit.code]=1
			return true
		})

/*
	if (output.hits.length){
		found={}
		output.score=output.hits
			.filter(hit=>{
				if (found[hit.instanceId])
					return false
				found[hit.instanceId]=true
				return true
			})
			.map(hit=>hit.score)
			.reduce(Sum)
	}
*/
	output.score=Object.keys(cused).length
	output.instances=output.hits.map(h=>h.instanceId).filter(onlyUnique).length
if (DEBUG) console.log("GRID SCORE="+[output.score,Object.keys(cused)])
if (DEBUG) console.log("REDUCED HITS "+output.hits.length+" SCORE "+output.score)
	return output
}

function codify(r,i,m){
	let cells=m.reversed ? r.reversed : r.cells
if (DEBUG>1)console.log("CODING FROM "+m.start+" ON "+m.match+" REV="+m.reversed) 
if (DEBUG>1)console.log("CONTENT="+util.inspect(cells, {showHidden: false, depth: null, colors: true}))
if (DEBUG>1)console.log("RABUS="+util.inspect(r, {showHidden: false, depth: null, colors: false}))
	let cstring=cells.slice(m.start,m.start+m.match.length).map(c=>{
		return (c.col+i.ox+1) +":"+ (c.row+i.oy+1)
	})
	.sort()
	.join(',')

	return cstring
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
	return output.filter(o=>o!==undefined)
}

function getWords(file,length){
	if (!file)
		return []
	let data
	length=length || MINIMUM_WORD_LENGTH
	try {
		data = fs.readFileSync(file, 'utf8')
	} catch (err) {
		console.error(err)
	}
if (DEBUG) console.log("WORD DATA="+data)
	return data.split(/\W+/)
		.filter(word => word.length >= length)
}

function getRabuses(){
	let rabuses=getRabuseFile(RABUS_FILE)
	let mirror=getRabuseFile(MIRROR_FILE)
	let order=1
	let flipped=mirror.map(r=> {
		let out={
			width:r.width,
			height:r.height,
			cells: r.cells.slice(0).reverse().map(c=>{
				c = Object.assign({}, c);
if (DEBUG>1)console.log("FLIP ROW "+c.row+" FROM H "+r.height+" TO "+(r.height-c.row-2))
				c.row=r.height-c.row-2
				c.order=order++
				return c
			})
		}
		out.reversed=out.cells.slice(0).reverse().map(c=>{c.order=order++;return c})
		return out
	})

	return mirror.concat(flipped).concat(rabuses)
}

function getRabuseFile(file){
if (DEBUG)console.log("READING RABUS FILE "+file )
	if (!file)
		return []
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
	return latinize(data.replace(/\W+/g,'')).split('')
}


function pluckInstance(rabus,grid,ox,oy){
	function pluckCell(cell){
		if (!grid[oy+cell.row])
			return undefined

		return grid[oy+cell.row][ox+cell.col]
	}
	var text=rabus.cells.map(pluckCell).join('')
	if (text.length != rabus.cells.length)
		return undefined

	var reversal=REVERSE_IT ? text.split('').slice(0).reverse().join('') : ''
if (DEBUG>1)console.log("TEXT="+text+" REVERSAL="+reversal)
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

	let order=1
	return {
		id:rabusId++,
		width:width,
		height:row,
		cells:cells,
		reversed:cells.slice(0).reverse().map(c=>{c.order=order++;return c})
	}
}

function alphanum(val){
	if (val.match(/\d/))
		return Number(val)
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

// ripped off from npm minimist
function minimist(args, opts) {
    if (!opts) opts = {};
    
    var flags = { bools : {}, strings : {}, unknownFn: null };

    if (typeof opts['unknown'] === 'function') {
        flags.unknownFn = opts['unknown'];
    }

    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
      flags.allBools = true;
    } else {
      [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {
          flags.bools[key] = true;
      });
    }
    
    var aliases = {};
    Object.keys(opts.alias || {}).forEach(function (key) {
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key].forEach(function (x) {
            aliases[x] = [key].concat(aliases[key].filter(function (y) {
                return x !== y;
            }));
        });
    });

    [].concat(opts.string).filter(Boolean).forEach(function (key) {
        flags.strings[key] = true;
        if (aliases[key]) {
            flags.strings[aliases[key]] = true;
        }
     });

    var defaults = opts['default'] || {};
    
    var argv = { _ : [] };
    Object.keys(flags.bools).forEach(function (key) {
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });
    
    var notFlags = [];

    if (args.indexOf('--') !== -1) {
        notFlags = args.slice(args.indexOf('--')+1);
        args = args.slice(0, args.indexOf('--'));
    }

    function argDefined(key, arg) {
        return (flags.allBools && /^--[^=]+$/.test(arg)) ||
            flags.strings[key] || flags.bools[key] || aliases[key];
    }

    function setArg (key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }

        var value = !flags.strings[key] && isNumber(val)
            ? Number(val) : val
        ;
        setKey(argv, key.split('.'), value);
        
        (aliases[key] || []).forEach(function (x) {
            setKey(argv, x.split('.'), value);
        });
    }

    function setKey (obj, keys, value) {
        var o = obj;
        for (var i = 0; i < keys.length-1; i++) {
            var key = keys[i];
            if (key === '__proto__') return;
            if (o[key] === undefined) o[key] = {};
            if (o[key] === Object.prototype || o[key] === Number.prototype
                || o[key] === String.prototype) o[key] = {};
            if (o[key] === Array.prototype) o[key] = [];
            o = o[key];
        }

        var key = keys[keys.length - 1];
        if (key === '__proto__') return;
        if (o === Object.prototype || o === Number.prototype
            || o === String.prototype) o = {};
        if (o === Array.prototype) o = [];
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') {
            o[key] = value;
        }
        else if (Array.isArray(o[key])) {
            o[key].push(value);
        }
        else {
            o[key] = [ o[key], value ];
        }
    }
    
    function aliasIsBoolean(key) {
      return aliases[key].some(function (x) {
          return flags.bools[x];
      });
    }

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        
        if (/^--.+=/.test(arg)) {
            // Using [\s\S] instead of . because js doesn't support the
            // 'dotall' regex modifier. See:
            // http://stackoverflow.com/a/1068308/13216
            var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
            var key = m[1];
            var value = m[2];
            if (flags.bools[key]) {
                value = value !== 'false';
            }
            setArg(key, value, arg);
        }
        else if (/^--no-.+/.test(arg)) {
            var key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        }
        else if (/^--.+/.test(arg)) {
            var key = arg.match(/^--(.+)/)[1];
            var next = args[i + 1];
            if (next !== undefined && !/^-/.test(next)
            && !flags.bools[key]
            && !flags.allBools
            && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                setArg(key, next, arg);
                i++;
            }
            else if (/^(true|false)$/.test(next)) {
                setArg(key, next === 'true', arg);
                i++;
            }
            else {
                setArg(key, flags.strings[key] ? '' : true, arg);
            }
        }
        else if (/^-[^-]+/.test(arg)) {
            var letters = arg.slice(1,-1).split('');
            
            var broken = false;
            for (var j = 0; j < letters.length; j++) {
                var next = arg.slice(j+2);
                
                if (next === '-') {
                    setArg(letters[j], next, arg)
                    continue;
                }
                
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
                    setArg(letters[j], next.split('=')[1], arg);
                    broken = true;
                    break;
                }
                
                if (/[A-Za-z]/.test(letters[j])
                && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                
                if (letters[j+1] && letters[j+1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j+2), arg);
                    broken = true;
                    break;
                }
                else {
                    setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
                }
            }
            
            var key = arg.slice(-1)[0];
            if (!broken && key !== '-') {
                if (args[i+1] && !/^(-|--)[^-]/.test(args[i+1])
                && !flags.bools[key]
                && (aliases[key] ? !aliasIsBoolean(key) : true)) {
                    setArg(key, args[i+1], arg);
                    i++;
                }
                else if (args[i+1] && /^(true|false)$/.test(args[i+1])) {
                    setArg(key, args[i+1] === 'true', arg);
                    i++;
                }
                else {
                    setArg(key, flags.strings[key] ? '' : true, arg);
                }
            }
        }
        else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(
                    flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)
                );
            }
            if (opts.stopEarly) {
                argv._.push.apply(argv._, args.slice(i + 1));
                break;
            }
        }
    }
    
    Object.keys(defaults).forEach(function (key) {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
            
            (aliases[key] || []).forEach(function (x) {
                setKey(argv, x.split('.'), defaults[key]);
            });
        }
    });
    
    if (opts['--']) {
        argv['--'] = new Array();
        notFlags.forEach(function(key) {
            argv['--'].push(key);
        });
    }
    else {
        notFlags.forEach(function(key) {
            argv._.push(key);
        });
    }

    return argv;
};

function hasKey (obj, keys) {
    var o = obj;
    keys.slice(0,-1).forEach(function (key) {
        o = (o[key] || {});
    });

    var key = keys[keys.length - 1];
    return key in o;
}

function isNumber (x) {
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

