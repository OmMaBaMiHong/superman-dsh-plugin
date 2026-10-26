import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/sciencenet/user.ts
const route = {
	path: "/user/:id",
	categories: ["new-media"],
	example: "/sciencenet/user/tony8310",
	parameters: { id: "用户 id，可在对用户博客页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["blog.sciencenet.cn/u/:id", "blog.sciencenet.cn/"] }],
	name: "用户博客",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	const currentUrl = `https://blog.sciencenet.cn/u/${id}`;
	let response = await got_default({
		method: "get",
		url: currentUrl,
		responseType: "buffer"
	});
	let $ = load(iconv.decode(response.data, "gbk"));
	response = await got_default({
		method: "get",
		url: $(".xg1 a").eq(1).attr("href")
	});
	$ = load(response.data);
	let items = $("item").slice(-limit).toArray().toReversed().map((item) => {
		item = $(item);
		return {
			title: item.find("title").text(),
			link: item.find("guid").text()
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link,
			responseType: "buffer"
		});
		const content = load(iconv.decode(detailResponse.data, "gbk"));
		item.author = content(".xs2").text();
		item.description = content("#blog_article").html();
		item.pubDate = timezone(parseDate(content(".xg1").eq(5).text()), 8);
		return item;
	})));
	return {
		title: `科学网 - ${items[0].author}的博文`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
