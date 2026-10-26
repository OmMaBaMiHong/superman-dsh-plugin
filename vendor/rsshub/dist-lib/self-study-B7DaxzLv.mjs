import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/shmeea/self-study.ts
function load_detail(list, cache) {
	return Promise.all(list.map((item) => {
		const notice_item = load(item);
		const href = notice_item("a").attr("href");
		const url = "http://www.shmeea.edu.cn" + href;
		if (href[0] !== "/") return {
			title: notice_item("a").attr("title"),
			description: `<a href="${href}" >附件</a>`,
			link: href
		};
		return cache.tryGet(url, async () => {
			const detail = load((await got_default({
				method: "get",
				url,
				headers: {
					Referer: "http://www.shmeea.edu.cn/page/04000/index.html",
					Host: "www.shmeea.edu.cn"
				}
			})).data);
			return {
				title: notice_item("a").attr("title"),
				description: detail(".Article_content").html(),
				link: url,
				pubDate: timezone(parseDate(detail(".PBtime").text(), "YYYY-MM-DD HH:mm:ss"), 8)
			};
		});
	}));
}
const route = {
	path: "/self-study",
	categories: ["study"],
	example: "/shmeea/self-study",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.shmeea.edu.cn/page/04000/index.html", "www.shmeea.edu.cn/"] }],
	name: "自学考试通知公告",
	maintainers: ["h2ws"],
	handler,
	url: "www.shmeea.edu.cn/page/04000/index.html"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "http://www.shmeea.edu.cn/page/04000/index.html",
		headers: { Host: "www.shmeea.edu.cn" }
	})).data;
	return {
		title: "上海自学考试 - 通知公告",
		link: "http://www.shmeea.edu.cn/page/04000/index.html",
		item: await load_detail(load(data)("#main > div.container > div > div.span9 > div.page-he  > div  > ul > li").toArray(), cache_default)
	};
}
//#endregion
export { route };
