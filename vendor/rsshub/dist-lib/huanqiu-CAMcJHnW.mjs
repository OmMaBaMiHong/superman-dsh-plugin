import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { load } from "cheerio";
//#region lib/routes/huanqiu/index.ts
function getKeysRecursive(dic, key, attr, array) {
	for (const v of Object.values(dic)) if (v[key] === void 0) array.push(v[attr]);
	else getKeysRecursive(v[key], key, attr, array);
	return array;
}
const route = {
	path: "/news/:category?",
	categories: ["traditional-media"],
	example: "/huanqiu/news/china",
	parameters: { category: "类别，可以使用二级域名作为参数，默认为：china" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["huanqiu.com/"] }],
	name: "分类",
	maintainers: ["yuxinliu-alex"],
	handler,
	url: "huanqiu.com/",
	description: `| 国内新闻 | 国际新闻 | 军事 | 台海   | 评论    |
| -------- | -------- | ---- | ------ | ------- |
| china    | world    | mil  | taiwai | opinion |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "china";
	if (!isValidHost(category)) throw new InvalidParameterError("Invalid category");
	const host = `https://${category}.huanqiu.com`;
	const resp = await got_default({
		method: "get",
		url: `${host}/api/channel_pc`
	});
	const name = getKeysRecursive(resp.data.children, "children", "domain_name", [])[0];
	let items = (await got_default({
		method: "get",
		url: `${host}/api/list?node=${getKeysRecursive(resp.data.children, "children", "node", []).map((x) => `"${x}"`).join(",")}&offset=0&limit=${ctx.req.query("limit") ?? 20}`
	})).data.list.filter((item) => item.aid).map((item) => ({
		link: `${host}/article/${item.aid}`,
		title: item.title
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content("textarea.article-content").text();
		item.author = content("span", ".source").text();
		item.pubDate = parseDate(Number.parseInt(content("textarea.article-time").text()));
		item.category = content("meta[name=\"keywords\"]").attr("content").split(",");
		return item;
	})));
	return {
		title: `${name} - 环球网`,
		link: host,
		description: "环球网",
		language: "zh-cn",
		item: items
	};
}
//#endregion
export { route };
