import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/supercell/blog.ts
const route = {
	path: "/:game/blog/:locale?",
	categories: ["game"],
	example: "/supercell/clashroyale/blog/zh",
	parameters: {
		game: "Game name, see below",
		locale: "Language code, see below, English by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["supercell.com/en/games/:game/:locale/blog"],
		target: "/:game/blog/:locale"
	}],
	name: "Game Blog",
	maintainers: ["fishyo"],
	handler,
	description: `Supported games

| Game           | Slug         |
| -------------- | ------------ |
| Clash Royale   | clashroyale  |
| Brawl Stars    | brawlstars   |
| Clash of Clans | clashofclans |
| Boom Beach     | boombeach    |
| Hay Day        | hayday       |

Language codes

| Language  | Code    |
| --------- | ------- |
| English   |         |
| 繁體中文  | zh      |
| 简体中文  | zh-hans |
| Français  | fr      |
| Deutsch   | de      |
| Indonesia | id      |
| Italiano  | it      |
| 日本語    | ja      |
| 한국어    | ko      |
| Português | pt      |
| Русский   | ru      |
| Español   | es      |`
};
const GAME_NAMES = {
	clashroyale: "Clash Royale",
	brawlstars: "Brawl Stars",
	clashofclans: "Clash of Clans",
	boombeach: "Boom Beach",
	hayday: "Hay Day"
};
function renderRichText(json) {
	if (!json?.content || !Array.isArray(json.content)) return "";
	return json.content.map((node) => {
		switch (node.nodeType) {
			case "paragraph": return `<p>${renderNodeContent(node)}</p>`;
			case "heading-1":
			case "heading-2":
			case "heading-3":
			case "heading-4":
			case "heading-5":
			case "heading-6": {
				const level = node.nodeType.split("-", 2)[1];
				return `<h${level}>${renderNodeContent(node)}</h${level}>`;
			}
			case "quote": return `<blockquote>${renderNodeContent(node)}</blockquote>`;
			case "unordered-list":
			case "ordered-list": return `<${node.nodeType === "unordered-list" ? "ul" : "ol"}>${node.content?.map((item) => `<li>${renderNodeContent(item)}</li>`).join("") || ""}</${node.nodeType === "unordered-list" ? "ul" : "ol"}>`;
			case "list-item": return renderNodeContent(node);
			default: return renderNodeContent(node);
		}
	}).join("");
}
function renderNodeContent(node) {
	if (!node?.content) return "";
	return node.content.map((item) => {
		if (item.nodeType === "text") {
			let text = item.value || "";
			if (item.marks && Array.isArray(item.marks)) for (const mark of item.marks) switch (mark.type) {
				case "bold":
					text = `<strong>${text}</strong>`;
					break;
				case "italic":
					text = `<em>${text}</em>`;
					break;
				case "underline":
					text = `<u>${text}</u>`;
					break;
				case "code":
					text = `<code>${text}</code>`;
					break;
				default: break;
			}
			return text;
		}
		if (item.nodeType === "paragraph" || item.nodeType === "list-item") return renderNodeContent(item);
		return "";
	}).join("");
}
function renderBlock(block) {
	const parts = [];
	switch (block.__typename) {
		case "TextBlock":
			if (block.title) parts.push(`<h3>${block.title}</h3>`);
			if (block.text?.json?.content) parts.push(renderRichText(block.text.json));
			break;
		case "FeatureBlock":
			if (block.title) parts.push(`<h3>${block.title}</h3>`);
			if (block.featureThumbnail?.url) parts.push(`<img src="${block.featureThumbnail.url}" alt="${block.featureThumbnail.title || ""}">`);
			if (block.featureText?.json?.content) parts.push(renderRichText(block.featureText.json));
			break;
		case "ImageBlock": {
			const imageUrl = block.image?.url || block.url || "";
			if (imageUrl) parts.push(`<img src="${imageUrl}" alt="${block.image?.title || block.title || ""}">`);
			break;
		}
		case "CarouselBlock":
			if (block.items && Array.isArray(block.items)) {
				for (const item of block.items) if (item.image?.url) parts.push(`<img src="${item.image.url}" alt="${item.image.title || ""}">`);
			}
			break;
		default: break;
	}
	return parts.join("");
}
async function handler(ctx) {
	const game = ctx.req.param("game");
	const locale = ctx.req.param("locale") || "";
	if (!Object.hasOwn(GAME_NAMES, game)) throw new Error(`Unsupported game: ${game}. Supported games: ${Object.keys(GAME_NAMES).join(", ")}`);
	const localePrefix = locale ? `/${locale}` : "";
	const rootUrl = "https://supercell.com";
	const currentUrl = `${rootUrl}/en/games/${game}${localePrefix}/blog/`;
	const { data: response } = await got_default(currentUrl);
	const match = response.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
	const nextData = match ? JSON.parse(match[1]) : {};
	const articles = nextData.props.pageProps.articles || [];
	const buildId = nextData.buildId;
	const items = await Promise.all(articles.map((article) => {
		const link = `${rootUrl}${article.linkUrl}`;
		const pubDate = parseDate(article.publishDate);
		return cache_default.tryGet(link, async () => {
			try {
				const { data: articleData } = await got_default(`${rootUrl}/_next/data/${buildId}${article.linkUrl}.json`);
				const pageProps = articleData.pageProps;
				let content = "";
				if (pageProps?.bodyCollection && Array.isArray(pageProps.bodyCollection)) content = pageProps.bodyCollection.map((block) => renderBlock(block)).join("");
				return {
					title: article.title,
					link,
					description: content || article.descriptionForNewsArchive || "",
					pubDate,
					category: article.category,
					author: "Supercell"
				};
			} catch {
				return {
					title: article.title,
					link,
					description: article.descriptionForNewsArchive || "",
					pubDate,
					category: article.category,
					author: "Supercell"
				};
			}
		});
	}));
	return {
		title: `${GAME_NAMES[game]} Blog${locale ? ` (${locale})` : ""}`,
		link: currentUrl,
		item: items,
		language: locale || "en"
	};
}
//#endregion
export { route };
