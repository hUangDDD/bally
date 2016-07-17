
/*

export function getScore(combo: number, count: number): number 
{
	--combo;
	if (combo < 0) combo = 0;
	else if (combo >= scores.length) combo = scores.length - 1;

	let arr = scores[combo];
	count -= 3;
	if (count < 0) count = 0;
	else if (count >= arr.length) count = arr.length - 1;
	return arr[count] | 0;
}
*/

const COIN_GET = [
	0, //0
	0, 0, 0, //123
	1,//4
	3,//5
	5,//6
	7,//7
	10,//8
	13,//9
	16,//10
	21,//11
	26,//12
	31,//13
	36,//14
	46,//15
	//16-29  +++10
	//30: 198 ()
];

export function getCoin(linkCount: number) 
{
	if (linkCount <= 1) return 0;
	if (linkCount < COIN_GET.length) return COIN_GET[linkCount];
	if (linkCount >= 16 && linkCount <= 29)
	{
		return (46 + (linkCount - 15) * 10);
	}
	return (198 + (linkCount - 30) * 12);
}


export function getComboY(n: number) 
{
	if (n <= 1) return 1;
	return 1.1 + 0.01 * (n - 1);
}

export function getLinkCountX(n: number)
{
	if (n < 3) return 0;
	let i = n - 3;
	if (i < LINK_COUNT_X_VALUE.length) return LINK_COUNT_X_VALUE[i];
	return LINK_COUNT_X_VALUE[LINK_COUNT_X_VALUE.length - 1];
}

const LINK_COUNT_X_VALUE = [300,
	700,
	1300,
	2100,
	3100,
	4600,
	6100,
	7600,
	9600,
	11600,
	13600,
	15600,
	18100,
	20600,
	23100,
	25600,
	28100,
	31100,
	34100,
	37100,
	40100,
	43100,
	46100,
	49100,
	52100,
	55100,
	58100,
	61600,
	65100,
	68600,
	72100,
	75600,
	79100,
	82600,
	86100,
	89600,
	93100,
	96600,
	100100,
	103600,
	107100,
	110600,
	114100,
	117600,
	121100,
	124600,
	128100,
	131600,
];