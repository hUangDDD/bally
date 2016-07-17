

interface IGift
{
	type: string;//现在只支持pet
	id: number;//pet id
	pp: number;//概率
	num: number;//数量
}

export interface IGiftDefine
{
	price: number;
	gifts: IGift[];
}

export function getShopGift(i: number): IGiftDefine 
{
	if (i == 0)
	{
		return GIFT0;
	}
	return null;
}

const GIFT0: IGiftDefine = {
	price: 10000,
	gifts: [
		{ type: 'pet', id: 0, pp: 5, num: 1 },
		{ type: 'pet', id: 1, pp: 5, num: 1 },
		{ type: 'pet', id: 2, pp: 5, num: 1 },
		{ type: 'pet', id: 3, pp: 5, num: 1 },
		{ type: 'pet', id: 4, pp: 5, num: 1 },
		{ type: 'pet', id: 5, pp: 5, num: 1 },
		{ type: 'pet', id: 6, pp: 5, num: 1 },
		{ type: 'pet', id: 7, pp: 5, num: 1 },
		{ type: 'pet', id: 8, pp: 5, num: 1 },
		{ type: 'pet', id: 9, pp: 5, num: 1 },
		{ type: 'pet', id: 10, pp: 5, num: 1 },
		{ type: 'pet', id: 11, pp: 5, num: 1 },
		{ type: 'pet', id: 12, pp: 5, num: 1 },
		{ type: 'pet', id: 13, pp: 5, num: 1 },
		{ type: 'pet', id: 14, pp: 5, num: 1 },
		{ type: 'pet', id: 15, pp: 5, num: 1 },
		{ type: 'pet', id: 16, pp: 5, num: 1 },
		{ type: 'pet', id: 17, pp: 5, num: 1 },
		{ type: 'pet', id: 18, pp: 5, num: 1 },
		{ type: 'pet', id: 19, pp: 5, num: 1 },
		{ type: 'pet', id: 20, pp: 5, num: 1 },
		{ type: 'pet', id: 21, pp: 5, num: 1 },
		{ type: 'pet', id: 22, pp: 5, num: 1 },
		{ type: 'pet', id: 23, pp: 5, num: 1 },
		{ type: 'pet', id: 24, pp: 5, num: 1 },
		{ type: 'pet', id: 25, pp: 5, num: 1 },
		{ type: 'pet', id: 26, pp: 5, num: 1 },

	]
};