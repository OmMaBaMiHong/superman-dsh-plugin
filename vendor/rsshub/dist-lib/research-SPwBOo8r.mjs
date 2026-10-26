import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/lhratings/research.ts
const handler = async (ctx) => {
	const { type = "1" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "20");
	const targetUrl = new URL(`research.html?type=${type}`, "https://www.lhratings.com").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	const items = $("table.list-table tbody tr").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a").first();
		const title = $aEl.text();
		const pubDateStr = $aEl.parent().next().next().text();
		const linkUrl = $aEl.attr("href");
		const categoryEls = [$aEl.parent().next()].filter(Boolean);
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const image = $el.find("img").attr("src");
		const upDatedStr = pubDateStr;
		let processedItem = {
			title,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			category: categories,
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
		const enclosureUrl = linkUrl;
		if (enclosureUrl) processedItem = {
			...processedItem,
			enclosure_url: enclosureUrl,
			enclosure_type: `application/${enclosureUrl.split(/\./).pop()}`,
			enclosure_title: title
		};
		return processedItem;
	});
	const author = $("title").text();
	return {
		title: `${author} - ${$("li.active").text()}`,
		description: $("li.active").text(),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a#logo img").attr("src"),
		author,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/research/:type?",
	name: "研究报告",
	url: "www.lhratings.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/lhratings/research/1",
	parameters: { type: "分类，默认为 `1`，即宏观经济，可在对应分类页 URL 中找到" },
	description: `::: tip
若订阅 [宏观经济](https://www.lhratings.com/research.html?type=1)，网址为 \`https://www.lhratings.com/research.html?type=1\`，请截取 \`https://www.lhratings.com/research.html?type=\` 到末尾的部分 \`1\` 作为 \`type\` 参数填入，此时目标路由为 [\`/lhratings/research/1\`](https://rsshub.app/lhratings/research/1)。
:::

| 宏观经济 | 债券市场 | 行业研究 | 评级理论与方法 | 国际债券市场与评级 | 评级表现 |
| -------- | -------- | -------- | -------------- | ------------------ | -------- |
| 1        | 2        | 3        | 4              | 5                  | 6        |`,
	categories: ["finance"],
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
			source: ["www.lhratings.com/research.html"],
			target: (_, url) => {
				const type = new URL(url).searchParams.get("type") ?? void 0;
				return `/lhratings/research/${type ? `/${type}` : ""}`;
			}
		},
		{
			title: "宏观经济",
			source: ["www.lhratings.com/research.html?type=1"],
			target: "/research/1"
		},
		{
			title: "债券市场",
			source: ["www.lhratings.com/research.html?type=2"],
			target: "/research/2"
		},
		{
			title: "行业研究",
			source: ["www.lhratings.com/research.html?type=3"],
			target: "/research/3"
		},
		{
			title: "评级理论与方法",
			source: ["www.lhratings.com/research.html?type=4"],
			target: "/research/4"
		},
		{
			title: "国际债券市场与评级",
			source: ["www.lhratings.com/research.html?type=5"],
			target: "/research/5"
		},
		{
			title: "评级表现",
			source: ["www.lhratings.com/research.html?type=6"],
			target: "/research/6"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
