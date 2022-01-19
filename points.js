//   ["A", "G dot", 4349, 4085], //   ["A", "G dot", 4305, 4085],
const util=require("node-util")
const pi = Math.PI;
const phi= (1 + Math.sqrt(5))/2
const root3=Math.sqrt(3)
const gamma=0.5772156649
const e=2.71828
const B2=1.902160
const tri=1.8392867
console.log("PI "+pi)
console.log("PHI "+phi)
console.log("PHI-1 "+(phi - 1))
console.log("GAMMA "+gamma)
console.log("e "+e)
console.log("e-1 "+(e-1))
console.log("B2 "+B2)

const Sum = (accumulator, curr) => accumulator + curr;

const RAD2DEG=180/pi
let data=[
   ["A", "G dot", 4330, 4086],
   ["B", "imprinted dot", 5749, 2526],
   ["C", "top line right", 6070, 3082],
   ["D", "bottom line right", 6080, 3448],
   ["E", "Aspley dot", 5579, 4222],
   ["F", "9 dot", 5072, 4361],
   ["G", "Tau dot", 5056, 4084],
   ["H", "top line left", 3657, 3065],
   ["I", "bottom line left", 3636, 3443],
   ["J", "T square dot", 5170, 4189],
   ["K", "P bottom", 5022, 1365],
   ["L", "P top", 5018, 1130],
]


let POINTS={}
data=data.map(line=>{
	return {
		name:line[0],
		desc:line[1],
		x:line[2],
		y:line[3]
	}
})
.map(point=>{
	POINTS[point.name]=point
})
POINTS['M']=MidPoint('AB','M')
POINTS['N']=Intersection('FH','AB','N')
POINTS['O']=Intersection('KF','AB','O')
let CIRCLE={
	center:POINTS['M'],
	radius:LLength('AB')/2
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

const THRESHOLD=50
interset= inteceptCircleLineSeg(CIRCLE, TOP_PLINE).filter(NotNearLine.bind(TOP_LINE))
console.log("RESULTS="+interset.length)
POINTS['P']=interset[0]
interset= inteceptCircleLineSeg(CIRCLE, BOT_PLINE).filter(NotNearLine.bind(BOT_LINE))
console.log("RESULTS="+interset.length)
POINTS['Q']=interset[0]

function NotNearLine(point){
	return this.filter(NearPoint.bind(point)).length == 0
}
function NearPoint(point){
	let distance=Length(point,this)
console.log("DISTANCE="+distance)
	return (distance < THRESHOLD)
}

console.log(util.inspect(POINTS['P'], {showHidden: false, depth: null, colors: true}))
console.log(util.inspect(POINTS['Q'], {showHidden: false, depth: null, colors: true}))

let triangles="ACB,ADB,AEB,AFB,CFH,BAI,GFM,KFM,BNH,APB,AQB".split(/,/)
let results={}

triangles
.map(Process)
.map(r=>{
	//console.log(r.triangle+"="+r.angle+", "+POINTS[r.names[1]].desc)
	console.log(util.inspect(r, {showHidden: false, depth: null, colors: true}))
	results[r.triangle]=r
})
let radius=LLength('AB')/2


console.log(util.inspect(results, {showHidden: false, depth: null, colors: true}))
console.log(util.inspect(POINTS, {showHidden: false, depth: null, colors: true}))
rf=(n,f)=>results[n][f]
Assert(rf,pi,'ACB','invtan',"Pi")
Assert(rf,B2,'ADB','invtan',"Brun's constant2")

Assert( ()=>{return LLength("AE")/LLength("AF")},phi, "AE/AF","","Golden Ratio")
Assert( ()=>{return LLength("AC")/LLength("AD")},tri, "AC/AD","","Tribonacci")
Assert( ()=>{return (LLength("BE")+LLength("BD"))/LLength("AB")},root3, "(BE+BD)/AB","","root3")
Assert( rf,90,'ACB','midangle',"Right angle")
Assert( rf,90,'ADB','midangle',"Right angle")
Assert( rf,90,'AEB','midangle',"Right angle")
Assert( rf,90,'AFB','midangle',"Right angle")
Assert( rf,90,'CFH','midangle',"Right angle")
Assert( rf,90,'BNH','midangle',"Right angle")
Assert( rf,90,'BAI','midangle',"Right angle")
Assert( rf,90,'APB','midangle',"Right angle")
Assert( rf,90,'AQB','midangle',"Right angle")

Assert( rf,0.75,'AEB','invtan',"345 Triangle")
Assert( rf,e,'AQB','tan',"Euler")
Assert( rf,e-1,'APB','tan',"Euler - 1")

"ABCDEF".split('').map(name=>{
	Assert((name)=>LLength('M'+name),radius,name,""," Radius")
})
"ABCDEF".split('').map(name=>{
	Assert((name)=>LLength('O'+name),radius,name,""," Radius from P")
})
Assert( ()=>LLength("OM"),0, "OM",""," test same")

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
		cosside:Length(A,C),
		sinside:Length(B,C),
		hypotenuse:Length(A,B),
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
	return Math.sqrt(
		Math.pow(a.x-b.x,2)+
		Math.pow(a.y-b.y,2)
	)
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
