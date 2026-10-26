import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bjsk/keti.ts
const route = {
	path: "/keti/:id?",
	categories: ["government"],
	example: "/bjsk/keti",
	parameters: { id: "分类 id，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["keti.bjsk.org.cn/indexAction!to_index.action", "keti.bjsk.org.cn/"],
		target: "/keti/:id"
	}],
	name: "基金项目管理平台",
	maintainers: ["nczitzk"],
	handler,
	url: "keti.bjsk.org.cn/indexAction!to_index.action",
	description: `| 通知公告                         | 资料下载                         |
| -------------------------------- | -------------------------------- |
| 402881027cbb8c6f017cbb8e17710002 | 2c908aee818e04f401818e08645c0002 |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "402881027cbb8c6f017cbb8e17710002";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100;
	const rootUrl = "https://keti.bjsk.org.cn";
	const currentUrl = `${rootUrl}/articleAction!to_moreList.action?entity.columnId=${id}&pagination.pageSize=${limit}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("a.news").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".zizizi").text(),
			link: `${rootUrl}${item.attr("href")}`,
			pubDate: parseDate(item.find(".date").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".d_text").html();
		item.author = content("div.d_information p span").last().text();
		return item;
	})));
	return {
		title: `北京社科基金项目管理平台 - ${$(".noticetop").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
