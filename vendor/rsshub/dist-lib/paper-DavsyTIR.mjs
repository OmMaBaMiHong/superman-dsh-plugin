import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/zjol/paper.ts
const route = {
	path: "/paper/:id?",
	categories: ["traditional-media"],
	example: "/zjol/paper/zjrb",
	parameters: { id: "报纸 id，见下表，默认为 `zjrb`，即浙江日报" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "浙报集团系列报刊",
	maintainers: ["nczitzk"],
	handler,
	description: `| 浙江日报 | 钱江晚报 | 美术报 | 浙江老年报 | 浙江法制报 | 江南游报 |
| -------- | -------- | ------ | ---------- | ---------- | -------- |
| zjrb     | qjwb     | msb    | zjlnb      | zjfzb      | jnyb     |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "zjrb";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100;
	if (![
		"zjrb",
		"qjwb",
		"msb",
		"zjlnb",
		"zjfzb",
		"jnyb"
	].includes(id)) throw new InvalidParameterError("id not allowed");
	const query = id === "jnyb" ? "map[name=\"PagePicMap\"] area" : "ul.main-ed-articlenav-list li a";
	const rootUrl = id === "qjwb" ? "http://qjwb.thehour.cn" : `https://${id}.zjol.com.cn`;
	let currentUrl = `${rootUrl}/paperindex.htm`;
	let response = await got_default({
		method: "get",
		url: currentUrl
	});
	const url = response.data.match(/URL=(.*)"/)[1];
	const pubDate = parseDate(url.match(/(\d{4}-\d{2}\/\d{2})/)[1], "YYYY-MM/DD");
	currentUrl = `${rootUrl}/${url.replace(`/${url.split("/").pop()}`, "")}`;
	response = await got_default({
		method: "get",
		url: `${rootUrl}/${url}`
	});
	const $ = load(response.data);
	let items = $(query).toArray().map((a) => `${currentUrl}/${$(a).attr("href")}`);
	await Promise.all($("#pageLink").slice(1).toArray().map((p) => `${currentUrl}/${$(p).attr("href")}`).map(async (p) => {
		const page = load((await got_default({
			method: "get",
			url: p
		})).data);
		items.push(...page(query).toArray().map((a) => `${currentUrl}/${page(a).attr("href")}`));
	}));
	items = await Promise.all(items.filter((a) => id === "jnyb" ? a.endsWith("?div=1") : true).slice(0, limit).map((link) => cache_default.tryGet(link, async () => {
		const content = load((await got_default({
			method: "get",
			url: link
		})).data);
		const title = content(".main-article-title").text();
		content(".main-article-alltitle").remove();
		return {
			title,
			pubDate,
			link: link.split("?", 1)[0],
			description: content(".main-article-content").html()
		};
	})));
	return {
		title: $("title").text(),
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
