import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/storyfm/episodes.tsx
const route = {
	path: "/episodes",
	categories: ["multimedia"],
	example: "/storyfm/episodes",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["storyfm.cn/episodes-list", "storyfm.cn/"] }],
	name: "播客",
	maintainers: ["nczitzk"],
	handler,
	url: "storyfm.cn/episodes-list"
};
async function handler() {
	const currentUrl = `https://storyfm.cn/episodes-list/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".e-ep").toArray().map((item) => {
		item = $(item);
		const a = item.find("h2.e-ep__title a");
		return {
			title: a.text(),
			link: a.attr("href"),
			pubDate: parseDate(item.find(".whitespace-nowrap").text()),
			enclosure_type: "audio/mpeg",
			enclosure_url: item.find("audio source").attr("src"),
			itunes_item_image: item.find(".zoom-image-container-progression img").attr("src")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.author = content(".rs-post__author").text().replace(/By/, "").trim();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.enclosure_url ? /* @__PURE__ */ jsx("audio", {
			controls: true,
			children: /* @__PURE__ */ jsx("source", { src: item.enclosure_url })
		}) : null, content(".rs-post__content").html() ? raw(content(".rs-post__content").html()) : null] }));
		return item;
	})));
	return {
		title: "故事FM",
		link: currentUrl,
		item: items,
		itunes_author: "故事FM",
		image: $(".custom-logo-link img").attr("src")
	};
}
//#endregion
export { route };
