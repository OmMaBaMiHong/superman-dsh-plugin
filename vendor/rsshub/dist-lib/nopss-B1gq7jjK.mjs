import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/nopss/index.ts
const route = {
	path: "/:path{.+}?",
	name: "通用",
	example: "/gov/nopss/GB/219469",
	parameters: { path: "路径，默认为通知公告" },
	radar: [{
		source: ["www.nopss.gov.cn/*path/index.html", "www.nopss.gov.cn/*path"],
		target: "/:path"
	}],
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip

路径处填写对应页面 URL 中 \`http://www.nopss.gov.cn/\` 后的字段。下面是一个例子。

若订阅 [年度项目、青年项目和西部项目](http://www.nopss.gov.cn/GB/219469/431027) 则将对应页面 URL <http://www.nopss.gov.cn/GB/219469/431027> 中 \`http://www.nopss.gov.cn/\` 后的字段 \`GB/219469/431027\` 作为路径填入。此时路由为 [\`/gov/nopss/GB/219469/431027\`](https://rsshub.app/gov/nopss/GB/219469/431027)

:::`
};
async function handler(ctx) {
	const { path = "GB/219469" } = ctx.req.param();
	const rootUrl = "http://www.nopss.gov.cn";
	const currentUrl = `${rootUrl}/${path}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".p2j_list_con .clearfix li a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 40).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href")}`,
			pubDate: timezone(parseDate(item.next().text(), "[YYYY-MM-DD HH:mm]"), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".text_con").html();
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
