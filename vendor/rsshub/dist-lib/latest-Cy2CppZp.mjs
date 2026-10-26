import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/tribalfootball/latest.tsx
const rssUrl = "https://www.tribalfootball.com/rss/mediafed/general/rss.xml";
const renderDescription = (desc, headerImage) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [headerImage ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("img", { src: headerImage }) }) : null, desc ? /* @__PURE__ */ jsx(Fragment, { children: raw(desc) }) : null] }));
const route = {
	path: "/",
	radar: [{
		source: ["tribalfootball.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["Rongronggg9"],
	handler,
	url: "tribalfootball.com/"
};
async function handler() {
	const $ = load((await got_default(rssUrl)).data, { xmlMode: true });
	const items = $("rss > channel > item").toArray().map((item) => {
		const $item = $(item);
		let link = $item.find("link").text();
		link = new URL(link);
		link.search = "";
		link = link.href;
		return {
			title: $item.find("title").text(),
			description: $item.find("description").text(),
			link,
			guid: $item.find("guid").text(),
			pubDate: parseDate($item.find("pubDate").text()),
			author: $item.find(String.raw`dc\:creator`).text(),
			_header_image: $item.find("enclosure").attr("url")
		};
	});
	await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		const title = $("head > title").text().replace(" - Tribal Football", "");
		let desc = $(".articleBody");
		desc.find(".ad").remove();
		const ad = desc.find("p > br:first-child").next("i");
		const adNextSpan = ad.next("span");
		if (adNextSpan.length && !adNextSpan.text() && !adNextSpan.next().length) ad.parent().remove();
		desc = desc.html();
		desc = renderDescription(desc, item._header_image);
		item.title = title || item.title;
		item.description = desc || item.description;
		delete item._header_image;
		return item;
	})));
	return {
		title: "Tribal Football - Latest",
		description: "Tribal Football - Football News, Soccer News, Transfers & Rumours",
		link: "https://www.tribalfootball.com/articles",
		image: "https://www.tribalfootball.com/images/tribal-logo-rss.png",
		item: items
	};
}
//#endregion
export { route };
