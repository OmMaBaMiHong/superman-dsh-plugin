import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/sh/yjj/index.ts
const route = {
	path: "/yjj/:path{.+}?",
	name: "药品监督管理局",
	example: "/gov/sh/yjj/zh",
	parameters: { path: "路径参数" },
	radar: [{
		source: ["yjj.sh.gov.cn/*path/index.html", "yjj.sh.gov.cn/*path"],
		target: "/yjj/:path"
	}],
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip

路径处填写对应页面 URL 中 \`https://yjj.sh.gov.cn/\` 与 \`/index.html\` 之间的字段，下面是一个例子。

若订阅 [最新信息公开 > 综合](https://yjj.sh.gov.cn/zh/index.html) 则将对应页面 URL <https://yjj.sh.gov.cn/zh/index.html> 中 \`https://yjj.sh.gov.cn/\` 和 \`/index.html\` 之间的字段 \`zh\` 作为路径填入。此时路由为 [\`/gov/sh/yjj/zh\`](https://rsshub.app/gov/sh/yjj/zh)

:::`
};
async function handler(ctx) {
	const { path = "zx-ylqx" } = ctx.req.param();
	const rootUrl = "https://yjj.sh.gov.cn";
	const currentUrl = `${rootUrl}/${path}/index.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".pageList li a").toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.text(),
			pubDate: parseDate(item.next().text()),
			link: link.startsWith("http") ? link : `${rootUrl}${link}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			const pubDate = content("meta[name=\"pubdate\"]").attr("content") || content("meta[name=\"PubDate\"]").attr("content");
			item.description = content("#ivs_content").html();
			item.pubDate = timezone(parseDate(pubDate, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"]), 8);
		} catch {}
		return item;
	})));
	return {
		title: $("title").text().replace(/--/, " - "),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
