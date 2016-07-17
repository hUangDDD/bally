import {IGameSkill} from "./IGameSkill"
import {Skill1} from "./Skill1"
import {Skill2} from "./Skill2"
import {Skill3} from "./Skill3"
import {Skill4} from "./Skill4"
import {Skill5} from "./Skill5"
import {Skill6} from "./Skill6"
import {Skill7} from "./Skill7"
import {Skill8} from "./Skill8"
import {Skill9} from "./Skill9"
import {Skill10} from "./Skill10"
import {Skill11} from "./Skill11"
import {Skill12} from "./Skill12"
import {Skill13} from "./Skill13"
import {Skill14} from "./Skill14"
import {Skill15} from "./Skill15"
import {Skill16} from "./Skill16"
import {Skill17} from "./Skill17"
import {Skill18} from "./Skill18"
import {Skill19} from "./Skill19"
import {Skill20} from "./Skill20"
import {Skill21} from "./Skill21"
let skillCreator = [
	Skill1,
	Skill2,
	Skill3,
	Skill4,
	Skill5,
	Skill6,
	Skill7,
	Skill8,
	Skill9,
	Skill10,
	Skill11,
	Skill12,
	Skill13,
	Skill14,//empty 不要用，没有实现，暂时也不会去实现了
	Skill15,
	Skill16,
	Skill17,
	Skill18,
	Skill19,
	Skill20,
	Skill21
];

export function createSkill(id): IGameSkill
{
	if (skillCreator[id]) return new skillCreator[id];
	return null;
}