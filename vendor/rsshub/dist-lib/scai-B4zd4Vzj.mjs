import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/swjtu/scai.ts
const rootURL = "https://scai.swjtu.edu.cn";
const route = {
	path: "/scai/:type",
	categories: ["university"],
	example: "/swjtu/scai/bks",
	parameters: { type: "通知类型" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["scai.swjtu.edu.cn/"] }],
	name: "计算机与人工智能学院",
	description: `| 分区       | 参数 |
| ---------- | ---- |
| 本科生教育 | bks  |
| 研究生教育 | yjs  |
| 学生工作   | xsgz |`,
	maintainers: ["AzureG03", "SuperJeason"],
	handler
};
const partition = {
	bks: {
		title: "本科生教育",
		url: `${rootURL}/web/page-module.html?mid=B730BEB095B31840`
	},
	yjs: {
		title: "研究生教育",
		url: `${rootURL}/web/page-module.html?mid=6A69B0E32021446B`
	},
	xsgz: {
		title: "学生工作",
		url: `${rootURL}/web/page-module.html?mid=F3D3909EB1861B5D`
	}
};
const getItem = (item, cache) => {
	const title = item.find("a").text();
	const link = `${rootURL}${item.find("a").attr("href").slice(2)}`;
	return cache.tryGet(link, async () => {
		const $ = load(await rofetch(link));
		let pubDate;
		let dateText = $("div.news-info span:nth-of-type(2)").text();
		if (!dateText) dateText = $("div.news-top-bar span:nth-of-type(1)").text();
		if (dateText) {
			const dateMatch = dateText.match(/\d{4}(.)\d{1,2}\1\d{1,2}/);
			if (!dateMatch || !dateMatch[0]) return null;
			pubDate = parseDate(dateMatch[0]);
		} else {
			const dateItem = item.find(".calendar");
			const day = dateItem.find(".day").text().trim();
			const [year, month] = dateItem.find(".date").text().trim().split("/");
			const dateText = `${year}-${month}-${day.padStart(2, "0")}`;
			pubDate = new Date(dateText);
		}
		const description = $("div.content-main").html();
		pubDate ||= /* @__PURE__ */ new Date("2025-04-12");
		return {
			title,
			pubDate,
			link,
			description
		};
	});
};
async function handler(ctx) {
	const { type } = ctx.req.param();
	const url = partition[type].url;
	const $ = load(await rofetch(url));
	const $list = $("div.list-top-item, div.item-wrapper");
	const items = await Promise.all($list.toArray().map((i) => {
		const $item = $(i);
		return getItem($item, cache_default);
	}));
	return {
		title: `西南交大计院-${partition[type].title}`,
		link: url,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
