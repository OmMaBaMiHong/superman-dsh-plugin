import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/szu/yz/utils.ts
const ProcessFeed = (list, cache, current) => Promise.all(list.filter((item) => {
	return load(item, null, false)("a").length;
}).map((item) => {
	let $ = load(item, null, false);
	const $url = new URL($("a").attr("href"), current.url).href;
	return cache.tryGet($url, async () => {
		const data = (await got_default($url)).data;
		$ = load(data);
		$(`${current.selector.content} img`).each((index, elem) => {
			const $elem = $(elem);
			const src = $elem.attr("src");
			if (src) $elem.attr("src", new URL(src, current.url).href);
		});
		$(`${current.selector.content} a, ul[style]`).each((index, elem) => {
			const $elem = $(elem);
			const src = $elem.attr("href");
			if (src) $elem.attr("href", new URL(src, current.url).href);
		});
		$("img, div, span, p, table, td, tr, a").removeAttr("style");
		$("style, script").remove();
		return {
			title: $("h2").text(),
			description: $(current.selector.content).html() + ($("ul[style]").length ? $("ul[style]").html() : ""),
			link: $url,
			pubDate: timezone(parseDate($("div.ny_fbt").text().match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[0], "YYYY-MM-DD HH:mm"), 8),
			author: "深圳大学研究生招生网"
		};
	});
}));
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/szu/yz/index.ts
const map = /* @__PURE__ */ new Map([[1, { title: "硕士招生 - 深圳大学研究生招生网" }], [2, { title: "博士招生 - 深圳大学研究生招生网" }]]);
const route = {
	path: "/yz/:type?",
	categories: ["university"],
	example: "/szu/yz/1",
	parameters: { type: "默认为 `1`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生招生网",
	maintainers: ["NagaruZ"],
	handler,
	description: `| 研究生 | 博士生 |
| ------ | ------ |
| 1      | 2      |`
};
async function handler(ctx) {
	let type = Number.parseInt(ctx.req.param("type"));
	const struct = {
		1: {
			selector: {
				list: ".list",
				item: "li",
				content: "#vsb_content"
			},
			url: "https://yz.szu.edu.cn/sszs/gg.htm"
		},
		2: {
			selector: {
				list: ".list",
				item: "li",
				content: "#vsb_content, #vsb_content_2"
			},
			url: "https://yz.szu.edu.cn/bszs/gg.htm"
		}
	};
	if (type !== 1 && type !== 2) type = 1;
	const url = struct[type].url;
	const data = (await got_default(url)).data;
	const $ = load(data);
	const list = $(struct[type].selector.list).find(struct[type].selector.item).toArray();
	const name = $("title").text();
	const result = await utils_default.ProcessFeed(list, cache_default, struct[type]);
	return {
		title: map.get(type).title,
		link: url,
		description: name,
		item: result
	};
}
//#endregion
export { route };
