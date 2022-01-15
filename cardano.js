#!/usr/bin/node
let argv = minimist(process.argv.slice(2));
const DEBUG=argv['d'] || false
const VERBOSE=argv['v'] || false
const PRINT_GRID=argv['p'] || false
const REVERSE_IT=argv['R'] ? false : true
if (DEBUG) console.log("REVERSE="+REVERSE_IT)
let DICTIONARIES=argv['_']
if (DICTIONARIES.length === 0){
	console.error("Usage: cardano.js [options] <list of dictionary files>")
	console.error(" -c [file] - specific cardano grid input file. default is cardano.object")
	console.error(" -r [file] - specific rabuses file, default rabuses.def")
	console.error(" -m [file] - specific rabuses to mirror file, default mirrors.def")
	console.error(" -s [file] - specific special  (to be anagrammised) vocabulary file, default special.list")
	console.error(" ")
	console.error(" -p [grid width] - print grid of given width")
	cansole.error(" -w - minimum word length, default is 4, you may wish for TTT or IHS etc")
	console.error(" -v - verbose output, includes coordinate strings of all matches")
	console.error(" -d [debug level] - produce debug output to given debug level")
	console.error(" -R - turn reverse searching off, default is to search backwards and forwards")
	console.error(" -g - minimum specic grid width")
	console.error(" -G - maximum specic grid width")

	process.exit()
}
const MINIMUM_GRID_WIDTH=argv['g']||3
const MAXIMUM_GRID_WIDTH=argv['G']
const DEFAULT_MIRROR_FILE='mirror.def'
const MIRROR_FILE=argv['m'] || DEFAULT_MIRROR_FILE
const DEFAULT_RABUS_FILE='rabuses.def'
const RABUS_FILE=argv['r'] || DEFAULT_RABUS_FILE
const DEFAULT_SPECIAL_FILE='special.list'
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
if (grids[0].score==0){
	console.log(" *** NOTHING MATCHED ***")
} else {
	console.log("BEST GRID"+(best.length>1?'S':'')+" "+best)
	console.log("SCORE "+grids[0].score)
	grids=grids.filter(g=>g.score)
	if (VERBOSE)
		grids.map(g=>console.log(g.grid[0].length,g.score,g.hits.length,g.hits.map(h=>h.match+"@"+h.address+"("+h.score+")")))
	else
		grids.map(g=>console.log(g.grid[0].length,g.score,g.hits.length))
}

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
if (DEBUG) console.log("DICTIONARIES="+DICTIONARIES)
	DICTIONARIES.map(d=>words=words.concat(getWords(d).map(latinize)))
if (DEBUG) console.log("DICTIONARY SIZE="+words.length)

	let exp=words.join('|')
	if (!words.length) {
		console.error("*** WARNING ***, There are no words in your dictionary.")
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

function findStuff(exp,s){
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
				start:m.index
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
	rabuses.map(r => {
		getInstances(r,grid).map(i =>{
			instanceId++
			
if (DEBUG > 1) console.log("SEARCH "+i.text)
			let hits=findStuff(BIG_REGEXP,i.text)
			if (REVERSE_IT){
if (DEBUG>1) console.log("REVERSE="+i.reversal)
				hits=hits.concat(findStuff(BIG_REGEXP,i.reversal))
			}

			if (!hits.length)
				return
			hits.map(m=>{
				m.rabus=r
				m.instanceId=instanceId
				m.address=codify(r,i,m)
				m.code=hashCode(m.address)
				m.score=rateMatch(m.match)
if (DEBUG) console.log("INSERT MATCH "+m.match)
			})
			let found={}
			hits=hits.filter(hit=>{
				if (found[hit.code])
					return false
				found[hit.code]=1
				return true
			})
			let unused = i.text.length - hits.map(m=>m.match.length).reduce(Sum)
if (DEBUG) console.log("UNUSED="+unused)
			let total = hits.map(m=>m.score).reduce(Product)
if (DEBUG) console.log("TOTAL="+total)
			let factor=Math.pow(2,unused)
if (DEBUG) console.log("FACTOR="+factor)
			hits.map(m=>{
				m.score=total/factor
if (DEBUG) console.log("SCORE="+m.score)
			})
//			let tmatched=hits.map(m=>m.match.length*Factor(m.natch.length-used)).reduce(Sum)
//			let total=rateLength(tmatched)/Math.pow(2,hits.length)
//			hits.map(m=>m.score=total)

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


if (DEBUG) console.log("REDUCED HITS "+output.hits.length+" SCORE "+output.score)
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
if (DEBUG) console.log("WORD DATA="+data)
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
	return latinize(data.replace(/\W+/g,'')).split('')
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

