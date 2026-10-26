import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/douban/other/explore.tsx
const route = {
	path: "/explore",
	categories: ["social-media"],
	example: "/douban/explore",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "浏览发现",
	maintainers: ["clarkzsd"],
	handler
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "https://www.douban.com/explore"
	})).data;
	const $ = load(data);
	return {
		title: "豆瓣-浏览发现",
		link: "https://www.douban.com/explore",
		item: $("div.item").toArray().map((item) => {
			item = $(item);
			const title = item.find(".title a").first().text() ?? "#" + item.find(".icon-topic").text();
			const desc = item.find(".content p").text();
			const itemPic = item.find("a.cover").attr("style") ? item.find("a.cover").attr("style").match(/\('(.*?)'\)/)[1] : "";
			const author = item.find(".usr-pic a").last().text();
			const link = item.find(".title a").attr("href") ?? item.find(".icon-topic a").attr("href");
			return {
				title,
				author,
				description: renderDescription({
					author,
					desc,
					itemPic
				}),
				link
			};
		})
	};
}
const renderDescription = ({ author, desc, itemPic }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	"作者：",
	author,
	/* @__PURE__ */ jsx("br", {}),
	"描述：",
	desc,
	/* @__PURE__ */ jsx("br", {}),
	itemPic ? /* @__PURE__ */ jsx("img", { src: itemPic }) : null
] }));
//#endregion
export { route };
