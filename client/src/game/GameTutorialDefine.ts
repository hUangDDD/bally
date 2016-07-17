

type ITutorialDefine = {
	x: number;
	y: number;
	saying: string;
	action?: string;
	wait?: number;
	saying2?: string;
	bombInfo?: any;
	ySpan?: number;
	blinkSkill?: boolean;
};


export let TutorialDefine: ITutorialDefine[] = [
	{
		x: 114, y: 481,
		saying: '\n欢迎来到果冻物语~\n下面请根据提示完成\n引导内容。',
	},
	{
		//自动高亮3个可以连接的球
		//允许用户连接这3个球
		//如果用户没有立即连接成功的话，显示saying2
		//连接爆炸完成之后，才显示后面的步骤
		x: 78, y: 350,
		saying: '果冻堆中存在着各种\n各样的果冻，3个或\n以上临近的果冻可以\n连接消除。',
		saying2: '试着连接高亮的果冻\n获得分数吧~',
		action: 'linkThree',
		wait: 1.3, //炸了之后，等一下才进入下一步
	},
	{
		x: 110, y: 478,
		saying: '干得不错！\n每次连接的果冻越多\n获得的分数就越多~',
	},
	{
		x: 110, y: 478,
		saying: '单次链接7个或以上\n的果冻时会在结尾处\n生成一个炸弹，点击\n炸弹会引爆炸弹周围\n的果冻。',
	},
	{
		//连接7个
		//一定要连接完成7个的
		x: 114, y: 289,
		saying: '试着一次性连接7个\n果冻吧~',
		action: 'linkSeven',
		wait: 1.3
	},
	{
		//高亮炸弹，并且只能点击炸弹
		x: 114, y: 289,
		saying: '炸弹出现了！由于炸\n弹点击就能引爆，使\n用得当的话是高combo\n高分的关键所在！',
		action: 'linkBomb',
		wait: 1.3,
	},
	{
		x: 114, y: 289,
		saying: '另外单次连接果冻数\n量达到10个或以\n上时炸弹可能会突变\n为更强力的特殊炸弹。',
		action: 'showBombInfo',

		ySpan: 65,
		bombInfo: [
			{ x: 101, y: 271, text: '普通炸弹，点击后炸掉所有\n接触炸弹的果冻' },
			{ x: 101, y: 271, text: '经验炸弹，使用后此局结算\n时携带宠物额外增加10点经验。' },
			{ x: 101, y: 271, text: '金币炸弹，使用后此局结算\n金币额外增加10个。' },
			{ x: 101, y: 271, text: '分数炸弹，使用后此次引爆\n获得分数翻倍增加。' },
			{ x: 101, y: 271, text: '时间炸弹，使用后游戏倒计\n时增加两秒。' },
		]
	},
	{
		//高亮一下技能按钮
		x: 102, y: 712,
		saying: '除了炸弹，游戏中每\n个果冻还有自己的技\n能。当消除一定数量\n的果冻后点击左下果\n冻就可释放宠物技能。',
		action: 'showSkill',
		blinkSkill: true,
	},
	{
		x: 116, y: 483,
		saying: '引导完毕，在游戏中\n尝试下刚刚引导的内\n容吧~'
	}
];