import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/supchina/podcasts.ts
const route = {
	path: "/podcasts",
	categories: ["new-media"],
	example: "/supchina/podcasts",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["supchina.com/podcasts", "supchina.com/"] }],
	name: "Podcasts",
	maintainers: ["nczitzk"],
	handler,
	url: "supchina.com/podcasts"
};
async function handler(ctx) {
	const rootUrl = "https://supchina.com";
	const $ = load((await got_default({
		method: "get",
		url: `${rootUrl}/feed/podcast`
	})).data);
	let items = $("item").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((item) => {
		item = $(item);
		return {
			link: item.find("guid").text(),
			author: item.find(String.raw`itunes\:author`).text()
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const data = (await got_default({
			method: "get",
			url: `https://rss.art19.com/episodes/${(await got_default({
				method: "get",
				url: item.link
			})).data.match(/data-episode-id="(.*?)"/)[1]}`,
			headers: { accept: "application/json" }
		})).data;
		item.title = data.content.episode_title;
		item.itunes_item_image = data.content.cover_image;
		item.itunes_duration = data.content.duration;
		item.enclosure_url = data.content.media.mp3.url;
		item.enclosure_type = data.content.media.mp3.content_type;
		item.description = data.content.episode_description;
		item.pubDate = parseDate(data.performed_at);
		return item;
	})));
	return {
		title: "SupChina - Podcasts",
		link: `${rootUrl}/podcasts`,
		itunes_author: $(String.raw`channel itunes\:author`).first().text(),
		image: $(String.raw`itunes\:image`).attr("href"),
		item: items
	};
}
//#endregion
export { route };
