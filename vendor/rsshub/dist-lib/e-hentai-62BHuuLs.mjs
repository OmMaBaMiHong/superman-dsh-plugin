import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/e-hentai/index.tsx
const route = {
	path: "/:what?/:id?/:needTorrents?/:needImages?",
	name: "Unknown",
	maintainers: [],
	features: { nsfw: true },
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "";
	const what = ctx.req.param("what") ?? "";
	const needTorrents = /t|y/i.test(ctx.req.param("needTorrents") ?? "true");
	const needImages = /t|y/i.test(ctx.req.param("needImages") ?? "true");
	const currentUrl = `https://e-hentai.org/${id ? what === "search" ? `?${id}` : what === "category" ? id : `${what}/${id}` : what}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".itd").parent().remove();
	let items = $("table.gltc tbody tr").slice(1, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) + 1 : needImages ? 16 : 26).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("div.glink").text(),
			author: item.find("td.glhide div a").text(),
			link: item.find("td.glname a").attr("href"),
			pubDate: parseDate(item.find("div.ir").prev().text()),
			category: item.find("div.gt").toArray().map((tag) => $(tag).attr("title").replace(/^:/, "")),
			description: needImages ? "" : `<img src="${item.find("div.glthumb div img").attr("data-src") ?? item.find("div.glthumb div img").attr("src")}">`,
			enclosure_url: needTorrents && item.find("div.gldown a img[title=\"Show torrents\"]").length > 0 ? item.find(".gldown a").attr("href") : void 0
		};
	});
	items = await Promise.all(items.map(async (item) => {
		if (item.enclosure_url) {
			let forms = "", torrents = await cache_default.get(item.enclosure_url);
			if (!torrents) {
				const torrent = load((await got_default({
					method: "get",
					url: item.enclosure_url
				})).data);
				torrent("h1, input[name=\"torrent_info\"]").remove();
				forms = torrent("form").parent().html();
				torrents = torrent("table tbody tr td a").toArray().map((t) => {
					t = torrent(t);
					return {
						link: t.attr("href"),
						title: t.text()
					};
				});
				cache_default.set(item.enclosure_url, torrents);
			}
			item.description += forms;
			item.enclosure_url = torrents[0].link;
			item.enclosure_type = "application/x-bittorrent";
		}
		if (needImages) {
			let images = await cache_default.get(item.link);
			if (!images) {
				const content = load((await got_default({
					method: "get",
					url: item.link
				})).data);
				images = await Promise.all(content(".gdtm a").toArray().map((i) => cache_default.tryGet(content(i).attr("href"), async () => {
					return load((await got_default({
						method: "get",
						url: content(i).attr("href")
					})).data)("#img").attr("src");
				})));
				cache_default.set(item.link, images);
			}
			item.description += renderToString(/* @__PURE__ */ jsx(Fragment, { children: images.map((image) => /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: image }) })) }));
		}
		return item;
	}));
	return {
		title: `${id || what || "Front Page"} - E-Hentai Galleries`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
