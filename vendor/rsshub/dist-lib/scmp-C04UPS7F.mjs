import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseItem } from "./utils-RUBd9oBb.mjs";
import { load } from "cheerio";
//#region lib/routes/scmp/index.ts
const route = {
	path: "/:category_id",
	categories: ["traditional-media"],
	example: "/scmp/3",
	parameters: { category_id: "Category" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["scmp.com/rss/:category_id/feed"] }],
	name: "News",
	maintainers: ["proletarius101"],
	handler,
	description: `See the [official RSS page](https://www.scmp.com/rss) to get the ID of each category. This route provides fulltext that the offical feed doesn't.`
};
const getAttribs = (attribs) => {
	if (!attribs) return;
	const obj = {};
	for (const key in attribs) if (Object.hasOwn(attribs, key)) obj[key] = attribs[key];
	return obj;
};
async function handler(ctx) {
	const { data: response } = await got_default(`https://www.scmp.com/rss/${ctx.req.param("category_id")}/feed`);
	const $ = load(response, { xmlMode: true });
	const list = $("item").toArray().map((elem) => {
		const item = $(elem);
		const enclosure = item.find("enclosure").first();
		const mediaContent = item.find(String.raw`media\:content`).toArray()[0];
		const thumbnail = item.find(String.raw`media\:thumbnail`).toArray()[0];
		return {
			title: item.find("title").text(),
			description: item.find("description").text(),
			link: item.find("link").text().split("?utm_source", 1)[0],
			author: item.find("author").text(),
			pubDate: parseDate(item.find("pubDate").text()),
			enclosure_url: enclosure?.attr("url"),
			enclosure_length: enclosure?.attr("length"),
			enclosure_type: enclosure?.attr("type"),
			media: {
				content: mediaContent ? getAttribs(mediaContent.attribs) : {},
				thumbnail: thumbnail?.attribs ? getAttribs(thumbnail.attribs) : void 0
			}
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => parseItem(item))));
	ctx.set("json", { items });
	return {
		title: $("channel > title").text(),
		link: $("channel > link").text(),
		description: $("channel > description").text(),
		item: items,
		language: "en-hk",
		icon: "https://assets.i-scmp.com/static/img/icons/scmp-icon-256x256.png",
		logo: "https://customerservice.scmp.com/img/logo_scmp@2x.png",
		image: $("channel > image > url").text()
	};
}
//#endregion
export { route };
