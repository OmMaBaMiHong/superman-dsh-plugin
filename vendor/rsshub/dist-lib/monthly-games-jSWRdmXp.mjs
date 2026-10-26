import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ps/monthly-games.tsx
const baseUrl = "https://www.playstation.com/en-sg/ps-plus/whats-new/";
const route = {
	path: "/monthly-games",
	categories: ["game"],
	view: 5,
	example: "/ps/monthly-games",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.playstation.com/en-sg/ps-plus/whats-new"],
		target: "/monthly-games"
	}],
	name: "PlayStation Monthly Games",
	maintainers: ["justjustCC"],
	handler,
	url: "www.playstation.com/en-sg/ps-plus/whats-new"
};
const normalizeText = (text) => text.replaceAll(/\s+/g, " ").trim();
const getSrcsetUrl = (srcset) => srcset?.split(",", 1)[0]?.trim().split(/\s+/, 1)[0];
const getAbsoluteUrl = (url) => url ? new URL(url, baseUrl).href : void 0;
const renderDescription = (img, text) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [img ? /* @__PURE__ */ jsx("img", { src: img }) : null, text] }));
async function handler() {
	const { data: response } = await got_default(baseUrl);
	const $ = load(response);
	const cards = $(".cmp-experiencefragment--wn-latest-monthly-games-content .box").toArray();
	const fallbackCards = $("#monthly-games .box--light").toArray();
	const list = (cards.length > 0 ? cards : fallbackCards).map((e) => {
		const item = $(e);
		const img = item.find(".media-block--image").first().attr("data-src") ?? getSrcsetUrl(item.find(".media-block__img source").first().attr("srcset")) ?? item.find(".media-block__img img").first().attr("src");
		const title = item.find("h3").first().text();
		const text = normalizeText(item.find(".txt-block__paragraph p, .body-text-block p, h3 + p").first().text());
		const link = getAbsoluteUrl(item.find("a[href]").first().attr("href"));
		return {
			title,
			description: renderDescription(img, text),
			link
		};
	}).filter((item) => item.title && item.link);
	return {
		title: "PlayStation Plus Monthly Games",
		link: baseUrl,
		item: list
	};
}
//#endregion
export { route };
