import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ymgal/game.tsx
const host = "https://www.ymgal.games";
const date = /* @__PURE__ */ new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const route = {
	path: "/game/release",
	categories: ["anime"],
	example: "/ymgal/game/release",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["ymgal.games/"] }],
	name: "本月新作",
	maintainers: ["SunBK201"],
	handler,
	url: "ymgal.games/"
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: `${host}/release-list/${year}/${month}`
	})).data);
	const list = $(".game-view-card").toArray();
	const items = list && list.map((item) => {
		item = $(item);
		const itemPicUrl = item.find(".lazy").first().attr("data-original");
		const taginfo = item.find(".tag-info-list").children().toArray().map((elem) => $(elem).text());
		return {
			title: item.attr("title"),
			link: `${host}${item.attr("href")}`,
			description: renderDescription(itemPicUrl, taginfo)
		};
	});
	return {
		title: "月幕 Galgame - 本月新作",
		link: `${host}/release-list/${year}/${month}`,
		description: "月幕 Galgame - 本月新作",
		item: items
	};
}
const renderDescription = (itemPicUrl, taginfo) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	itemPicUrl ? /* @__PURE__ */ jsx("img", { src: itemPicUrl }) : null,
	/* @__PURE__ */ jsx("br", {}),
	taginfo.map((tag, index) => /* @__PURE__ */ jsx("li", { children: tag }, `${tag}-${index}`))
] }));
//#endregion
export { route };
