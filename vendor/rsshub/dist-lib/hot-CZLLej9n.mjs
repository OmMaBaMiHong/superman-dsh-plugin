import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/wallstreetcn/hot.ts
const route = {
	path: "/hot/:period?",
	categories: ["finance"],
	example: "/wallstreetcn/hot",
	parameters: { period: "时期，可选 `day` 即 当日 或 `week` 即 当周，默认为当日" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wallstreetcn.com/"] }],
	name: "最热文章",
	maintainers: ["nczitzk"],
	handler,
	url: "wallstreetcn.com/"
};
async function handler(ctx) {
	const period = ctx.req.param("period") ?? "day";
	const rootUrl = "https://wallstreetcn.com";
	const apiRootUrl = "https://api-one-wscn.awtmt.com";
	let items = (await got_default({
		method: "get",
		url: `${apiRootUrl}/apiv1/content/articles/hot?period=all`
	})).data.data[`${period}_items`].map((item) => ({
		guid: item.id,
		link: item.uri,
		pubDate: parseDate(item.display_time * 1e3)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const data = (await got_default({
			method: "get",
			url: `${apiRootUrl}/apiv1/content/articles/${item.guid}?extract=0`
		})).data.data;
		item.title = data.title || data.content_text;
		item.author = data.source_name ?? data.author.display_name;
		item.description = data.content + (data.content_more ?? "");
		item.category = data.asset_tags?.map((t) => t.name) ?? [];
		if (data.audio_uri) {
			item.enclosure_type = "audio/mpeg";
			item.enclosure_url = data.audio_uri;
			item.itunes_item_image = data.image?.uri ?? "";
			item.itunes_duration = data.audio_info?.duration ?? "";
		}
		return item;
	})));
	return {
		title: "华尔街见闻 - 最热文章",
		link: rootUrl,
		item: items,
		itunes_author: "华尔街见闻",
		image: "https://static.wscn.net/wscn/_static/favicon.png"
	};
}
//#endregion
export { route };
