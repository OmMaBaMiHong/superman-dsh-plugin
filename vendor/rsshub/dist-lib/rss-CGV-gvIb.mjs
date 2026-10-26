import "./types-DNj6Etbg.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/inoreader/rss.ts
const route = {
	path: "/rss/:user/:tag",
	categories: ["reading"],
	view: 0,
	example: "/inoreader/rss/1005137674/user-favorites",
	parameters: {
		user: "user id, the interger after user/ in the example URL",
		tag: "tag, the string after tag/ in the example URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "RSS",
	maintainers: ["EthanWng97"],
	handler
};
async function handler(ctx) {
	const rssUrl = `https://www.inoreader.com/stream/user/${ctx.req.param("user")}/tag/${ctx.req.param("tag")}`;
	const feed = await parser.parseURL(rssUrl);
	feed.items = feed.items.map((item) => {
		if (item && item.enclosure && item.enclosure.type.includes("audio")) {
			let firstImgSrc = "";
			if (item.content !== null) firstImgSrc = load(item.content)("img").first().attr("src");
			return {
				title: item.title,
				pubDate: item.pubDate,
				link: item.link,
				description: item.content,
				category: item.categories,
				itunes_item_image: firstImgSrc,
				enclosure_url: item.enclosure.url,
				enclosure_length: item.enclosure.length,
				enclosure_type: item.enclosure.type
			};
		}
		return {
			title: item?.title ?? "",
			pubDate: item?.pubDate ?? "",
			link: item?.link ?? "",
			description: item?.content ?? "",
			category: item?.categories ?? []
		};
	});
	return {
		title: feed.title,
		itunes_author: "Inoreader",
		image: "https://www.inoreader.com/brand/img/ino_app_icon.png",
		link: feed.link,
		description: feed.description,
		item: feed.items
	};
}
//#endregion
export { route };
