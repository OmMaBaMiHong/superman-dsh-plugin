import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/theatlantic/utils.tsx
const getArticleDetails = async (items) => {
	return await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const url = item.link;
		const $ = load(await rofetch(url, { headerGeneratorOptions: PRESETS.MODERN_ANDROID }));
		let data = JSON.parse($("script#__NEXT_DATA__").text());
		const list = data.props.pageProps.urqlState;
		const keyWithContent = Object.keys(list).filter((key) => list[key].data.includes("content"));
		data = JSON.parse(list[keyWithContent].data).article;
		item.title = data.shareTitle;
		item.category = data.categories.map((category) => category.slug);
		for (const channel of data.channels) item.category.push(channel.slug);
		item.content = data.content.filter((item) => item.innerHtml !== void 0 && item.innerHtml !== "");
		item.caption = data.dek;
		if (data.leadArt) {
			item.imgUrl = data.leadArt.image?.url;
			item.imgAlt = data.leadArt.image?.altText;
			item.imgCaption = data.leadArt.image?.attributionText;
		}
		item.description = renderToString(/* @__PURE__ */ jsxs("div", { children: [
			item.caption ? raw(item.caption) : null,
			/* @__PURE__ */ jsx("br", {}),
			item.imgUrl ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
				src: item.imgUrl,
				alt: item.imgAlt ?? ""
			}), /* @__PURE__ */ jsx("figcaption", { children: item.imgCaption })] }) : null,
			item.content.map((contentItem) => /* @__PURE__ */ jsxs(Fragment, { children: [raw(contentItem.innerHtml), contentItem.tagName ? null : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("br", {})] })] }))
		] }));
		return {
			title: item.title,
			pubDate: parseDate(item.pubDate),
			link: item.link,
			description: item.description
		};
	})));
};
//#endregion
//#region lib/routes/theatlantic/news.ts
const route = {
	path: "/:category",
	categories: ["traditional-media"],
	example: "/theatlantic/latest",
	parameters: { category: "category, see below" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.theatlantic.com/:category"] }],
	name: "News",
	maintainers: ["EthanWng97", "pseudoyu"],
	handler,
	description: `| Popular      | Latest | Politics | Technology | Business |
| ------------ | ------ | -------- | ---------- | -------- |
| most-popular | latest | politics | technology | business |

More categories (except photo) can be found within the navigation bar at <https://www.theatlantic.com>`
};
async function handler(ctx) {
	const host = "https://www.theatlantic.com";
	const category = ctx.req.param("category");
	const url = `${host}/${category}/`;
	const $ = load(await rofetch(url));
	const contents = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.urqlState;
	const keyWithContent = Object.keys(contents).filter((key) => contents[key].data.includes(category));
	const data = JSON.parse(contents[keyWithContent].data);
	let list = Object.values(data)[0].river.edges;
	list = list.filter((item) => !item.node.url.startsWith("https://www.theatlantic.com/photo"));
	list = list.map((item) => {
		return {
			link: item.node.url,
			pubDate: item.node.datePublished
		};
	});
	const items = await getArticleDetails(list);
	return {
		title: `The Atlantic - ${category.toUpperCase()}`,
		link: url,
		description: `The Atlantic - ${category.toUpperCase()}`,
		item: items
	};
}
//#endregion
export { route };
