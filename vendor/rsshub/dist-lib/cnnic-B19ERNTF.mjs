import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/cnnic/index.ts
const route = {
	path: "/:path{.+}?",
	name: "新闻中心",
	example: "/gov/cnnic/11/39",
	parameters: { path: "路径，默认为通知公告" },
	radar: [{
		source: ["www.cnnic.net.cn/*path"],
		target: "/:path"
	}],
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip

路径处填写对应页面 URL 中 \`https://www.cnnic.net.cn/\` 后的字段。下面是一个例子。

若订阅 [通知公告](https://www.cnnic.net.cn/11/39/index.html) 则将对应页面 URL <https://www.cnnic.net.cn/11/39/index.html> 中 \`https://www.cnnic.net.cn/\` 后的字段 \`11/39\` 作为路径填入。此时路由为 [\`/gov/cnnic/11/39\`](https://rsshub.app/gov/cnnic/11/39)

:::`
};
async function handler(ctx) {
	const { path = "11/39" } = ctx.req.param();
	const currentUrl = `https://www.cnnic.net.cn/${path.endsWith(".html") ? path : `${path.replace(/\/$/, "")}/index.html`}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".p_news-box li").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 12).toArray().map((item) => {
		item = $(item);
		const link = item.find("a");
		return {
			title: link.text(),
			link: new URL(link.attr("href"), currentUrl).href,
			pubDate: parseDate(item.contents().last().text().trim())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".content-text .inner-text").html();
		item.pubDate = timezone(parseDate(content(".from-date .time").text(), "YYYY年MM月DD日HH:mm"), 8);
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
