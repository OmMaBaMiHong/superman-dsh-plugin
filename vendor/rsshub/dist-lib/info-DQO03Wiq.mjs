import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/10000link/templates/description.tsx
const Description = ({ intro, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/10000link/info.ts
const handler = async (ctx) => {
	const { category = "newslists", id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://info.10000link.com";
	const targetUrl = new URL(`${category}.aspx${id ? `?chid=${id}` : ""}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("ul.l_newshot li dl.lhotnew2").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("dd h1 a");
		const title = $aEl.attr("title") ?? $aEl.text();
		const description = renderDescription({ intro: $el.find("dd.title_l").text() });
		const pubDateStr = $el.find("span.ymd_w").text();
		const linkUrl = $aEl.attr("href");
		const categoryEls = $el.find("dd.day-lx span a").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const authors = $el.find("dd.day-lx span").first().text();
		const image = $el.find("dt.img220 a img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseRelativeDate(pubDateStr) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseRelativeDate(upDatedStr) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailResponse = await rofetch(item.link);
			const $$ = load(detailResponse);
			const title = $$("div.entity_title h1 a").text();
			const image = $$("div.entity_thumb img.img-responsive").attr("src");
			const description = renderDescription({ description: $$("div.entity_content").html() });
			const pubDateStr = detailResponse.match(/var\stime\s=\s"(.*?)";/)?.[1];
			const categoryEls = $$("div.entity_tag span a").toArray();
			const categories = [...new Set([...categoryEls.map((el) => $$(el).text()), ...item.category ?? []].filter(Boolean))];
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? parseDate(pubDateStr) : item.pubDate,
				category: categories,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const author = "10000万联网";
	const title = $("h1").contents().first().text();
	return {
		title: `${author} - ${title}`,
		description: title,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.navbar-brand img").attr("src") ? new URL($("a.navbar-brand img").attr("src"), baseUrl).href : void 0,
		author,
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/info/:category?/:id?",
	name: "新闻",
	url: "info.10000link.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/10000link/info/newslists/My01",
	parameters: {
		category: {
			description: "分类，默认为 `newslists`，可在对应分类页 URL 中找到",
			options: [
				{
					label: "新闻",
					value: "newslists"
				},
				{
					label: "物流",
					value: "newslogistics"
				},
				{
					label: "供应链金融风控",
					value: "newsRisk"
				},
				{
					label: "区块链",
					value: "newsBlockChain"
				},
				{
					label: "B2B",
					value: "newsBTwoB"
				},
				{
					label: "跨境电商",
					value: "newsCrossborder"
				},
				{
					label: "投融资",
					value: "newsInvestment"
				},
				{
					label: "供应链管理",
					value: "newsManagement"
				},
				{
					label: "供应链创新",
					value: "newsInnovation"
				},
				{
					label: "数据",
					value: "newslists/A02"
				},
				{
					label: "政策",
					value: "newslists/A03"
				},
				{
					label: "规划",
					value: "newslists/A04"
				},
				{
					label: "案例",
					value: "newslists/GL03"
				},
				{
					label: "职场",
					value: "newslists/ZC"
				},
				{
					label: "供应链票据",
					value: "newsBill"
				}
			]
		},
		id: { description: "ID，默认为空，可在对应分类页 URL 中找到" }
	},
	description: `::: tip
若订阅 [天下大势](https://info.10000link.com/newslists.aspx?chid=My01)，网址为 \`https://info.10000link.com/newslists.aspx?chid=My01\`，请截取 \`https://info.10000link.com/\` 到末尾 \`.aspx\` 的部分 \`newslists\` 作为 \`category\` 参数填入，而 \`My01\` 作为 \`id\` 参数填入，此时目标路由为 [\`/10000link/info/newslists/My01\`](https://rsshub.app/10000link/info/newslists/My01)。
:::

| 金融科技      | 物流          | 供应链金融风控 | 区块链         | B2B       |
| ------------- | ------------- | -------------- | -------------- | --------- |
| newsFinancial | newslogistics | newsRisk       | newsBlockChain | newsBTwoB |

| 跨境电商        | 投融资         | 供应链管理     | 供应链创新     | 数据          |
| --------------- | -------------- | -------------- | -------------- | ------------- |
| newsCrossborder | newsInvestment | newsManagement | newsInnovation | newslists/A02 |

| 政策          | 规划          | 案例           | 职场         | 供应链票据 |
| ------------- | ------------- | -------------- | ------------ | ---------- |
| newslists/A03 | newslists/A04 | newslists/GL03 | newslists/ZC | newsBill   |`,
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
	radar: [{
		source: ["info.10000link.com/:category"],
		target: (params, url) => {
			const id = new URL(url).searchParams.get("chid") ?? void 0;
			const category = params.category;
			return `/10000link/info${category ? `/${category}${id ? `/${id}` : ""}` : ""}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
