import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/cbndata/templates/description.tsx
const CbndataDescription = ({ images, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }) : null), description ? raw(description) : null] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(CbndataDescription, { ...data }));
//#endregion
//#region lib/routes/cbndata/information.ts
const handler = async (ctx) => {
	const { id = "all" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "50");
	const baseUrl = "https://www.cbndata.com";
	const targetUrl = new URL(`information?tag_id=${id}`, baseUrl).href;
	const apiUrl = new URL("api/v3/informations", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	const response = await rofetch(apiUrl, { query: {
		page: 1,
		per_page: limit
	} });
	let items = response.data.slice(0, limit).map((item) => {
		const title = item.title;
		const image = item.image;
		const description = renderDescription({ images: image ? [{
			src: image,
			alt: title
		}] : void 0 });
		const pubDate = item.date;
		const linkUrl = item.id ? `information/${item.id}` : void 0;
		const categories = item.tags;
		const guid = `cbndata-information-${item.id}`;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const dataStr = (await rofetch(item.link)).match(/<script>window\.__INITIAL_STATE__=(.*?);<\/script>/)?.[1];
			if (!dataStr) return item;
			const data = JSON.parse(dataStr)?.data;
			if (!data) return item;
			const title = data.title;
			const description = item.description + renderDescription({ description: data.content });
			const pubDate = data.date;
			const linkUrl = data.id ? `information/${data.id}` : void 0;
			const categories = [...new Set((data.tags?.map((c) => c.name) ?? []).filter(Boolean))];
			const authors = [{
				name: data.author,
				url: void 0,
				avatar: void 0
			}];
			const guid = `cbndata-information-${data.id}`;
			const image = data.thumbnail_url;
			const updated = pubDate;
			const processedItem = {
				title,
				description,
				pubDate: pubDate ? parseDate(pubDate) : void 0,
				link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
				category: categories,
				author: authors,
				guid,
				id: guid,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: updated ? parseDate(updated) : void 0,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	const tag = response.home_tags.find((t) => String(t.id) === id)?.name ?? "";
	const title = `${tag ? `${tag}-` : ""}${$("title").text().trim()}`;
	return {
		title,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.logo-logoImage").attr("src"),
		author: title.split(/\|/).pop(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/information/:id?",
	name: "看点",
	url: "www.cbndata.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/cbndata/information/all",
	parameters: { id: {
		description: "分类，默认为 `all`，即全部，可在对应分类页 URL 中找到",
		options: [
			{
				label: "全部",
				value: "all"
			},
			{
				label: "美妆个护",
				value: "1"
			},
			{
				label: "服饰鞋包",
				value: "2559"
			},
			{
				label: "宠物",
				value: "2419"
			},
			{
				label: "营销",
				value: "2484"
			}
		]
	} },
	description: `::: tip
订阅 [美妆个护](https://www.cbndata.com/information?tag_id=1)，其源网址为 \`https://www.cbndata.com/information?tag_id=1\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/cbndata/information/1\`](https://rsshub.app/cbndata/information/1)。
:::

| 分类                                                        | ID                                                  |
| ----------------------------------------------------------- | --------------------------------------------------- |
| [全部](https://www.cbndata.com/information?tag_id=all)      | [all](https://rsshub.app/cbndata/information/all)   |
| [美妆个护](https://www.cbndata.com/information?tag_id=1)    | [1](https://rsshub.app/cbndata/information/1)       |
| [服饰鞋包](https://www.cbndata.com/information?tag_id=2559) | [2559](https://rsshub.app/cbndata/information/2559) |
| [宠物](https://www.cbndata.com/information?tag_id=2419)     | [2419](https://rsshub.app/cbndata/information/2419) |
| [营销](https://www.cbndata.com/information?tag_id=2484)     | [2484](https://rsshub.app/cbndata/information/2484) |`,
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
			source: ["www.cbndata.com/information"],
			target: (params, url) => {
				const id = new URL(url).searchParams.get("tag_id") ?? void 0;
				return `/information${id ? `/${id}` : ""}`;
			}
		},
		{
			title: "全部",
			source: ["www.cbndata.com/information"],
			target: "/information/all"
		},
		{
			title: "美妆个护",
			source: ["www.cbndata.com/information"],
			target: "/information/1"
		},
		{
			title: "服饰鞋包",
			source: ["www.cbndata.com/information"],
			target: "/information/2559"
		},
		{
			title: "宠物",
			source: ["www.cbndata.com/information"],
			target: "/information/2419"
		},
		{
			title: "营销",
			source: ["www.cbndata.com/information"],
			target: "/information/2484"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
