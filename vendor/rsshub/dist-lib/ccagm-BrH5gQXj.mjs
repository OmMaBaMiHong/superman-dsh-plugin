import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ccagm/index.ts
const handler = async (ctx) => {
	const { category = "association-news" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "10");
	const targetUrl = new URL(category, "http://www.ccagm.org.cn").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("ul.news_list li a").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.attr("title") ?? $el.find("span.fl").text();
		const pubDateStr = $el.find("span.fr").text();
		const linkUrl = $el.attr("href");
		const upDatedStr = pubDateStr;
		return {
			title,
			pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : void 0,
			link: linkUrl,
			updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h2.center").text();
			const description = $$("div.newsview").html() ?? void 0;
			const pubDateStr = $$("p.title_s").text().trim().split(/：/).pop();
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	return {
		title: `${$("title").text()}${$("span.titlespan").text() ? ` - ${$("span.titlespan").text()}` : ""}`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.logo img").attr("src"),
		author: $("meta[name=\"keywords\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category{.+}?",
	name: "栏目",
	url: "www.ccagm.org.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/ccagm/association-news",
	parameters: { category: {
		description: "分类，默认为 `association-news`，即协会动态，可在对应分类页 URL 中找到",
		options: [
			{
				label: "协会动态",
				value: "association-news"
			},
			{
				label: "会议活动",
				value: "xh-activity/activities-huiyi"
			},
			{
				label: "调研与报告",
				value: "xh-activity/bg-yj"
			},
			{
				label: "协会党建",
				value: "xie-hui-dang-jian"
			},
			{
				label: "行业新闻",
				value: "members-info"
			},
			{
				label: "行业研究",
				value: "bg-yj"
			},
			{
				label: "行业标准",
				value: "industry-policy/industry-standard"
			},
			{
				label: "法律法规",
				value: "industry-policy/policies-regulations"
			},
			{
				label: "资料下载",
				value: "download"
			},
			{
				label: "工作总结与计划",
				value: "about-association/gong-zuo-zong-jie-yu-ji-hua"
			}
		]
	} },
	description: `::: tip
订阅 [协会动态](http://www.ccagm.org.cn/association-news)，其源网址为 \`http://www.ccagm.org.cn/association-news\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/ccagm/association-news\`](https://rsshub.app/ccagm/association-news)。
:::

<details>
  <summary>更多分类</summary>

| 栏目                                                                                         | ID                                                                                                                      |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [协会动态](http://www.ccagm.org.cn/association-news.html)                                    | [association-news](https://rsshub.app/ccagm/association-news)                                                           |
| [会议活动](http://www.ccagm.org.cn/xh-activity/activities-huiyi.html)                        | [xh-activity/activities-huiyi](https://rsshub.app/ccagm/xh-activity/activities-huiyi)                                   |
| [调研与报告](http://www.ccagm.org.cn/xh-activity/bg-yj.html)                                 | [xh-activity/bg-yj](https://rsshub.app/ccagm/xh-activity/bg-yj)                                                         |
| [协会党建](http://www.ccagm.org.cn/xie-hui-dang-jian.html)                                   | [xie-hui-dang-jian](https://rsshub.app/ccagm/xie-hui-dang-jian)                                                         |
| [行业新闻](http://www.ccagm.org.cn/members-info.html)                                        | [members-info](https://rsshub.app/ccagm/members-info)                                                                   |
| [行业研究](http://www.ccagm.org.cn/bg-yj.html)                                               | [bg-yj](https://rsshub.app/ccagm/bg-yj)                                                                                 |
| [行业标准](http://www.ccagm.org.cn/industry-policy/industry-standard.html)                   | [industry-policy/industry-standard](https://rsshub.app/ccagm/industry-policy/industry-standard)                         |
| [法律法规](http://www.ccagm.org.cn/industry-policy/policies-regulations.html)                | [industry-policy/policies-regulations](https://rsshub.app/ccagm/industry-policy/policies-regulations)                   |
| [资料下载](http://www.ccagm.org.cn/download.html)                                            | [download](https://rsshub.app/ccagm/download)                                                                           |
| [工作总结与计划](http://www.ccagm.org.cn/about-association/gong-zuo-zong-jie-yu-ji-hua.html) | [about-association/gong-zuo-zong-jie-yu-ji-hua](https://rsshub.app/ccagm/about-association/gong-zuo-zong-jie-yu-ji-hua) |

</details>`,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["www.ccagm.org.cn/category?"],
			target: "/:category"
		},
		{
			title: "协会动态",
			source: ["www.ccagm.org.cn/association-news.html"],
			target: "/association-news"
		},
		{
			title: "会议活动",
			source: ["www.ccagm.org.cn/xh-activity/activities-huiyi.html"],
			target: "/xh-activity/activities-huiyi"
		},
		{
			title: "调研与报告",
			source: ["www.ccagm.org.cn/xh-activity/bg-yj.html"],
			target: "/xh-activity/bg-yj"
		},
		{
			title: "协会党建",
			source: ["www.ccagm.org.cn/xie-hui-dang-jian.html"],
			target: "/xie-hui-dang-jian"
		},
		{
			title: "行业新闻",
			source: ["www.ccagm.org.cn/members-info.html"],
			target: "/members-info"
		},
		{
			title: "行业研究",
			source: ["www.ccagm.org.cn/bg-yj.html"],
			target: "/bg-yj"
		},
		{
			title: "行业标准",
			source: ["www.ccagm.org.cn/industry-policy/industry-standard.html"],
			target: "/industry-policy/industry-standard"
		},
		{
			title: "法律法规",
			source: ["www.ccagm.org.cn/industry-policy/policies-regulations.html"],
			target: "/industry-policy/policies-regulations"
		},
		{
			title: "资料下载",
			source: ["www.ccagm.org.cn/download.html"],
			target: "/download"
		},
		{
			title: "工作总结与计划",
			source: ["www.ccagm.org.cn/about-association/gong-zuo-zong-jie-yu-ji-hua.html"],
			target: "/about-association/gong-zuo-zong-jie-yu-ji-hua"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
