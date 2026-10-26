import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import pMap from "p-map";
//#region lib/routes/dlnews/utils.ts
const baseUrl = "https://www.dlnews.com";
const getData = async (url) => (await rofetch(url)).content_elements;
const getList = (data) => data.map((value) => {
	const { _id, headlines, description, publish_date, website_url, taxonomy, credits, promo_items } = value;
	return {
		id: _id,
		title: headlines.basic,
		link: `${baseUrl}${website_url}`,
		description: description.basic,
		author: credits.by.map((v) => v.name).join(", "),
		itunes_item_image: promo_items.basic.url,
		pubDate: parseDate(publish_date),
		category: taxonomy.sections.map((v) => v.name).join(", ")
	};
});
//#endregion
//#region lib/routes/dlnews/category.tsx
const _website = "dlnews";
const topics = {
	defi: "DeFi",
	fintech: "Fintech/VC/Deals",
	"llama-u": "Llama U",
	markets: "Markets",
	"people-culture": "People & Culture",
	regulation: "Regulation",
	snapshot: "Snapshot",
	web3: "Web3"
};
const renderDescription = (blocks) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: blocks.map((block) => {
	switch (block.type) {
		case "custom_embed": return /* @__PURE__ */ jsx("ul", { children: block.data.split("\n").map((line) => /* @__PURE__ */ jsx("li", { children: raw(line) })) });
		case "header": return /* @__PURE__ */ jsx("h2", { children: raw(block.data) });
		case "list": return block.list_type === "unordered" ? /* @__PURE__ */ jsx("ul", { children: block.items.map((item) => /* @__PURE__ */ jsx("li", { children: raw(item.content) })) }) : /* @__PURE__ */ jsx("ol", { children: block.items.map((item) => /* @__PURE__ */ jsx("li", { children: raw(item.content) })) });
		case "image": return /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
			src: block.src,
			alt: block.alt
		}), /* @__PURE__ */ jsx("figcaption", { children: raw(block.caption) })] });
		case "text": return /* @__PURE__ */ jsx("p", { children: raw(block.data) });
		default: return null;
	}
}) }));
const extractArticle = (item) => cache_default.tryGet(item.link, async () => {
	const { data: response } = await got_default(item.link);
	const scriptTagContent = load(response)("script#fusion-metadata").text();
	const jsonData = JSON.parse(scriptTagContent.match(/Fusion\.globalContent=(\{.*?\});Fusion\.globalContentConfig/)[1]).content_elements;
	const filteredData = [];
	for (const v of jsonData) {
		if (v.type === "header" && v.content.includes("What we’re reading")) break;
		if (v.type === "custom_embed" && Boolean(v.embed.config.text)) filteredData.push({
			type: v.type,
			data: v.embed.config.text
		});
		else if (v.type === "text" && !v.content.includes("<b>NOW READ: </b>")) filteredData.push({
			type: v.type,
			data: v.content
		});
		else switch (v.type) {
			case "header":
				filteredData.push({
					type: v.type,
					data: v.content
				});
				break;
			case "list":
				filteredData.push({
					type: v.type,
					list_type: v.list_type,
					items: v.items
				});
				break;
			case "image":
				filteredData.push({
					type: v.type,
					src: v.url,
					alt: v.alt_text,
					caption: v.subtitle
				});
				break;
			default: throw new Error(`Unknown type: ${v.type}`);
		}
	}
	item.description = renderDescription(filteredData);
	return item;
});
const route = {
	path: "/:category?",
	radar: [{
		source: ["dlnews.com/articles/:category"],
		target: "/:category"
	}],
	url: "dlnews.com/articles",
	name: "Latest News",
	maintainers: ["Rjnishant530"],
	handler,
	example: "/dlnews/people-culture"
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const baseUrl = "https://www.dlnews.com";
	const items = await pMap(getList(await getData(`${baseUrl}/pf/api/v3/content/fetch/articles-api?query=${encodeURIComponent(JSON.stringify({
		author: "",
		date: "now-1y/d",
		offset: 0,
		query: "",
		size: 15,
		sort: "display_date:desc",
		vertical: category ?? ""
	}))}&_website=${_website}`)), (item) => extractArticle(item), { concurrency: 3 });
	return {
		title: Object.hasOwn(topics, category) ? `${topics[category]} : DL News` : "DL News",
		link: baseUrl,
		item: items,
		description: Object.hasOwn(topics, category) ? `${topics[category]} : News on dlnews.com` : "Latest News on dlnews.com",
		logo: "https://www.dlnews.com/pf/resources/favicon.ico?d=284",
		icon: "https://www.dlnews.com/pf/resources/favicon.ico?d=284",
		language: "en-us"
	};
}
//#endregion
export { route };
