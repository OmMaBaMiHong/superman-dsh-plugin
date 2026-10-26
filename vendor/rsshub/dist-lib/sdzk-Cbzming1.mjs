import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sdzk/index.ts
const route = {
	path: "/:bcid?/:cid?",
	categories: ["study"],
	example: "/sdzk",
	parameters: {
		bcid: "板块 id，可在对应板块页 URL 中找到，默认为 `1`，即信息与政策",
		cid: "栏目 id，可在对应板块页 URL 中找到，默认为 `16`，即通知公告"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻",
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip
若订阅 [信息与政策](https://www.sdzk.cn/NewsList.aspx?BCID=1)，网址为 \`https://www.sdzk.cn/NewsList.aspx?BCID=1\`。截取 \`BCID=1\` 作为参数，此时路由为 [\`/sdzk/1\`](https://rsshub.app/sdzk/1)。

若订阅 [通知公告](https://www.sdzk.cn/NewsList.aspx?BCID=1\\&CID=16)，网址为 \`https://www.sdzk.cn/NewsList.aspx?BCID=1&CID=16\`。截取 \`BCID=1\` 与 \`CID=16\` 作为参数，此时路由为 [\`/sdzk/1/16\`](https://rsshub.app/sdzk/1/16)。
:::`
};
async function handler(ctx) {
	const bcid = ctx.req.param("bcid") ?? "1";
	const cid = ctx.req.param("cid") ?? "16";
	const rootUrl = "https://www.sdzk.cn";
	const currentUrl = `${rootUrl}/NewsList.aspx?BCID=${bcid}${cid ? `&CID=${cid}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("a[title]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.attr("href"), rootUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const info = content("div.laylist-r em").text();
		item.description = content(".txt").html();
		item.pubDate = parseDate(info.split("发布时间：").pop());
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
