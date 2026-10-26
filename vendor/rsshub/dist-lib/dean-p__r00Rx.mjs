import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/dean.ts
const parseContent = (htmlString) => {
	const $ = load(htmlString);
	const info = $(".detail_main_content > h1").contents().filter((_, element) => element.nodeType === 3).toArray().map((element) => $(element).text().trim());
	const content = $("[id^=\"vsb_content\"]");
	$("form > div > ul a").each((_, el) => {
		$(el).appendTo(content);
		$("<br>").appendTo(content);
	});
	return {
		author: info[0] || "教务处",
		description: content.html()
	};
};
const route = {
	path: "/dean/:subpath{.+}",
	name: "教务处",
	maintainers: ["hoilc"],
	example: "/xjtu/dean/jxxx/jxtz2",
	description: "打开一个类似 <https://dean.xjtu.edu.cn/jxxx/jxtz2.htm> 的网址，在 `.cn` 后的内容就是 subpath，此例中是 `jxxx/jxtz2`",
	handler
};
async function handler(ctx) {
	const url = `http://dean.xjtu.edu.cn/${ctx.req.param("subpath").replaceAll(".htm", "")}.htm`;
	const base = url.split("/").slice(0, -1).join("/");
	const $ = load(await rofetch(url));
	const subName = $("#ny-main > div.ny-tit > div > span").toArray().map((item) => $(item).text()).join(" - ");
	const list = $("#ny-main > div.ny.wp > ul > li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").text(),
			link: new URL(item.find("a").attr("href"), base).href,
			pubDate: timezone(parseDate(item.find("span").text(), "YYYY-MM-DD"), 8)
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const response = await rofetch(item.link);
			const result = parseContent(response);
			item.description = result.description ?? void 0;
			item.author = result.author;
		} catch {
			return item;
		}
		return item;
	})));
	return {
		title: `西安交大教务处 - ${subName}`,
		link: url,
		item: out.filter((item) => item !== "")
	};
}
//#endregion
export { route };
