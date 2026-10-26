import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/duozhi/templates/description.tsx
const Description = ({ images, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image, index) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, `${image.src}-${index}`) : null), description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/duozhi/index.ts
const handler = async (ctx) => {
	const { category } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "http://www.duozhi.com";
	const targetUrl = new URL(category && category.endsWith("/") ? category : category ? `${category}/` : "", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("div.post-item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("a.post-title");
		const title = $aEl.text();
		const image = $el.find("a.post-img").attr("style")?.match(/url\(['"]?(.*?)['"]?\)?/)?.[1];
		const description = renderDescription({ images: image ? [{
			src: image,
			alt: title
		}] : void 0 });
		const pubDateStr = $el.find("div.post-attr").text().split(/\|/, 1)[0]?.trim();
		const linkUrl = $aEl.attr("href");
		const categoryEls = $el.find("span.post-tag a.link-tag").toArray();
		const categories = [...new Set(categoryEls.map((el) => $(el).text()).filter(Boolean))];
		const authors = $el.find("div.post-attr").text().split(/by/)?.pop()?.split(/\s+/).filter(Boolean).map((author) => ({
			name: author,
			url: void 0,
			avatar: void 0
		}));
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			category: categories,
			author: authors,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h1.subject-title").text();
			const image = $$("div.subject-banner img").attr("src");
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: title
				}] : void 0,
				intro: $$("div.subject-desc").text(),
				description: $$("div.subject-content").html()
			});
			const pubDateStr = $$("div.subject-meta").text()?.split(/发布/, 1)[0];
			const categories = [.../* @__PURE__ */ new Set([...item.category ?? [], ...$$("meta[name=\"keywords\"]").attr("content")?.split(",").map((c) => c.trim()) ?? []])];
			const authors = $$("div.subject-meta").text().split(/作者：/)?.pop()?.split(/\s+/).filter(Boolean).map((author) => ({
				name: author,
				url: void 0,
				avatar: void 0
			}));
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
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
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: new URL("static/images/logo.png", baseUrl).href,
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/:category{.+}?",
	name: "分类",
	url: "www.duozhi.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/duozhi/industry",
	parameters: { category: {
		description: "分类，默认为 `industry`，即行业，可在对应分类页 URL 中找到",
		options: [
			{
				label: "行业",
				value: "industry"
			},
			{
				label: "多知商学院",
				value: "DBS"
			},
			{
				label: "OpenTalk",
				value: "opentalk"
			},
			{
				label: "行业 - 观察",
				value: "industry/insight"
			},
			{
				label: "行业 - 早幼教",
				value: "industry/preschool"
			},
			{
				label: "行业 - 家庭教育",
				value: "industry/jiatingjiaoyu"
			},
			{
				label: "行业 - K12",
				value: "industry/K12"
			},
			{
				label: "行业 - 素质教育",
				value: "industry/qualityedu"
			},
			{
				label: "行业 - 职教/大学生",
				value: "industry/adult"
			},
			{
				label: "行业 - 教育信息化",
				value: "industry/EduInformatization"
			},
			{
				label: "行业 - 财报",
				value: "industry/earnings"
			},
			{
				label: "行业 - 民办学校",
				value: "industry/privateschools"
			},
			{
				label: "行业 - 留学",
				value: "industry/overseas"
			}
		]
	} },
	description: `::: tip
订阅 [行业](http://www.duozhi.com/industry/)，其源网址为 \`http://www.duozhi.com/industry/\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/duozhi/industry\`](http://rsshub.app/duozhi/industry)。
:::

| [行业](http://www.duozhi.com/industry/)        | [多知商学院](http://www.duozhi.com/DBS/) | [OpenTalk](http://www.duozhi.com/opentalk/)    |
| ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| [industry](https://rsshub.app/duozhi/industry) | [DBS](https://rsshub.app/duozhi/DBS)     | [opentalk](https://rsshub.app/duozhi/opentalk) |

#### [行业](http://www.duozhi.com/industry/)

| [观察](http://www.duozhi.com/industry/insight/)                | [早幼教](http://www.duozhi.com/industry/preschool/)                | [家庭教育](http://www.duozhi.com/industry/jiatingjiaoyu/)                  | [K12](http://www.duozhi.com/industry/K12/)             | [素质教育](http://www.duozhi.com/industry/qualityedu/)               |
| -------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| [industry/insight](https://rsshub.app/duozhi/industry/insight) | [industry/preschool](https://rsshub.app/duozhi/industry/preschool) | [industry/jiatingjiaoyu](https://rsshub.app/duozhi/industry/jiatingjiaoyu) | [industry/K12](https://rsshub.app/duozhi/industry/K12) | [industry/qualityedu](https://rsshub.app/duozhi/industry/qualityedu) |

| [职教 / 大学生](http://www.duozhi.com/industry/adult/)     | [教育信息化](http://www.duozhi.com/industry/EduInformatization/)                     | [财报](http://www.duozhi.com/industry/earnings/)                 | [民办学校](http://www.duozhi.com/industry/privateschools/)                   | [留学](http://www.duozhi.com/industry/overseas/)                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [industry/adult](https://rsshub.app/duozhi/industry/adult) | [industry/EduInformatization](https://rsshub.app/duozhi/industry/EduInformatization) | [industry/earnings](https://rsshub.app/duozhi/industry/earnings) | [industry/privateschools](https://rsshub.app/duozhi/industry/privateschools) | [industry/overseas](https://rsshub.app/duozhi/industry/overseas) |`,
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
			source: ["www.duozhi.com/:category"],
			target: "/:category"
		},
		{
			title: "行业",
			source: ["www.duozhi.com/industry/"],
			target: "/industry"
		},
		{
			title: "多知商学院",
			source: ["www.duozhi.com/DBS/"],
			target: "/DBS"
		},
		{
			title: "OpenTalk",
			source: ["www.duozhi.com/opentalk/"],
			target: "/opentalk"
		},
		{
			title: "行业 - 观察",
			source: ["www.duozhi.com/industry/insight/"],
			target: "/industry/insight"
		},
		{
			title: "行业 - 早幼教",
			source: ["www.duozhi.com/industry/preschool/"],
			target: "/industry/preschool"
		},
		{
			title: "行业 - 家庭教育",
			source: ["www.duozhi.com/industry/jiatingjiaoyu/"],
			target: "/industry/jiatingjiaoyu"
		},
		{
			title: "行业 - K12",
			source: ["www.duozhi.com/industry/K12/"],
			target: "/industry/K12"
		},
		{
			title: "行业 - 素质教育",
			source: ["www.duozhi.com/industry/qualityedu/"],
			target: "/industry/qualityedu"
		},
		{
			title: "行业 - 职教/大学生",
			source: ["www.duozhi.com/industry/adult/"],
			target: "/industry/adult"
		},
		{
			title: "行业 - 教育信息化",
			source: ["www.duozhi.com/industry/EduInformatization/"],
			target: "/industry/EduInformatization"
		},
		{
			title: "行业 - 财报",
			source: ["www.duozhi.com/industry/earnings/"],
			target: "/industry/earnings"
		},
		{
			title: "行业 - 民办学校",
			source: ["www.duozhi.com/industry/privateschools/"],
			target: "/industry/privateschools"
		},
		{
			title: "行业 - 留学",
			source: ["www.duozhi.com/industry/overseas/"],
			target: "/industry/overseas"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
