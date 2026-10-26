import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/natgeo/dailyphoto.tsx
const renderDescription = (img) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", {
		src: img?.src,
		alt: img?.altText
	}),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("h3", { children: img?.ttl ? raw(img.ttl) : null }),
	/* @__PURE__ */ jsx("p", { children: img?.dsc ? raw(img.dsc) : null }),
	/* @__PURE__ */ jsx("p", { children: img?.crdt ? raw(img.crdt) : null })
] }));
const route = {
	path: "/dailyphoto",
	categories: ["picture"],
	view: 2,
	example: "/natgeo/dailyphoto",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nationalgeographic.com/photo-of-the-day/*", "nationalgeographic.com/"] }],
	name: "Daily Photo",
	maintainers: [
		"LogicJake",
		"OrangeEd1t",
		"TonyRL",
		"pseudoyu"
	],
	handler,
	url: "nationalgeographic.com/photo-of-the-day/*"
};
async function handler() {
	const rootUrl = "https://www.nationalgeographic.com";
	const apiUrl = `${rootUrl}/photo-of-the-day`;
	const $ = load(await cache_default.tryGet(apiUrl, async () => (await got_default(apiUrl)).data, config.cache.contentExpire, false));
	return {
		title: "Nat Geo Photo of the Day",
		link: apiUrl,
		item: JSON.parse($.html().match(/window\['__natgeo__'\]=(.*);/)[1]).page.content.mediaspotlight.frms[0].mods[0].edgs[1].media.map((item) => ({
			title: item.meta.title,
			description: renderDescription(item.img),
			link: rootUrl + item.locator,
			pubDate: parseDate(item.caption.preHeading),
			author: item.img.crdt
		}))
	};
}
//#endregion
export { route };
