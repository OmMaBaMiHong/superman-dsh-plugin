import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/rawkuma/manga.tsx
const route = {
	path: "/manga/:id",
	categories: ["anime"],
	example: "/rawkuma/manga/tensei-shitara-dai-nana-ouji-dattanode-kimamani-majutsu-o-kiwamemasu",
	parameters: { id: "Manga ID, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["rawkuma.com/manga/:id", "rawkuma.com/"] }],
	name: "Manga",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const currentUrl = new URL(`/manga/${id}`, "https://rawkuma.com").href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const author = $("div.fmed span").eq(1).text().trim();
	const category = $("div.wd-full span.mgen a[rel=\"tag\"]").toArray().map((c) => $(c).text());
	let items = $("div.eph-num").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("span.chapternum").text(),
			link: item.find("a").prop("href"),
			author,
			category,
			pubDate: parseDate(item.find("span.chapterdate").text(), "MMMM DD"),
			enclosure_url: item.next().find("a.dload").prop("href"),
			enclosure_type: "application/zip"
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		const imageMatches = detailResponse.match(/"images":(\[.*?\])\}\],"lazyload"/);
		const images = imageMatches ? JSON.parse(imageMatches[1]) : [];
		item.title = content("div.chpnw").text().trim();
		item.description = renderToString(/* @__PURE__ */ jsx(Fragment, { children: images.map((image) => /* @__PURE__ */ jsx("img", { src: image })) }));
		item.author = author;
		item.category = category;
		item.pubDate = parseDate(content("time.entry-date").prop("datetime").replace(/WIB/, "T"));
		item.enclosure_url = content("span.dlx a").prop("href");
		item.enclosure_type = "application/zip";
		return item;
	})));
	const icon = $("link[rel=\"apple-touch-icon\"]").prop("href").replace(/-\d+x\d+/, "");
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("div[itemprop=\"description\"]").text(),
		image: $("meta[property=\"og:image\"]").prop("content"),
		icon,
		logo: icon,
		subtitle: $("div.wd-full span").text(),
		author
	};
}
//#endregion
export { route };
