import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/miit/wjfb.ts
const rootUrl = "https://www.miit.gov.cn";
const route = {
	path: "/wjfb/:ministry",
	categories: ["government"],
	example: "/gov/miit/wjfb/ghs",
	parameters: { ministry: "部门缩写，可以在对应 URL 中获取" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["miit.gov.cn/jgsj/:ministry/wjfb/index.html"] }],
	name: "文件发布",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const ministry = ctx.req.param("ministry");
	const url = `${rootUrl}/jgsj/${ministry}/wjfb/index.html`;
	const cookieResponse = await got_default(url);
	const cookie = cookieResponse.headers["set-cookie"][0].split(";", 1)[0];
	const indexContent = load(cookieResponse.data);
	const title = indexContent("div.dqwz > a:nth-child(4)").text();
	const dataRequestUrl = indexContent("div.lmy_main_rb > script:nth-child(2)").toArray().map((item) => ({
		url: `${rootUrl}${indexContent(item).attr("url")}`,
		queryData: JSON.parse(indexContent(item).attr("querydata").replaceAll("\"", "|").replaceAll(/['|]/g, "\""))
	}))[0];
	const $ = load((await got_default({
		method: "get",
		url: `${dataRequestUrl.url}?${Object.entries(dataRequestUrl.queryData).map(([key, value]) => `${key}=${value}`).join("&")}`,
		headers: { Cookie: cookie }
	})).data.data.html);
	const list = $("ul > li").toArray().map((item) => ({
		title: $(item).find("a").text(),
		link: new URL($(item).find("a").attr("href"), rootUrl).href,
		pubDate: parseDate($(item).find("span").text(), "YYYY-MM-DD")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#con_con").html()?.replaceAll(/(<iframe.*?src=")([^"]*)(".*?>)/g, (_match, p1, p2, p3) => p1 + rootUrl + p2 + p3);
		return item;
	})));
	return {
		title: `工业和信息化部 - ${title} 文件发布`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
