#!/usr/bin/node
const util=require("node-util")
let argv = require('minimist')(process.argv.slice(2));
const DEBUG=argv['d']
const fs = require('fs')
//const util=require("node-util")
const pi = Math.PI;
const phi= (1 + Math.sqrt(5))/2
const root2=Math.sqrt(2)
const root3=Math.sqrt(3)
const root5=Math.sqrt(5)
const root6=Math.sqrt(6)
const gamma=0.5772156649
const e=2.71828
const B2=1.902160
const tri=1.8392867
let POINTS={}

console.log("PI "+pi)
console.log("PHI "+phi)
console.log("PHI-1 "+(phi - 1))
console.log("GAMMA "+gamma)
console.log("e "+e)
console.log("e-1 "+(e-1))
console.log("B2 "+B2)

const Sum = (accumulator, curr) => accumulator + curr;
const ACURATE={
	C:[6070,3082],
	D:[6080,3448],
	E:[5598,4226],
	F:[5075,4362],
}


//   ["A", "G dot", 4349, 4085], //   ["A", "G dot", 4305, 4085],
const RAD2DEG=180/pi
let data=[
//   ["A", "G dot", 4324, 4063],
//   ["A", "G dot", 4330, 4086],
//   ["A", "G dot", 4347, 4070],
   ["A", "G dot", 4330, 4086],
   ["B", "Imprinted dot", 5749, 2526],
   ["C", "top line right", 6070, 3082,1/pi],
   ["D", "bottom line right", 6080, 3448,1/B2],
   ["E", "Aspley dot", 5598, 4226,4/3],
//   ["E", "Aspley dot", 5570, 4243],
   ["F", "9 dot",5075, 4362,1/Math.tan(Math.asin(0.6/phi))],
   ["G", "Tau dot", 5056, 4084],
   ["H", "top line left", 3640, 3062],
   ["I", "bottom line left", 3654, 3446],
   ["J", "T square dot", 5170, 4189],
   ["K", "P bottom", 5012, 1365],
   ["L", "P top", 5018, 1130],
// others below beware
   ["R", "T-square top", 5207,3986],
   ["S", "T-square bottom", 5165, 4098],
   ["T", "AT LONDON A top", 4582, 3820],
   ["U", "AT LONDON A bottom", 4612, 3908],
   ["V", "AT LONDON D top", 5038, 3820],
   ["W", "AT LONDON D bottom", 5040, 3824],
   ["Z", "between u and e", 4359, 2499],
   ["1", "between e and r", 5810, 4029],
   ["j", "I Imprinted bottom", 5080, 2526],
]

data=data.map(line=>{
	return {
		name:line[0],
		desc:line[1],
		x:line[2],
		y:line[3],
		source_tan:line[4]
	}
})
.map(point=>{
	POINTS[point.name]=point
})

/*
if (argv['a'])
	Object.keys(ACURATE).map(c=>{
		let p=POINTS[c]
		p.x=ACURATE[c][0]
		p.y=ACURATE[c][1]
	})
*/
let alans_measure=35.95
let SCALE=LLength('AC')/alans_measure
const THRESHOLD=50
		
generate()
generate_secondary()
function generate(){
	POINTS['M']=MidPoint('AB','M')
	POINTS['N']=Intersection('FH','AB','N')
	POINTS['O']=Intersection('KF','AB','O')
	POINTS['X']=rotate(POINTS['M'],POINTS['A'],90,'X','"are" bottom right Chi' )
	POINTS['Y']=rotate(POINTS['M'],POINTS['B'],90,'Y','Neuer, top left Chi')
}

function generate_secondary(derived){
	let CIRCLE={
		center:POINTS['M'],
		radius:LLength('AB')/2
	}
	if (derived===true){
		deltay=POINTS['A'].x -POINTS['B'].x 
		deltax=-POINTS['A'].y +POINTS['B'].y 
		POINTS['8']={
			x:POINTS['F'].x+deltax,
			y:POINTS['F'].y+deltay,
			name:'8',
			desc:'dummy point for parallel top line'
		}
		let h={
			x:POINTS['H'].x,
			y:POINTS['H'].y
		}
		POINTS['H']=Intersection('CP','F8','H')
		let dh=Length(h,POINTS['H'])
console.log("Top left "+dh)

		POINTS['9']={
			x:POINTS['A'].x+deltax,
			y:POINTS['A'].y+deltay,
			name:'9',
			desc:'dummy point for bottom parallel line'
		}
		let i={
			x:POINTS['I'].x,
			y:POINTS['I'].y
		}
		POINTS['I']=Intersection('DQ','9A','I')
		let di=Length(i,POINTS['I'])
console.log("Bottom left "+di)
		return
	}

	let TOP_LINE=[ POINTS['C'], POINTS['H']]
	let TOP_PLINE={
		p1:TOP_LINE[0],
		p2:TOP_LINE[1]
	}

	let BOT_LINE=[ POINTS['D'], POINTS['I']]
	let BOT_PLINE={
		p1:BOT_LINE[0],
		p2:BOT_LINE[1]
	}

	interset= inteceptCircleLineSeg(CIRCLE, TOP_PLINE).filter(NotNearLine.bind(TOP_LINE))
	POINTS['P']=interset[0]
	POINTS['P'].source_tan=1-e
	POINTS['P'].desc="natural base"

	interset= inteceptCircleLineSeg(CIRCLE, BOT_PLINE).filter(NotNearLine.bind(BOT_LINE))
console.log("INTERSET LENGTH="+interset.length)
	POINTS['Q']=interset[0]
	POINTS['Q'].source_tan=-e
	POINTS['Q'].desc="e-1"
}

"CDEFPQ".split('').map(C=>{
	let c=C.toLowerCase()
if (DEBUG) console.log("GENNING FOR "+C+"="+[POINTS[C].x,POINTS[C].y])
	POINTS[c]=MapOntoLine(POINTS['A'],POINTS['B'],POINTS[C].source_tan,c)
	if (argv['a'])
		POINTS[C]=POINTS[c]
	Assert((name)=>10*LLength(C+c)/SCALE,0,"","","distance to acurate  "+POINTS[c].desc)
})
if (argv['a']){
	generate_secondary(true)
}


let triangles="ACB,ADB,AEB,AFB,CFH,BAI,GFM,KFM,BNH,APB,AQB".split(/,/)
let results={}

triangles
.map(Process)
.map(r=>{
	//console.log(r.triangle+"="+r.angle+", "+POINTS[r.names[1]].desc)
if (DEBUG)console.log(util.inspect(r, {showHidden: false, depth: null, colors: true}))
	results[r.triangle]=r
})
let radius=LLength('AB')/2


if (DEBUG) console.log(util.inspect(results, {showHidden: false, depth: null, colors: true}))
if (DEBUG) console.log(util.inspect(POINTS, {showHidden: false, depth: null, colors: true}))
rf=(n,f)=>results[n][f]
Assert(rf,pi,'ACB','invtan',"Pi")
Assert(rf,B2,'ADB','invtan',"Brun's constant2")

Assert( ()=>{return LLength("AE")/LLength("AF")},phi, "AE/AF","","Golden Ratio")
Assert( ()=>{return LLength("AF")/LLength("AE")},phi-1, "AF/AE","","Golden Ratio Inverted")
Assert( ()=>{return (LLength("AB")+LLength("AE"))/LLength("AD")},tri, "AC/AD","","Tribonacci")
Assert( ()=>{return (LLength("BE")+LLength("BF"))/LLength("AB")},root3, "(BE+BD)/AB","","Root 3")
Assert( ()=>{return LLength("NH")/LLength("NF")},phi, "NH/NF","","Golden Ratio second")
Assert( ()=>{return (LLength("NF") + LLength('AI'))/LLength("AH")},root2, "NH/AI","","Root 2")
Assert( ()=>{return LLength('AB')/LLength("AI")},root5, "AB/AI","","Root 5")
Assert( ()=>{return LLength('BI')/LLength("AI")},root6, "BI/AI","","Root 6")
Assert( rf,0.75,'AEB','invtan',"345 Triangle")
Assert( rf,e,'AQB','tan',"Euler")
Assert( rf,e-1,'APB','tan',"Euler - 1")
Assert( rf,90,'ACB','midangle',"Right angle")
Assert( rf,90,'ADB','midangle',"Right angle")
Assert( rf,90,'AEB','midangle',"Right angle")
Assert( rf,90,'AFB','midangle',"Right angle")
Assert( rf,90,'CFH','midangle',"Right angle")
Assert( rf,90,'BNH','midangle',"Right angle")
Assert( rf,90,'BAI','midangle',"Right angle")
Assert( rf,90,'APB','midangle',"Right angle")
Assert( rf,90,'AQB','midangle',"Right angle")


"ABCDEFPQ".split('').map(name=>{
	Assert((name)=>LLength('M'+name),radius,name,""," Radius")
})
if (DEBUG) "ABCDEF".split('').map(name=>{
	Assert((name)=>LLength('O'+name),radius,name,""," Radius from P")
})
"U".split('').map(name=>{
	Assert((name)=>LLength('N'+name)/SCALE,0,name,""," distance to derived AT interscetion ")
})
//Assert((name)=>LLength('X1'),0,"","","distance chi bottom right")

"RS:FB,TU:FH,VWMj:FK".split(',').map(job=>{
	let j=job.split(':')
	let l=j[1].split('')
	j[0].split('').map(name=>{
		Assert((name)=>distToSegment(POINTS[name],POINTS[l[0]],POINTS[l[1]])/SCALE,0,name,"", j[1]+" to "+POINTS[name].desc)
	})
})

"CH:DI,FH:AI,AB:ED".split(',').map(pair=>{
	let p=pair.split(':')
	CheckParallel(p[0],p[1])
})

function CheckParallel(a,b){
	let angle=degs(Math.atan(Slope(a)-Slope(b)))
	console.log("Parallel check "+nicename(a)+"||"+nicename(b)+"="+angle)
}

function nicename(line){
	let l=line.split('')
	let a=POINTS[l[0]]
	let b=POINTS[l[1]]
	return "("+l[0]+")"+a.desc+"/("+l[1]+")"+b.desc
}

function Slope(line){
	let l=line.split('')
	let a=POINTS[l[0]]
	let b=POINTS[l[1]]
	return slope(a,b)
}
function slope(a,b){
	return (a.y-b.y)/(a.x-b.x)
}

function NotNearLine(point){
	return this.filter(NearPoint.bind(point)).length == 0
}
function NearPoint(point){
	let distance=Length(point,this)
	return (distance < THRESHOLD)
}
function Intersection(A,B,name){
	points=(A)=>A.split('').map(a=>POINTS[a])
	let a=points(A)
	let b=points(B)
	let i=intersection(a[0].x,a[0].y,a[1].x,a[1].y,b[0].x,b[0].y,b[1].x,b[1].y)
	i.desc=A+"+"+B+" Intersection"
	i.name=name
	return i
}


function intersection(x1, y1, x2, y2, x3, y3, x4, y4)
{
    var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
if (DEBUG)console.log("INTERSECTION "+[x1,y1,x2,y2,x3,y3,x4,y4,denom,ua,ub])
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
        seg1: ua >= 0 && ua <= 1,
        seg2: ub >= 0 && ub <= 1
    };
}

function LLength(line){
	points=line.split('')
	return Length(POINTS[points[0]],POINTS[points[1]])
}

function Assert(func,target,name,field,desc){
	let value= func(name,field)
	let score= (value-target)
	if (target)
		score=score*100/target
	score=Math.abs(Math.round((score + Number.EPSILON) * 100) / 100)
	value=Math.round((value + Number.EPSILON) * 1000) / 1000
	console.log(desc+" "+name+"."+field+"="+value+"->"+target+" ("+score+"%)")
}

function assert(name,field,value){
	let score= (results[name][field]-value)/(value/100)
	score=Math.abs(Math.round((score + Number.EPSILON) * 100) / 100)

	console.log(name+"."+field+"="+results[name][field]+" ("+score+"%)")
}



function MidPoint(line,name){
	let points=line.split('')
	let a=POINTS[points[0]]
	let b=POINTS[points[1]]

	return {
		name:name,
		desc:a.name+","+b.name+" MidPoint",
		x:(a.x+b.x)/2,
		y:(a.y+b.y)/2,
	}
}

function Process(triangle){
	let points=triangle.split('').map(name=>POINTS[name])
	let A=points[0]
	let B=points[2]
	let C=points[1]

	let radians= Angle(A,B,C)

	let details= {
		triangle:triangle,
		points:points,
		midangle:Angle(A,B,C),
		sinangle:Angle(A,C,B),
		cosangle:Angle(B,C,A),
		cosside:Length(A,C)/SCALE,
		sinside:Length(B,C)/SCALE,
		hypotenuse:Length(A,B)/SCALE,
	}
	details.sin=details.sinside/details.hypotenuse
	details.cos=details.cosside/details.hypotenuse
	details.tan=details.sin/details.cos
	details.invsin=1/details.sin
	details.invcos=1/details.cos
	details.invtan=1/details.tan
	return details
}

function Length(a,b){
	let x2=Math.pow(a.x-b.x,2)
	let y2=Math.pow(a.y-b.y,2)
	let d= Math.sqrt(x2+y2)
if (DEBUG) console.log("LENGTH "+[a.x,a.y,b.x,b.y,x2,y2,d])
	return d
}


/**
 * Calculates the angle (in radians) between two vectors pointing outward from one center
 *
 * @param p0 first point
 * @param p1 second point
 * @param c center point
 */
function Angle(p0,p1,c) {
    var p0c = Math.sqrt(Math.pow(c.x-p0.x,2)+
                        Math.pow(c.y-p0.y,2)); // p0->c (b)   
    var p1c = Math.sqrt(Math.pow(c.x-p1.x,2)+
                        Math.pow(c.y-p1.y,2)); // p1->c (a)
    var p0p1 = Math.sqrt(Math.pow(p1.x-p0.x,2)+
                         Math.pow(p1.y-p0.y,2)); // p0->p1 (c)
    return Math.acos((p1c*p1c+p0c*p0c-p0p1*p0p1)/(2*p1c*p0c)) *RAD2DEG;
}

function inteceptCircleLineSeg(circle, line){
    var a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
    v1 = {};
    v2 = {};
    v1.x = line.p2.x - line.p1.x;
    v1.y = line.p2.y - line.p1.y;
    v2.x = line.p1.x - circle.center.x;
    v2.y = line.p1.y - circle.center.y;
    b = (v1.x * v2.x + v1.y * v2.y);
    c = 2 * (v1.x * v1.x + v1.y * v1.y);
    b *= -2;
    d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if(isNaN(d)){ // no intercept
        return [];
    }
    u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    u2 = (b + d) / c;    
    retP1 = {};   // return points
    retP2 = {}  
    ret = []; // return array
    if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
        retP1.x = line.p1.x + v1.x * u1;
        retP1.y = line.p1.y + v1.y * u1;
        ret[0] = retP1;
    }
    if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
        retP2.x = line.p1.x + v1.x * u2;
        retP2.y = line.p1.y + v1.y * u2;
        ret[ret.length] = retP2;
    }       
    return ret;
}
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w))};

function rotate(c,p, angle,name,desc) {
	let radians = (Math.PI / 180) * angle
	return Rotate(c,p,radians,name,desc)
}
function Rotate(c,p, radians,name,desc) {
	let cos = Math.cos(radians)
	let sin = Math.sin(radians)
if (DEBUG)console.log("ROTATING "+[c.x,c.y,p.x,p.y,radians,name,desc,sin,cos])
	return {
		x:(cos * (p.x - c.x)) + (sin * (p.y - c.y)) + c.x,
		y:(cos * (p.y - c.y)) + (sin * (p.x - c.x)) + c.y,
		name:name,
		desc:desc
	}
}

function degs(rads){
	return rads*180/pi
}

function MapOntoLine(a,b,tan,name){
if (DEBUG)console.log("test "+Math.sin(pi/4))
if (DEBUG)console.log("A "+[a.x,a.y])
if (DEBUG)console.log("B "+[b.x,b.y])
if (DEBUG)console.log("TANGENT "+tan)
	let angle=-Math.atan(tan)
if (DEBUG)console.log("ANGLE "+degs(angle))
	let cos=Math.cos(angle)
if (DEBUG)console.log("COSINE "+cos)
	let tangle=Math.atan((a.y-b.y)/(a.x-b.x))
if (DEBUG)console.log("TANGLE "+degs(tangle))
	let rangle=tangle-angle
if (DEBUG)console.log("RANGLE "+degs(rangle))
	let scale = Length(a,b)
if (DEBUG)console.log("SCALE "+scale)
	
	let transformed={
		x:a.x+(cos*scale),
		y:a.y,
		source_tan:tan
	}
if (DEBUG)console.log("TRANSFORM "+[transformed.x,transformed.y])
	
	let out= Rotate(a,transformed,rangle,name,name+" generated from source tangent")
if (DEBUG)console.log("OUT "+[out.x,out.y])
	return out
}
