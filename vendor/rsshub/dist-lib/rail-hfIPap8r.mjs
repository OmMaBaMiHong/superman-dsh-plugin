import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ally/rail.ts
const route = {
	path: "/rail/:category?/:topic?",
	categories: ["new-media"],
	example: "/ally/rail/hyzix/chengguijiaotong",
	parameters: {
		category: "分类，可在 URL 中找到；略去则抓取首页",
		topic: "话题，可在 URL 中找到；并非所有页面均有此字段"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["rail.ally.net.cn/", "rail.ally.net.cn/html/:category?/:topic?"] }],
	name: "世界轨道交通资讯网",
	maintainers: ["Rongronggg9"],
	handler,
	url: "rail.ally.net.cn/",
	description: `::: tip
默认抓取前 20 条，可通过 \`?limit=\` 改变。
:::`
};
async function handler(ctx) {
	const { category, topic } = ctx.req.param();
	const rootUrl = "http://rail.ally.net.cn";
	const pageUrl = category ? topic ? `${rootUrl}/html/${category}/${topic}/` : `${rootUrl}/html/${category}/` : rootUrl;
	const $ = load((await got_default.get(pageUrl)).data);
	let title = "";
	const titleLinks = $(".container .regsiter a").toArray().slice(1);
	for (const link of titleLinks) {
		const linkText = $(link).text();
		title = title ? `${title} - ${linkText}` : linkText;
	}
	title ||= (category && topic ? `${category} - ${topic}` : category) || "首页";
	let links = [
		$(".left .hynewsO h2 a").toArray(),
		$(".left .list_content_c").find(".new_hy_focus_con_tit a, .new_hy_list_name a").toArray(),
		$(".left").find(".nnewslistpic a, .nnewslistinfo dd a").toArray(),
		$(".left .list_con .datacountTit a").toArray(),
		$(".container_left").find("dd a, h1 a, ul.slideshow li a").toArray()
	].flat();
	if (!links.length) links = $(".left a, .container_left a").toArray();
	let items = links.map((link) => {
		link = $(link);
		const url = link.attr("href");
		const urlMatch = url && url.match(/\/html\/(\d{4})\/\w+_(\d{4})\/\d+\.html/);
		if (!urlMatch) return null;
		return {
			title: link.text(),
			link: url.startsWith("/") ? `${rootUrl}${url}` : url,
			pubDate: timezone(parseDate(`${urlMatch[1]}${urlMatch[2]}`), 8)
		};
	}).filter(Boolean);
	const uniqueItems = [];
	for (const item of items) if (uniqueItems.every((uniqueItem) => uniqueItem.link !== item?.link)) uniqueItems.push(item);
	items = uniqueItems.toSorted((a, b) => b.pubDate - a.pubDate).slice(0, ctx.req.query("limit") || 20);
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		let description = "";
		const content = $("div.content_all");
		if (content.length) content.eq(content.length - 1).contents().each((_, child) => {
			const $child = $(child);
			let innerHtml;
			if (child.name === "div") {
				innerHtml = $child.html();
				innerHtml &&= innerHtml.trim();
				description += !innerHtml || innerHtml === "&nbsp;" ? description ? "<br>" : "" : innerHtml;
			} else description += $child.toString().trim();
		});
		else description = $("div.content div").first().html();
		description = description.replace(/\s*<br ?\/?>\s*$/, "");
		const info = $(".content > em span");
		return {
			title: $(".content > h2").text() || item.title,
			description,
			pubDate: item.pubDate,
			author: info.eq(1).text().replace(/^来源：/, ""),
			link: item.link
		};
	})));
	return {
		title: `世界轨道交通资讯网 - ${title}`,
		link: pageUrl,
		item: items,
		description: $("head > meta[name=\"description\"]").attr("content")
	};
}
//#endregion
export { route };
