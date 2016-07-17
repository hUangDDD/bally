/**
 * Check if the obj's members match the type.
 * @param obj the object to be tested, can be null or undefined.
 * @param members the members.
 * @param type the type.
 */
export function checkObjectMemberType(obj: any, members: string[], type: string): boolean
{
    if (!obj) return false;
    for (let i = 0; i < members.length; ++i)
    {
        if (typeof obj[members[i]] != type)
            return false;
    }
    return true;
}

function isArray(arr: any)
{
    return arr && typeof arr.length == 'number';
}



type ITypedef = "number" | "string" | "boolean" | "array" | "any" | ((obj: any) => boolean);
interface ITypedefObject
{
    [key: string]: ITypedef | ITypedefObject;
}

/**
 * 
 */
export function objectVerify(obj: any, typedef: ITypedefObject)
{
    if (!obj) return false;
    for (let key in typedef)
    {
        let type = typedef[key];
        if (typeof type === 'object')
        {
            if (!objectVerify(obj[key], type as ITypedefObject)) return false;
        }
        else if (typeof type === 'function')
        {
            if (!(type as any)(obj[key])) return false;
        }
        else
        {
            let val = obj[key];
            switch (type)
            {
                case 'string':
                case 'number':
                case 'undefined':
                case 'boolean':
                    if (typeof val !== type) return false;
                    break;
                case 'array':
                    if (!isArray(val)) return false;
                    break;
                case 'any':
                    if (!(key in obj)) return false;
                    break;
                default:
                    return false;
            }
        }
    }
    return true;
}

export function getObjectByPath(obj: any, path: string, def?: any): any 
{
    var paths = path.split('.');
    for (var key of paths)
    {
        if (!obj) break;
        obj = obj[key];
    }
    return obj || def;
}

export function safeParseJson(str: string)
{
    let obj = null;
    if (typeof str == 'string')
    {
        try
        {
            obj = JSON.parse(str);
        }
        catch (e)
        {

        }
    }
    else//当str不是string的时候，有可能str是已经parse过的json对象了，所以直接返回吧
    {
        obj = str;
    }
    return obj;
}