import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as rootUrl } from "./utils-BhxW03lY.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/agefans/update.ts
const route = {
	path: "/update",
	categories: ["anime"],
	example: "/agefans/update",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["agemys.org/update", "agemys.org/"] }],
	name: "最近更新",
	maintainers: ["nczitzk"],
	handler,
	url: "agemys.org/update"
};
async function handler() {
	const currentUrl = `${rootUrl}/update`;
	const $ = load((await got_default(currentUrl)).data);
	const items = await pMap($(".video_item").toArray().map((item) => {
		item = $(item);
		const link = item.find("a").attr("href").replace("http://", "https://");
		return {
			title: item.text(),
			link,
			guid: `${link}#${item.find(".video_item--info").text()}`
		};
	}), (item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		content("img").each((_, ele) => {
			if (!ele.attribs["data-original"]) return;
			ele.attribs.src = ele.attribs["data-original"];
			delete ele.attribs["data-original"];
		});
		content(".video_detail_collect").remove();
		item.description = content(".video_detail_left").html();
		return item;
	}), { concurrency: 3 });
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
