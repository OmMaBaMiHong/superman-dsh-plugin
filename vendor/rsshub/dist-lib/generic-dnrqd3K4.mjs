import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/sasac/generic.ts
const route = {
	path: "/:path{.+}",
	name: "通用",
	example: "/gov/sasac/n2588030/n16436141",
	parameters: { path: "路径，可在 URL 找到" },
	radar: [{
		source: ["www.sasac.gov.cn/*path/index.html", "www.sasac.gov.cn/*path"],
		target: "/:path"
	}],
	maintainers: ["TonyRL"],
	handler,
	description: `::: tip

路径处填写对应页面 URL 中 \`http://www.sasac.gov.cn/\` 与 \`/index.html\` 之间的字段，下面是一个例子。

若订阅 [其他](http://www.sasac.gov.cn/n2588030/n16436141/index.html) 则将对应页面 URL <http://www.sasac.gov.cn/n2588030/n16436141/index.html> 中 \`http://www.sasac.gov.cn/\` 和 \`/index.html\` 之间的字段 \`n2588030/n16436141\` 作为路径填入。此时路由为 [\`/gov/sasac/n2588030/n16436141\`](https://rsshub.app/gov/sasac/n2588030/n16436141)

:::`
};
async function handler(ctx) {
	const url = `http://www.sasac.gov.cn/${ctx.req.param("path")}/index.html`;
	const $ = load((await got_default(url)).data);
	const list = $(".zsy_conlist li").toArray().filter((item) => !$(item).attr("style")).map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), url).href,
			pubDate: parseDate(item.find("span").text().replace("[", "").replace("]", ""))
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		$("style, #qr_container, #div_div, [class^=jiathis]").remove();
		item.description = $(".zsy_comain").html();
		return item;
	})));
	return {
		title: $("head title").text().trim(),
		link: url,
		image: "http://www.sasac.gov.cn/dbsource/11869722/11869731.jpg",
		item: items
	};
}
//#endregion
export { route };
