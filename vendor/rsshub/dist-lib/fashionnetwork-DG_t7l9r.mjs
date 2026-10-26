import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/fashionnetwork/templates/description.tsx
const Description = ({ images, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image, index) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, `${image.src}-${index}`) : null), description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] });
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/fashionnetwork/index.ts
const handler = async (ctx) => {
	const { id = "0" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const rootUrl = "https://fashionnetwork.cn";
	const currentUrl = new URL(`lists/${id}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	const language = $("html").prop("lang");
	let items = $("div.home__item").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const title = item.find("h2.family-title").text();
		const src = item.find("img.item__img").first().prop("src") ?? void 0;
		const image = src ? new URL(src, rootUrl).href : void 0;
		return {
			title,
			description: renderDescription({ images: image ? [{
				src: image,
				alt: title
			}] : void 0 }),
			link: new URL(item.find("h2.family-title a").prop("href"), rootUrl).href,
			image,
			banner: image,
			language,
			enclosure_url: image,
			enclosure_type: image ? `image/${image.split(/\./).pop()}` : void 0,
			enclosure_title: title
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const $$ = load(detailResponse);
		const title = $$("h1.newsTitle").text();
		const description = renderDescription({ description: $$("div.article-content").html() });
		item.title = title;
		item.description = description;
		item.pubDate = timezone(parseDate($$("span.time-ago").first().text().trim()), 8);
		item.category = $$("div.newsTags").first().find("div.news-tag").toArray().map((c) => $$(c).text());
		item.author = $$("div.newsLeftCol span").first().text();
		item.content = {
			html: description,
			text: $$("div.article-content").text()
		};
		item.language = language;
		return item;
	})));
	const label = $(`label[for="news_categs_${id}"]`).text()?.split(/\(/, 1)?.[0]?.trim() ?? "";
	const image = new URL($("div.header__fnw-logo img").prop("src"), rootUrl).href;
	return {
		title: `${label}${$("title").text()}`,
		description: $("meta[name=\"description\"]").prop("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: $("meta[name=\"author\"]").prop("content"),
		language
	};
};
const route = {
	path: "/cn/lists/:id?",
	name: "FashionNetwork 中国",
	url: "fashionnetwork.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/fashionnetwork/cn/lists/0",
	parameters: { category: "分类，默认为 0，可在对应分类页 URL 中找到" },
	description: `::: tip
若订阅 [独家新闻](https://fashionnetwork.cn)，网址为 \`https://fashionnetwork.cn/lists/13.html\`。截取 \`https://fashionnetwork.cn/\` 到末尾 \`.html\` 的部分 \`13\` 作为参数填入，此时路由为 [\`/fashionnetwork/cn/lists/13\`](https://rsshub.app/fashionnetwork/cn/lists/13)。
:::

| 分类                                           | ID                                                  |
| ---------------------------------------------- | --------------------------------------------------- |
| [独家](https://fashionnetwork.cn/lists/13)     | [13](https://rsshub.app/fashionnetwork/cn/lists/13) |
| [商业](https://fashionnetwork.cn/lists/1)      | [1](https://rsshub.app/fashionnetwork/cn/lists/1)   |
| [人物](https://fashionnetwork.cn/lists/8)      | [8](https://rsshub.app/fashionnetwork/cn/lists/8)   |
| [设计](https://fashionnetwork.cn/lists/3)      | [3](https://rsshub.app/fashionnetwork/cn/lists/3)   |
| [产业](https://fashionnetwork.cn/lists/5)      | [5](https://rsshub.app/fashionnetwork/cn/lists/5)   |
| [创新研究](https://fashionnetwork.cn/lists/6)  | [6](https://rsshub.app/fashionnetwork/cn/lists/6)   |
| [人事变动](https://fashionnetwork.cn/lists/12) | [12](https://rsshub.app/fashionnetwork/cn/lists/12) |
| [新闻资讯](https://fashionnetwork.cn/lists/11) | [11](https://rsshub.app/fashionnetwork/cn/lists/11) |`,
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
			source: ["fashionnetwork.cn/lists/:id"],
			target: (params) => {
				const id = params.id;
				return `/fashionnetwork/cn/lists${id ? `/${id}` : ""}`;
			}
		},
		{
			title: "独家",
			source: ["fashionnetwork.cn/lists/13"],
			target: "/cn/lists/13"
		},
		{
			title: "商业",
			source: ["fashionnetwork.cn/lists/1"],
			target: "/cn/lists/1"
		},
		{
			title: "人物",
			source: ["fashionnetwork.cn/lists/8"],
			target: "/cn/lists/8"
		},
		{
			title: "设计",
			source: ["fashionnetwork.cn/lists/3"],
			target: "/cn/lists/3"
		},
		{
			title: "产业",
			source: ["fashionnetwork.cn/lists/5"],
			target: "/cn/lists/5"
		},
		{
			title: "创新研究",
			source: ["fashionnetwork.cn/lists/6"],
			target: "/cn/lists/6"
		},
		{
			title: "人事变动",
			source: ["fashionnetwork.cn/lists/12"],
			target: "/cn/lists/12"
		},
		{
			title: "新闻资讯",
			source: ["fashionnetwork.cn/lists/11"],
			target: "/cn/lists/11"
		}
	]
};
//#endregion
export { handler, route };
