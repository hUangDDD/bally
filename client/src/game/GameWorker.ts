///<amd-module name='GameWorkerMain'/>
///<reference path="../../typings/tsd.d.ts"/>
import * as res from './resource'
const GC = res.GraphicConstant;
declare function postMessage(data: any): void;
export function createWorker()
{
	let url = 'scripts/worker.js';
	try
	{
		url = window['_APP_VERSION_OBJECT'].webworker_url;
	}
	catch(e){}
	
	return new Worker(url);
}
let g: any;
export function main(obj) 
{
	//console.log('hello world webworker',obj);
	obj.onmessage = onMessage;
	obj.onerror = function (e)
	{
		e.cmd = 'error';
		obj.postMessage(e);
	}
	obj.postMessage({ cmd: 'ready', id: worldId });
	g = obj;
}


export function onMessage(e: MessageEvent)
{
	let obj = e.data;
	switch (obj.cmd)
	{
		case 'start': return start(obj);
		case 'stop': return stop(obj);
		case 'addBall': return addBall(obj);
		case 'delBall': return delBall(obj);
		case 'initPhysics': return initPhysics(obj);
		case 'pause':
			pausePhysics = true;
			break;
		case 'resume':
			pausePhysics = false;
			break;
		case 'shake':
			return shake(obj);
		case 'timeScale':
			timeScale = obj.timeScale;
			break;
		case 'raiseUpBalls':
			raiseUpBalls(obj.ids);
			break;
		default:
			throw new Error('unknown message:' + obj);
	}
}

let world: Box2D.Dynamics.b2World;
let worldId = -1;
let timerId: any;
let allBalls: { [id: string]: Box2D.Dynamics.b2Body } = {}
let pausePhysics = false;
let timeScale = 1;
const b2Vec2 = Box2D.Common.Math.b2Vec2;

function start(obj) 
{
	if (world)
	{
		throw new Error('already started');
	}
	timeScale = 1;
	worldId = obj.id;
	world = new Box2D.Dynamics.b2World(new b2Vec2(0, 9.8), true);
	const HALF_BOUND_EDGE = 10;
	//create static bottom chain
	{
		let chain = res.BOTTOM_STATIC_CHAIN_POINT;
		let bodydef = new Box2D.Dynamics.b2BodyDef();
		bodydef.type = Box2D.Dynamics.b2Body.b2_staticBody;
		let body = world.CreateBody(bodydef);
		for (let i = 0; i < chain.length; ++i)
		{
			let p0 = chain[i - 1];
			let p1 = chain[i];
			let p2 = chain[i + 1];
			let p3 = chain[i + 2];
			if (p1 && p2)
			{
				let v1 = new b2Vec2(res.ToBox2DUnit(p1.x), res.ToBox2DUnit(p1.y));
				let v2 = new b2Vec2(res.ToBox2DUnit(p2.x), res.ToBox2DUnit(p2.y));
				let shape = Box2D.Collision.Shapes.b2PolygonShape.AsEdge(v1, v2);
				body.CreateFixture2(shape);
			}
		}
		//left right
		{
			let p1 = { x: 0, y: 0 }, p2 = { x: 0, y: GC.SCREEN_HEIGHT };
			let v1 = new b2Vec2(res.ToBox2DUnit(p1.x), res.ToBox2DUnit(p1.y));
			let v2 = new b2Vec2(res.ToBox2DUnit(p2.x), res.ToBox2DUnit(p2.y));
			let shape = Box2D.Collision.Shapes.b2PolygonShape.AsEdge(v1, v2);
			body.CreateFixture2(shape);
		}
		{
			let p1 = { x: GC.SCREEN_WIDTH, y: 0 }, p2 = { x: GC.SCREEN_WIDTH, y: GC.SCREEN_HEIGHT };
			let v1 = new b2Vec2(res.ToBox2DUnit(p1.x), res.ToBox2DUnit(p1.y));
			let v2 = new b2Vec2(res.ToBox2DUnit(p2.x), res.ToBox2DUnit(p2.y));
			let shape = Box2D.Collision.Shapes.b2PolygonShape.AsEdge(v1, v2);
			body.CreateFixture2(shape);
		}
	}
	pausePhysics = false;
	timerId = setInterval(update, GC.TICK_TIME * 1000);
}

//技能功能：将一系列球移动到最上面
function raiseUpBalls(ids: number[]) 
{
	if (!Array.isArray(ids)) return;
	let baseY = res.ToBox2DUnit(232);
	let y = baseY;
	let x0 = 0;
	let x1 = 0;
	let width = res.ToBox2DUnit(GC.SCREEN_WIDTH);
	let centerX = width;
	let flag = true;
	x0 = x1 = width / 2;
	for (let id of ids)
	{
		let body = allBalls[id];
		if (body)
		{
			let radius = res.ToBox2DUnit(body['_balldef'].radius) * 1.1;
			let x;
			//下面那么麻烦是因为，把一系列球移动到上面(y < baseY)
			//并且，平均分配在中心的两边
			//x0表示扩展到左边的坐标，x1表示扩展到右边的坐标
			x = flag ? x0 - radius : x1 + radius;
			if (x - radius <= 0 || x + radius >= width)
			{
				y -= radius * 2;
				x0 = x1 = width / 2;
				x = flag ? x0 - radius : x1 + radius;
			}
			if (flag)
				x0 -= radius * 2;
			else
				x1 += radius * 2;
			flag = !flag;
			body.SetPosition(new b2Vec2(x, y));
		}
	}
}

function stop(obj) 
{
	clearInterval(timerId);
	timerId = null;
	world = null;
	worldId = -1;
	allBalls = {};
}

function initPhysics(obj?)
{
	if (obj.id != worldId)
	{
		throw new Error('worldId not matched');

	}
	for (let i = 0; i < 50; ++i)
	{
		world.Step(GC.TICK_TIME, 2, 2);
	}
	postMessage({ cmd: 'initPhysicsReady', id: worldId });
}

function update() 
{
	if (pausePhysics) return;
	let t0 = Date.now();
	world.Step(GC.TICK_TIME * timeScale, 2, 2);
	let t1 = Date.now();
	let balls = [];
	for (let id in allBalls)
	{
		let ball = allBalls[id];
		let pos: any = ball.GetPosition();
		pos = {
			x: res.FromBox2DUnit(pos.x),
			y: res.FromBox2DUnit(pos.y)
		};
		balls.push({
			id: id,
			pos: pos,
			rot: ball.GetAngle()
		});
	}
	g.postMessage({ cmd: 'update', balls: balls, time: t1 - t0, id: worldId });
}

function addBall(obj)
{
	let id = obj.id;
	let x = obj.x;
	let y = obj.y;
	let radius = obj.radius;
	if (id in allBalls)
	{
		throw new Error(`ball.id=${id} already created`);
	}

	let def = new Box2D.Dynamics.b2BodyDef();
	def.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	def.allowSleep = true;
	def.bullet = false;
	def.position.Set(res.ToBox2DUnit(x), res.ToBox2DUnit(y));
	let body = world.CreateBody(def)
	{
		let shape = new Box2D.Collision.Shapes.b2CircleShape(res.ToBox2DUnit(radius));
		let fixture = body.CreateFixture2(shape, 0.7);
		fixture.SetRestitution(0);
		fixture.SetFriction(2);
	}
	let earPos = obj.earPos;
	let earRadius = obj.earRadius;
	if (earPos && earPos.length)
	{
		for (let i = 0; i < earPos.length; ++i)
		{
			let shape = new Box2D.Collision.Shapes.b2CircleShape(res.ToBox2DUnit(earRadius));
			shape.SetLocalPosition(new Box2D.Common.Math.b2Vec2(
				res.ToBox2DUnit(earPos[i].x),
				res.ToBox2DUnit(earPos[i].y)
			));
			let fixture = body.CreateFixture2(shape, 0.7);
			fixture.SetRestitution(0);
			fixture.SetFriction(10);
		}
	}
	body['_balldef'] = obj;
	allBalls[id] = body;
}

function delBall(obj)
{
	let id = obj.id;
	if (!(id in allBalls))
	{
		throw new Error(`Ball.id=${id} not exists`);
	}
	let ball = allBalls[id];
	delete allBalls[id];
	world.DestroyBody(ball);
}

function shake(obj: any) 
{
	let power = +obj.power;

	for (let key in allBalls)
	{
		let body = allBalls[key];
		if (Math.random() < 0.6)
		{
			let pos = body.GetPosition().Copy();
			pos.x += res.ToBox2DUnit(10);
			let impuls = new b2Vec2(0, -(0.4 + Math.random() * 0.05));
			impuls.y *= res.GLOBAL_SCALE * power;
			body.ApplyImpulse(impuls, pos);
		}
	}
}