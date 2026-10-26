import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/trow/portal.ts
const route = {
	path: "/portal",
	categories: ["bbs"],
	example: "/trow/portal",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["trow.cc/"] }],
	name: "首页更新",
	maintainers: ["shiningdracon"],
	handler,
	url: "trow.cc/"
};
async function handler() {
	let data;
	const response = await got_default.extend({ followRedirect: false }).get({ url: "https://trow.cc" });
	if (response.statusCode === 302) data = (await got_default.extend({ followRedirect: false }).get({
		url: "https://trow.cc",
		headers: { cookie: response.headers["set-cookie"] }
	})).data;
	else data = response.data;
	const $ = load(data);
	return {
		title: "The Ring of Wonder - Portal",
		link: "https://trow.cc",
		description: "The Ring of Wonder 首页更新",
		item: $("#portal_content .borderwrap[style=\"display:show\"]").toArray().map((item) => {
			item = $(item);
			const dateraw = item.find(".postdetails").text();
			return {
				title: item.find(".maintitle p:nth-child(2) > a").text(),
				description: item.find(".portal_news_content .row18").html(),
				link: item.find(".maintitle p:nth-child(2) > a").attr("href"),
				author: item.find(".postdetails a").text(),
				pubDate: timezone(parseDate(dateraw.slice(3), "YYYY-MM-DD, HH:mm"), 8)
			};
		})
	};
}
//#endregion
export { route };
