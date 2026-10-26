import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/yilinzazhi/index.ts
const route = {
	path: "/",
	categories: ["reading"],
	view: 0,
	example: "/yilinzazhi",
	radar: [{
		source: ["www.yilinzazhi.com"],
		target: "/"
	}],
	name: "文章列表",
	maintainers: ["g0ngjie"],
	handler,
	url: "www.yilinzazhi.com"
};
async function handler() {
	const baseUrl = "https://www.yilinzazhi.com/";
	const $ = load((await got_default(baseUrl)).data);
	const contents = $("section.content").find("li").toArray().map((target) => {
		const aTag = $(target).find("a");
		return {
			title: aTag.text(),
			link: baseUrl + aTag.attr("href"),
			description: ""
		};
	});
	return {
		title: "意林杂志网",
		link: baseUrl,
		item: await Promise.all(contents.map((content) => cache_default.tryGet(content.link, async () => {
			content.description = load((await got_default(content.link)).data)(".maglistbox").html();
			return content;
		})))
	};
}
//#endregion
export { route };
