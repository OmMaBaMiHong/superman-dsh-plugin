import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/95mm/utils.tsx
const rootUrl = "https://www.95mm.vip";
const ProcessItems = async (ctx, title, currentUrl) => {
	const $ = load((await got_default({
		method: "get",
		url: currentUrl,
		headers: { Referer: rootUrl }
	})).data);
	let items = $("div.list-body").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: a.attr("href"),
			guid: a.attr("href").replace("95mm.vip", "95mm.org")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = renderToString(/* @__PURE__ */ jsx(Fragment, { children: (await got_default({
			method: "get",
			url: item.link
		})).data.match(/src": '(.*?)',"width/g).map((image) => /* @__PURE__ */ jsx("img", { src: image.split("'", 2)[1].replaceAll(String.raw`\/`, "/") })) }));
		return item;
	})));
	return {
		title: `${title} - MM范`,
		link: currentUrl,
		item: items
	};
};
//#endregion
export { rootUrl as n, ProcessItems as t };
