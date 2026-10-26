import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cztv/zjxwlb.tsx
const renderDesc = (item) => renderToString(/* @__PURE__ */ jsx("video", {
	src: item.videoUrl,
	poster: item.posterUrl,
	controls: true,
	loop: true,
	children: item.title
}));
const route = {
	path: "/zjxwlb",
	categories: ["traditional-media"],
	example: "/cztv/zjxwlb",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cztv.com/videos/zjxwlb", "cztv.com/"] }],
	name: "浙江新闻联播",
	maintainers: ["yhkang"],
	handler,
	url: "cztv.com/videos/zjxwlb"
};
async function handler() {
	const url = "http://www.cztv.com/videos/zjxwlb";
	const { data: res } = await got_default(url);
	const $ = load(res);
	return {
		title: "浙江新闻联播",
		link: url,
		item: $("#videolistss li").toArray().map((item) => {
			item = $(item);
			const title = item.find("span.t1").text();
			const link = item.find("input[name=data-url]").attr("value");
			const videoUrl = item.find("input[name=video]").attr("value");
			const posterUrl = item.find("input[name=videoimage]").attr("value");
			return {
				title,
				link,
				pubDate: timezone(parseDate(item.find("span.t2").text() + " 16:30", "YYYY-MM-DD hh:mm"), 8),
				description: renderDesc({
					title,
					videoUrl,
					posterUrl
				})
			};
		})
	};
}
//#endregion
export { route };
