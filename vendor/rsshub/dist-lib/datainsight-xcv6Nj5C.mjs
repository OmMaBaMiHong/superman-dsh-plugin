import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dtcj/datainsight.ts
const route = {
	path: "/datainsight/:id?",
	categories: ["finance"],
	example: "/dtcj/datainsight",
	parameters: { id: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["dtcj.com/insighttopic/:id"],
		target: "/datainsight/:id"
	}],
	name: "数据洞察",
	maintainers: ["nczitzk"],
	handler,
	url: "dtcj.com/dtcj/datainsight",
	description: `| 城数 | NEXT 情报局 | 专业精选 |
| ---- | ----------- | -------- |
| 3    | 1           | 4        |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "";
	const rootUrl = "https://dtcj.com";
	const currentUrl = `${rootUrl}/${id ? `insighttopic/${id}` : "datainsight"}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".info-2_P1UM a").slice(0, 10).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		item.description = load(detailResponse.data)(".content-3mNFyi").html();
		item.pubDate = parseDate(detailResponse.data.match(/"date":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}\+\d{2}:\d{2})","thumbnail_url":/)[1]);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
