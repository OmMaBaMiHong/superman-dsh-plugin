import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-Cx1v_Np5.mjs";
import { load } from "cheerio";
//#region lib/routes/leiphone/index.ts
const route = {
	path: "/:do?/:keyword?",
	radar: [{
		source: ["leiphone.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "leiphone.com/"
};
async function handler(ctx) {
	const todo = ctx.req.param("do") ?? "";
	const keyword = ctx.req.param("keyword") ?? "";
	const url = `https://www.leiphone.com/${todo}/${keyword}`;
	const $ = load((await got_default.get(url)).data);
	const list = $(".word > h3 > a").slice(0, 10).toArray().map((e) => $(e).attr("href"));
	const items = await utils_default.ProcessFeed(list, cache_default);
	return {
		title: `雷峰网${todo === "category" ? ` ${keyword}` : ""}`,
		description: "雷峰网 - 读懂智能&未来",
		link: url,
		item: items
	};
}
//#endregion
export { route };
