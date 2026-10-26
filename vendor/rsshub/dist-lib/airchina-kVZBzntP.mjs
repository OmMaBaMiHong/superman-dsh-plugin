import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as buildData } from "./common-config-072DXp-h.mjs";
import { load } from "cheerio";
//#region lib/routes/airchina/index.ts
const baseUrl = "https://www.airchina.com.cn";
const route = {
	path: "/announcement",
	categories: ["travel"],
	example: "/airchina/announcement",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.airchina.com.cn/"] }],
	name: "服务公告",
	maintainers: ["LandonLi"],
	handler,
	url: "www.airchina.com.cn/"
};
async function handler() {
	const link = `${baseUrl}/cn/info/new-service/service_announcement.shtml`;
	const data = await buildData({
		link,
		url: link,
		title: "%title%",
		description: "%description%",
		params: {
			title: "国航服务公告",
			description: "中国国际航空公司服务公告"
		},
		item: {
			item: ".serviceMsg li",
			title: `$('a').text()`,
			link: `$('a').attr('href')`,
			pubDate: `parseDate($('span').text(), 'YYYY-MM-DD')`,
			guid: Buffer.from(`$('a').attr('href')`).toString("base64")
		}
	});
	await Promise.all(data.item.map(async (item) => {
		const detailLink = baseUrl + item.link;
		item.description = await cache_default.tryGet(detailLink, async () => {
			return load((await got_default(detailLink)).data)(".serviceMsg").html();
		});
	}));
	return data;
}
//#endregion
export { route };
