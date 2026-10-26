import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as utils_default } from "./utils-Bcc1WW3J.mjs";
//#region lib/routes/thepaper/sidebar.ts
const sections = {
	hotNews: "澎湃热榜",
	financialInformationNews: "澎湃快讯",
	morningEveningNews: "早晚报",
	editorHandpicked: "要闻精选"
};
const route = {
	path: "/sidebar/:sec?",
	radar: [{
		source: ["thepaper.cn/"],
		target: "/sidebar"
	}],
	name: "侧边栏",
	categories: ["new-media"],
	example: "/thepaper/sidebar",
	parameters: { sec: {
		description: "侧边栏 id",
		options: Object.entries(sections).map(([key, value]) => ({
			label: value,
			value: key
		}))
	} },
	maintainers: ["bigfei"],
	handler,
	url: "thepaper.cn/"
};
async function handler(ctx) {
	const { sec = "hotNews" } = ctx.req.param();
	const list = (await rofetch("https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar")).data[sec];
	const items = await Promise.all(list.filter((item) => item.contId).map((item) => utils_default.ProcessItem(item, ctx)));
	return {
		title: `澎湃新闻 - ${sections[sec] ?? sec}`,
		item: items,
		link: "https://www.thepaper.cn"
	};
}
//#endregion
export { route };
