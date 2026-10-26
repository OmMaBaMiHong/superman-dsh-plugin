import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/learnku/topic.tsx
const route = {
	path: "/:community/:category?",
	categories: ["bbs"],
	example: "/learnku/laravel/qa",
	parameters: {
		community: "社区 标识，可在 <https://learnku.com/communities> 找到",
		category: "分类，如果不传 `category` 则获取全部分类"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["learnku.com/:community"],
		target: "/:community"
	}],
	name: "社区",
	maintainers: ["kayw-geek"],
	handler,
	description: `| 招聘 | 翻译         | 问答 | 链接  |
| ---- | ------------ | ---- | ----- |
| jobs | translations | qa   | links |`
};
async function handler(ctx) {
	const community = ctx.req.param("community");
	const category = ctx.req.param("category") || "";
	let url = `https://learnku.com/${community}`;
	if (category !== "") url = `https://learnku.com/${community}/c/${category}`;
	const data = (await got_default({
		method: "get",
		url
	})).data;
	const $ = load(data);
	const list = $(".simple-topic").toArray();
	const item = await Promise.all(list.map(async (item) => {
		const $ = load(item);
		const categoryName = $(".category-name span").text().trim();
		if (["置顶", "广告"].includes(categoryName)) return "";
		$(".topic-title i").remove();
		const itemLink = $(".topic-title-wrap").attr("href");
		const title = $(".topic-title").text().trim();
		const content = await cache_default.tryGet(itemLink, async () => {
			return load((await got_default.get(itemLink)).data);
		});
		const article = content(".article-content .content-body").html();
		const comment = content("#all-comments").html();
		return {
			title,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
				style: "background-color:#f0f2f5;border: 2px solid #e3eaef;box-shadow: 0 1px 2px 0 rgb(101 129 156 / 8%);font-size: 1rem;position: relative;background: #fff;box-shadow: 0px 2px 4px rgba(0,0,0,0.1);margin: 1rem 0;padding: 24px;transition: box-shadow 0.15s ease;border-radius: 8px;",
				children: [
					/* @__PURE__ */ jsx("h2", { children: "🦕正文" }),
					/* @__PURE__ */ jsx("hr", {
						style: "FILTER: alpha(opacity=100,finishopacity=0,style=3)",
						width: "100%",
						color: "#79ffe1",
						size: "3"
					}),
					/* @__PURE__ */ jsx("div", {
						style: "font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif",
						children: article ? raw(article) : null
					})
				]
			}), comment ? /* @__PURE__ */ jsxs("div", {
				style: "background-color:#f0f2f5;border: 2px solid #e3eaef;box-shadow: 0 1px 2px 0 rgb(101 129 156 / 8%);font-size: 1rem;position: relative;background: #fff;box-shadow: 0px 2px 4px rgba(0,0,0,0.1);margin: 1rem 0;padding: 24px;transition: box-shadow 0.15s ease;border-radius: 8px;",
				children: [
					/* @__PURE__ */ jsx("h2", { children: "👨‍💻评论" }),
					/* @__PURE__ */ jsx("hr", {
						style: "FILTER: alpha(opacity=100,finishopacity=0,style=3)",
						width: "100%",
						color: "#79ffe1",
						size: "3"
					}),
					raw(comment)
				]
			}) : null] })),
			category: categoryName,
			link: itemLink,
			pubDate: parseDate($(".timeago").attr("title"), "YYYY/MM/DD")
		};
	}));
	const title = $(".sidebar .community-details .header span").text();
	$(".sidebar .community-details .main div div a").remove();
	const description = $(".sidebar .community-details .main div div").text();
	return {
		title: `LearnKu - ${title} - ${(/* @__PURE__ */ new Map([
			["translations", { name: "翻译" }],
			["jobs", { name: "招聘" }],
			["qa", { name: "问答" }],
			["links", { name: "链接" }],
			["", { name: "最新" }]
		])).get(category).name}`,
		link: url,
		description,
		item: item.filter((item) => item !== "")
	};
}
//#endregion
export { route };
