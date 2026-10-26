import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/eshukan/templates/description.tsx
const renderDescription = ({ intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [intro ? /* @__PURE__ */ jsx("blockquote", { children: raw(intro) }) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
//#endregion
//#region lib/routes/eshukan/academic.ts
const handler = async (ctx) => {
	const { id = "1" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "https://www.eshukan.com";
	const currentUrl = new URL(`academic/index.aspx?cid=${id}`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("ul.article li").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const title = a.contents().last().text();
		const pubDate = item.find("p span").text().match(/(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];
		item.find("p span").remove();
		const description = renderDescription({ intro: item.find("p").text() });
		return {
			title,
			description,
			pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
			link: new URL(a.prop("href"), currentUrl).href,
			content: {
				html: description,
				text: item.find("p").text()
			}
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const $$ = load(detailResponse);
		const title = $$("h1").text();
		const description = renderDescription({
			intro: $$("div.summary").html(),
			description: $$("div.detail").html()
		});
		const pubDate = $$("div.author").text().match(/(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];
		item.title = title;
		item.description = description;
		item.pubDate = pubDate ? timezone(parseDate(pubDate), 8) : item.pubDate;
		item.author = $$("div.author a").text();
		item.content = {
			html: description,
			text: $$("div.detail").text()
		};
		return item;
	})));
	const title = $("title").text();
	const image = new URL($("div.logo img").prop("src"), rootUrl).href;
	return {
		title,
		description: $("meta[name=\"description\"]").prop("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: title.split(/_/).pop()
	};
};
const route = {
	path: "/academic/:id?",
	name: "学术资讯",
	url: "www.eshukan.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/eshukan/academic/1",
	parameters: { category: "栏目 id，默认为 `1`，即期刊动态，可在对应栏目页 URL 中找到" },
	description: `::: tip
若订阅 [期刊动态](https://www.eshukan.com/academic/index.aspx?cid=1)，网址为 \`https://www.eshukan.com/academic/index.aspx?cid=1\`。截取 \`https://www.eshukan.com/academic/index.aspx?cid=\` 到末尾的部分 \`1\` 作为参数填入，此时路由为 [\`/eshukan/academic/1\`](https://rsshub.app/eshukan/academic/1)。
:::`,
	categories: ["study"],
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
		source: ["www.eshukan.com/academic/index.aspx"],
		target: (_, url) => {
			url = new URL(url);
			const id = url.searchParams.get("id");
			return `/academic${id ? `/${id}` : ""}`;
		}
	}]
};
//#endregion
export { handler, route };
