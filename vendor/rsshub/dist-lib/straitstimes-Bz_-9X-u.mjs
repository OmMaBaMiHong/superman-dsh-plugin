import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/straitstimes/index.tsx
const renderDescription = (images, article) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image) => image?.url ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
	src: image.large ?? image.url,
	height: image.height,
	width: image.width
}), image.caption ? /* @__PURE__ */ jsx("figcaption", { children: image.caption }) : null] }) : null), article ? raw(article) : null] }));
const route = {
	path: "/:category?/:section?",
	categories: ["traditional-media"],
	example: "/straitstimes/singapore",
	parameters: {
		category: "Category, see below for more information",
		section: "Section, see below for more information"
	},
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		requireConfig: false
	},
	name: "News",
	maintainers: ["quiniapiezoelectricity"],
	handler,
	description: `| Category              | \`:category\`               |   |
| --------------------- | ------------------------- | - |
| Singapore             | \`singapore\`               |   |
| Asia                  | \`asia\`                    |   |
| World                 | \`world\`                   |   |
| Opinion               | \`opinion\`                 |   |
| Life                  | \`life\`                    |   |
| Business              | \`business\`                |   |
| Jobs                  | \`jobs\`                    |   |
| Parenting & Education | \`parenting-and-education\` |   |
| Food                  | \`food\`                    |   |
| Tech                  | \`tech\`                    |   |
| Sport                 | \`sport\`                   |   |
| Podcasts              | \`podcasts\`                | , |

| Section     | \`:section\`    |
| ----------- | ------------- |
| Top Stories | \`top-stories\` |
| Latest      | \`latest\`      |`,
	radar: [{
		source: ["www.straitstimes.com/:category"],
		target: "/:category"
	}, {
		source: ["www.straitstimes.com"],
		target: "/"
	}]
};
async function handler(ctx) {
	const category = ctx.req.param("category") ? ctx.req.param("category").toLowerCase() : "singapore";
	const section = ctx.req.param("section") ? ctx.req.param("section").toLowerCase() : void 0;
	const apiKey = "T9XUJM9rAZoLOd2CAx2wCBSTrm3xoyPw";
	const platform = "iosflex";
	let feed;
	feed = (await got_default({
		method: "get",
		url: `https://newsapi.sphdigital.com/v2/feed/section/st?page=1&platform=${platform}&section=${category}/star&subscribed=false&version=4.0`,
		headers: { "x-api-key": apiKey }
	})).data.data;
	const sections = new Set(feed.filter((item) => item.items[0].itemType === "SectionFooter").map((items) => items.items[0].sectionFooterData.link.id));
	let slug = section && sections.has(`${category}-${section}-more/star`) ? `${category}-${section}-more/star` : void 0;
	if (section === void 0) for (const section of [
		"latest",
		"top-picks",
		"top-stories"
	]) {
		if (!sections.has(`${category}-${section}-more/star`)) continue;
		slug = `${category}-${section}-more/star`;
		break;
	}
	if (slug) feed = (await got_default({
		method: "get",
		url: `https://newsapi.sphdigital.com/v2/feed/section/st?page=1&platform=${platform}&section=${slug}&subscribed=false&version=4.0`,
		headers: { "x-api-key": apiKey }
	})).data.data;
	const articles = feed.filter((item) => item.items[0].itemType === "Article");
	const items = await Promise.all(articles.map((item) => cache_default.tryGet(item.items[0].articleData.url, async () => {
		const article = item.items[0].articleData;
		if (article.authors) item.author = article.authors.map((author) => author.name).join(", ");
		if (article.keywords) item.category = article.keywords.map((keyword) => keyword.name);
		item.title = article.headline;
		item.pubDate = parseDate(article.publicationTime, "X");
		item.updated = parseDate(article.updatedTime, "X");
		item.link = article.url;
		let content = article.teaser;
		if (article.documentId) content = (await got_default({
			method: "get",
			url: `https://newsapi.sphdigital.com/v2/feed/article/st/${article.documentId}?platform=${platform}&version=4.0`,
			headers: { "x-api-key": apiKey }
		})).data.data.body;
		item.description = renderDescription(article.images ?? [], content);
		return item;
	})));
	return {
		title: `The Strait Times - ${category.replaceAll("-", " ").toUpperCase()}`,
		link: `https://www.straitstimes.com/${category.toLowerCase()}`,
		item: items
	};
}
//#endregion
export { route };
