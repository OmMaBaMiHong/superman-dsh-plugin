import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/udn/breaking-news.tsx
const route = {
	path: "/news/breakingnews/:id",
	categories: ["traditional-media"],
	example: "/udn/news/breakingnews/99",
	parameters: { id: "类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["udn.com/news/breaknews/1/:id", "udn.com/"] }],
	name: "即時新聞",
	maintainers: ["miles170", "pseudoyu"],
	handler,
	description: `| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 11   | 12   | 13   | 99     |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |
| 精選 | 要聞 | 社會 | 地方 | 兩岸 | 國際 | 財經 | 運動 | 娛樂 | 生活 | 股市 | 文教 | 數位 | 不分類 |`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = `/news/breaknews/1/${id}#breaknews`;
	const name = await getLinkName(link);
	const rootUrl = "https://udn.com";
	const response = await got_default(`${rootUrl}/api/more?page=1&channelId=1&cate_id=${id}&type=breaknews`);
	const items = await Promise.all(response.data.lists.map((item) => {
		let link = item.titleLink.startsWith("http") ? item.titleLink : `${rootUrl}${item.titleLink}`;
		const linkUrl = new URL(link);
		linkUrl.query = linkUrl.search = "";
		link = linkUrl.href;
		return cache_default.tryGet(link, async () => {
			let result = await got_default(link);
			const vip = result.data.match(/<script language=javascript>window\.location\.href="(https?:\/\/[^"]+)"/);
			if (vip) result = await got_default(vip[1]);
			const $ = load(result.data);
			const metadata = $("script[type=\"application/ld+json\"]").eq(0).text().trim().replaceAll(/[\t\n]/g, "");
			const data = metadata.startsWith("[") ? JSON.parse(metadata)[0] : JSON.parse(metadata);
			const content = $(".article-content__editor");
			const body = $(".article-body__editor");
			let description = "";
			if (data.image) description += renderToString(/* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("picture", { children: /* @__PURE__ */ jsx("img", {
				src: data.image.contentUrl,
				alt: data.image.name
			}) }), /* @__PURE__ */ jsx("figurecaption", { children: data.image.name })] }));
			if (content.length) description += content.html();
			else if (body.length) description += body.html();
			if (data.publisher.name.includes("轉角國際 udn Global")) description = $(".story_body_content").html().split(/<!--\d+-->/g).slice(1, -1).join("");
			return {
				title: item.title,
				author: [
					{ name: $(".article-content__author").text().match("中央社")?.at(0) },
					{ name: data.publisher.name.match("轉角國際 udn Global")?.at(0) },
					data.author
				].filter((e) => e.name),
				description,
				pubDate: timezone(parseDate(item.time.date, "YYYY-MM-DD HH:mm"), 8),
				category: [
					data.articleSection,
					vip ? $(".article-head li.breadcrumb__item:last > b").text() : $("meta[name='subsection']").attr("content"),
					...data.keywords.split(",")
				],
				link
			};
		});
	}));
	return {
		title: `即時${name} - 聯合新聞網`,
		link: `${rootUrl}${link}`,
		description: "udn.com 提供即時新聞以及豐富的政治、社會、地方、兩岸、國際、財經、數位、運動、NBA、娛樂、生活、健康、旅遊新聞，以最即時、多元的內容，滿足行動世代的需求",
		item: items
	};
}
const getLinkName = async (link) => {
	const url = "https://udn.com/news/breaknews";
	const links = await cache_default.tryGet(url, async () => {
		const $ = load((await got_default(url)).data);
		const data = $(".cate-list__subheader a").toArray().map((item) => {
			item = $(item);
			return [item.attr("href"), item.text().trim()];
		});
		return Object.fromEntries(data);
	});
	if (Object.hasOwn(links, link)) return links[link];
	return "列表";
};
//#endregion
export { route };
