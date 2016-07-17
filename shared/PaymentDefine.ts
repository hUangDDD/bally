
export const BUY_COIN_DEFINE = [
	{ id: 'coin6000', coin: 6000, diamond: 10, promote: '' },
	{ id: 'coin39600', coin: 39600, diamond: 60, promote: '10%' },
	{ id: 'coin86400', coin: 86400, diamond: 120, promote: '20%' },
	{ id: 'coin195000', coin: 195000, diamond: 250, promote: '30%' },
];

export const BUY_HEART_DEFINE = [
	{ id: 'heart5_double', heart: 10, diamond: 5, promote: '' },
	{ id: 'heart20_double', heart: 40, diamond: 15, promote: '30%' },
	{ id: 'heart50_double', heart: 100, diamond: 40, promote: '60%' },

	//{ id: 'heart5', heart: 5, diamond: 5, promote: '' },
	//{ id: 'heart20', heart: 20, diamond: 15, promote: '30%' },
	//{ id: 'heart50', heart: 50, diamond: 40, promote: '60%' },
];

export const BUY_DIAMOND_DEFINE: {
	id: string;
	diamond: number;
	cash: number;
	promote: string;
	onlyonce?: boolean;
}[] = [
		{ id: 'diamond6000', diamond: 30, cash: 6, promote: '200%', onlyonce: true },//只能买一次的东西
		{ id: 'diamond6001', diamond: 10, cash: 6, promote: '' },
		{ id: 'diamond39600', diamond: 72, cash: 40, promote: '8%' },
		{ id: 'diamond86400', diamond: 330, cash: 158, promote: '25%' },
		{ id: 'diamond23300', diamond: 505, cash: 233, promote: '30%' },
		{ id: 'diamond34800', diamond: 860, cash: 348, promote: '48%' },
	];