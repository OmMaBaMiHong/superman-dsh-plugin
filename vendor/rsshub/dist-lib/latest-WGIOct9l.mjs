import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/douban/commercialpress/latest.ts
const route = {
	path: "/commercialpress/latest",
	categories: ["social-media"],
	example: "/douban/commercialpress/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "商务印书馆新书速递",
	maintainers: ["xyqfer"],
	handler
};
async function handler() {
	const link = "https://site.douban.com/commercialpress/room/827243/";
	const { data: roomResponse } = await got_default({
		method: "get",
		url: link,
		headers: { Referer: "https://site.douban.com/commercialpress/" }
	});
	let $ = load(roomResponse);
	const $mod = $(".mod").eq(0);
	const title = $mod.find(".hd > h2 span").eq(0).text();
	$ = load((await got_default({
		method: "get",
		url: `${(await got_default({
			method: "get",
			url: $mod.find(".pl a").attr("href"),
			headers: { Referer: link }
		})).request.options.url.href}?sort=time&sub_type=`,
		headers: { Referer: link }
	})).data);
	const resultItem = $(".doulist-item").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find(".title > a").text(),
			link: $item.find(".title > a").attr("href"),
			description: `<img src="${$item.find(".post img").attr("src")}" /><br>${$item.find(".abstract").html()}`,
			pubDate: new Date($item.find(".time > span").attr("title")).toUTCString()
		};
	});
	return {
		title: `商务印书馆-${title}`,
		link,
		item: resultItem
	};
}
//#endregion
export { route };
