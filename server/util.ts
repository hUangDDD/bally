
//向一个数组push一个item。为了解决easy-mango的bug：
// 不能在同一个周期里 obj.arr = []; obj.arr.push(xxx);
export function safePush(obj: any, key: string, item: any) 
{
	if (!Array.isArray(obj[key]) || obj[key].length === 0)
	{
		obj[key] = [item];
	}
	else
	{
		obj[key].push(item);
	}
}