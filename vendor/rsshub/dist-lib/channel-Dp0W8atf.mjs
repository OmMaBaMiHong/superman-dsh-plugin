import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-Cb-UFpEy.mjs";
import { load } from "cheerio";
//#region lib/routes/vimeo/channel.ts
const route = {
	path: "/channel/:channel",
	categories: ["social-media"],
	example: "/vimeo/channel/bestoftheyear",
	parameters: { channel: "channel name can get from url like `bestoftheyear` in  [https://vimeo.com/channels/bestoftheyear/videos](https://vimeo.com/channels/bestoftheyear/videos) ." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"vimeo.com/channels/:channel",
		"vimeo.com/channels/:channel/videos",
		"vimeo.com/channels/:channel/videos/:sort/:format"
	] }],
	name: "Channel",
	maintainers: ["MisteryMonster"],
	handler
};
async function handler(ctx) {
	const channel = ctx.req.param("channel");
	const url = `https://vimeo.com/channels/${channel}/videos`;
	const page1 = await got_default({
		method: "get",
		url: `${url}/page:1/sort:date/format:detail`,
		headers: { "X-Requested-With": "XMLHttpRequest" }
	});
	const page2 = channel === "bestoftheyear" ? await got_default({
		method: "get",
		url: `${url}/page:2/sort:date/format:detail`,
		headers: { "X-Requested-With": "XMLHttpRequest" }
	}) : "";
	const $ = load([...page1.data, ...page2.data]);
	const list = $("ol li.clearfix");
	const description = await Promise.all(list.toArray().map((item) => {
		item = $(item);
		const link = item.find(".more").attr("href");
		return cache_default.tryGet(link, async () => {
			const articledata = (await got_default({
				method: "get",
				url: `https://vimeo.com${link}/description?breeze=1`,
				headers: { "X-Requested-With": "XMLHttpRequest" },
				headerGeneratorOptions: PRESETS.MODERN_IOS
			})).data;
			const $2 = load(articledata);
			$2("span").remove();
			return $2.html();
		});
	}));
	return {
		title: `${channel} | Vimeo channel`,
		link: url,
		item: list.toArray().map((item, index) => {
			item = $(item);
			const title = item.find(".title a").text();
			const author = item.find(".meta a").text();
			return {
				title,
				description: renderDescription({
					videoUrl: item.find(".more").attr("href"),
					vdescription: description[index] || ""
				}),
				pubDate: parseDate(item.find("time").attr("datetime")),
				link: `https://vimeo.com${item.find(".more").attr("href")}`,
				author
			};
		})
	};
}
//#endregion
export { route };
