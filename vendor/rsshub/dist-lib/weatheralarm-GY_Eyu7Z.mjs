import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/nmc/weatheralarm.ts
const route = {
	path: "/weatheralarm/:province?",
	categories: ["forecast"],
	example: "/nmc/weatheralarm/广东省",
	parameters: { province: "省份" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["nmc.cn/publish/alarm.html", "nmc.cn/"],
		target: "/weatheralarm"
	}],
	name: "全国气象预警",
	maintainers: ["ylc395"],
	handler,
	url: "nmc.cn/publish/alarm.html"
};
async function handler(ctx) {
	const { province = "" } = ctx.req.param();
	const { data: response } = await got_default("http://www.nmc.cn/rest/findAlarm", { searchParams: {
		pageNo: 1,
		pageSize: 20,
		signaltype: "",
		signallevel: "",
		province
	} });
	const list = response.data.page.list.map((item) => ({
		title: item.title,
		link: `http://www.nmc.cn${item.url}`,
		pubDate: timezone(parseDate(item.issuetime), 8)
	}));
	return {
		title: "中央气象台全国气象预警",
		link: "http://www.nmc.cn/publish/alarm.html",
		allowEmpty: true,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const $ = cheerio.load(response);
			item.description = $("#icon").html() + $("#alarmtext").toArray().map((i) => $(i).html()).join("");
			return item;
		})))
	};
}
//#endregion
export { route };
