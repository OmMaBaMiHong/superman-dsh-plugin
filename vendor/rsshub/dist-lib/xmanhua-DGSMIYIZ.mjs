import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xmanhua/index.ts
const route = {
	path: "/:uid",
	categories: ["anime"],
	example: "/xmanhua/73xm",
	parameters: { uid: "漫画 id,在浏览器中可见，例如鬼灭之刃对应的 id 为 `73xm`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["xmanhua.com/:uid"] }],
	name: "最新动态",
	maintainers: ["Ye11"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const host = "https://xmanhua.com";
	const data = (await got_default({
		method: "get",
		url: `https://xmanhua.com/${uid}/`,
		headers: { Referer: host }
	})).data;
	const $ = load(data);
	const list = $("div #chapterlistload").find(".detail-list-form-item");
	const autherName = $("body > div.detail-info-1 > div > div > p.detail-info-tip > span:nth-child(1)").text().split("：", 2)[1];
	const finished_text = $("div.detail-list-form-title").clone().children().remove().end().text();
	let finished = false;
	let newOneDate = finished_text.split(",", 2)[1];
	if (newOneDate.includes("月") && newOneDate.includes("號")) {
		const month = Number.parseInt(newOneDate.split("月", 1)[0]);
		const date = Number.parseInt(newOneDate.split("月", 2)[1].split("號", 1)[0]);
		const year = (/* @__PURE__ */ new Date()).getFullYear();
		newOneDate = new Date(year, month - 1, date + 1);
	} else {
		newOneDate = new Date(newOneDate);
		newOneDate.setDate(newOneDate.getDate() + 1);
	}
	if (finished_text.includes("已完結") || finished_text.includes("已完结")) finished = true;
	const updatedOne = $("div.detail-list-form-title span.s a").attr("href");
	const items = list.toArray().map((item) => {
		item = $(item);
		const itemTitle = item.text();
		const itemUrl = item.attr("href");
		const itemDate = itemUrl === updatedOne ? parseDate(newOneDate) : "";
		return {
			title: itemTitle,
			link: host + itemUrl,
			auther: autherName,
			pubDate: itemDate,
			guid: host + itemUrl
		};
	});
	const name = $("body > div.detail-info-1 > div > div > p.detail-info-title").text();
	const description_ = finished ? "已完结" : "连载中";
	return {
		title: `x漫画  ${name}`,
		link: `https://xmanhua.com/${uid}`,
		description: description_,
		allowEmpty: true,
		item: items
	};
}
//#endregion
export { route };
