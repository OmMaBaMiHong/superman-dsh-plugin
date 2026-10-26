import "./types-DNj6Etbg.mjs";
import { t as handler$1 } from "./cfh-NAv6ISdy.mjs";
import { t as handler$2 } from "./guba-Dt0l0mqu.mjs";
import { t as handler$3 } from "./trpl-D2uyutzo.mjs";
//#region lib/routes/eastmoney/gerenzhongxin/gather.ts
const route = {
	path: "/gerenzhongxin/gather/:uid",
	categories: ["finance"],
	view: 0,
	example: "/eastmoney/gerenzhongxin/gather/2922094262312522",
	parameters: { uid: "用户id,即用户主页网址末尾的数字" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{ source: ["guba.eastmoney.com"] },
		{ source: ["caifuhao.eastmoney.com"] },
		{
			source: ["i.eastmoney.com/:uid"],
			target: "/gerenzhongxin/gather/:uid"
		}
	],
	name: "个人中心所有活动",
	maintainers: ["AwesomeDog"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const subCtx = { req: { param: (key) => key === "uid" ? uid : "" } };
	const [cfhResult, gubaResult, trplResult] = await Promise.allSettled([
		handler$1(subCtx),
		handler$2(subCtx),
		handler$3(subCtx)
	]);
	const allItems = [];
	if (cfhResult.status === "fulfilled") allItems.push(...cfhResult.value.item);
	if (gubaResult.status === "fulfilled") allItems.push(...gubaResult.value.item);
	if (trplResult.status === "fulfilled") allItems.push(...trplResult.value.item);
	allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
	return {
		title: `${allItems[0]?.author || "用户"} 的东财所有活动`,
		link: `https://i.eastmoney.com/${uid}`,
		image: `https://avator.eastmoney.com/qface/${uid}/360`,
		item: allItems
	};
}
//#endregion
export { route };
