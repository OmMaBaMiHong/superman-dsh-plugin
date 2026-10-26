import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zju/physics/index.ts
const host = "http://physics.zju.edu.cn";
const map = /* @__PURE__ */ new Map([
	[1, {
		title: "浙大物理学院 -- 本院动态",
		id: "39060"
	}],
	[2, {
		title: "浙大物理学院 -- 科研进展",
		id: "39070"
	}],
	[3, {
		title: "浙大物理学院 -- 研究生教育最新消息",
		id: "39079"
	}]
]);
const route = {
	path: "/physics/:type",
	categories: ["university"],
	example: "/zju/physics/1",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "物理学院",
	maintainers: ["Caicailiushui"],
	handler,
	description: `| 本院动态 | 科研进展 | 研究生教育最新消息 |
| -------- | -------- | ------------------ |
| 1        | 2        | 3                  |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	const id = map.get(type).id;
	const $ = load((await got_default({
		method: "get",
		url: `${host}/${id}/list.htm`
	})).data);
	const items = $("#arthd li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			pubDate: parseDate(item.find(".art-date").text()),
			link: `http://physics.zju.edu.cn/${item.find("a").attr("href")}`
		};
	});
	return {
		title: map.get(type).title,
		link: `${host}${id}`,
		item: items
	};
}
//#endregion
export { route };
