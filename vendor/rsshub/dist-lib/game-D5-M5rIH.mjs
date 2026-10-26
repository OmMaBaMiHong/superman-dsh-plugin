import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseArticle } from "./utils-CJfR1FLc.mjs";
import { load } from "cheerio";
//#region lib/routes/3dmgame/game.ts
const route = {
	path: "/games/:name/:type?",
	radar: [{ source: ["3dmgame.com/games/:name/:type"] }],
	name: "游戏资讯",
	categories: ["game"],
	maintainers: [
		"sinchang",
		"jacky2001114",
		"HenryQW",
		"lyqluis"
	],
	handler
};
async function handler(ctx) {
	const { name, type = "news" } = ctx.req.param();
	const url = `https://www.3dmgame.com/games/${name}/${type}/`;
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = (type === "resource" ? $(".ZQ_Left .Llis_4 .lis li, .zq_left .rigtbox7 li").toArray() : $(".ZQ_Left .lis, .zq_left .newsleft li").toArray()).map((i) => {
		i = $(i);
		const a = i.find("a[href]").last();
		const time = i.find(".time");
		return {
			title: a.text(),
			description: i.find(".miaoshu").text(),
			link: a.attr("href"),
			pubDate: time.length ? parseDate(time.text().trim()) : null
		};
	});
	const items = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: $("head title").text().split("_", 1)[0],
		description: $("head meta[name=\"Description\"]").attr("content"),
		link: url,
		item: items
	};
}
//#endregion
export { route };
