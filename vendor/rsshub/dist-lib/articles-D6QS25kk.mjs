import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dedao/articles.ts
const route = {
	path: "/articles/:id?",
	categories: ["new-media"],
	example: "/dedao/articles/9",
	parameters: { id: "文章类型 ID，8 为得到头条，9 为得到精选，默认为 8" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["igetget.com"],
		target: "/articles/:id"
	}],
	name: "得到文章",
	maintainers: ["Jacky-Chen-Pro"],
	handler,
	url: "www.igetget.com"
};
function handleParagraph(data) {
	let html = "<p>";
	if (data.contents && Array.isArray(data.contents)) html += data.contents.map((data) => extractArticleContent(data)).join("");
	html += "</p>";
	return html;
}
function handleText(data) {
	let content = data.text?.content || "";
	if (data.text?.bold || data.text?.highlight) content = `<strong>${content}</strong>`;
	return content;
}
function handleImage(data) {
	return data.image?.src ? `<img src="${data.image.src}" alt="${data.image.alt || ""}" />` : "";
}
function handleHr() {
	return "<hr />";
}
function extractArticleContent(data) {
	if (!data || typeof data !== "object") return "";
	switch (data.type) {
		case "paragraph": return handleParagraph(data);
		case "text": return handleText(data);
		case "image": return handleImage(data);
		case "hr": return handleHr();
		default: return "";
	}
}
async function handler(ctx) {
	const { id = "8" } = ctx.req.param();
	const rootUrl = "https://www.igetget.com";
	const headers = {
		Accept: "application/json, text/plain, */*",
		"Content-Type": "application/json;charset=UTF-8",
		Referer: "https://m.igetget.com/share/course/free/detail?id=nb9L2q1e3OxKBPNsdoJrgN8P0Rwo6B",
		Origin: "https://m.igetget.com"
	};
	const response = await got_default.post("https://m.igetget.com/share/api/course/free/pageTurning", {
		json: {
			chapter_id: 0,
			count: 5,
			max_id: 0,
			max_order_num: 0,
			pid: Number(id),
			ptype: 24,
			reverse: true,
			since_id: 0,
			since_order_num: 0
		},
		headers
	});
	const data = JSON.parse(response.body);
	if (!data || !data.article_list) throw new Error("文章列表不存在或为空");
	const articles = data.article_list;
	const items = await Promise.all(articles.map((article) => {
		const postUrl = `https://m.igetget.com/share/course/article/article_id/${article.id}`;
		const postTitle = article.title;
		const postTime = (/* @__PURE__ */ new Date(article.publish_time * 1e3)).toUTCString();
		return cache_default.tryGet(postUrl, async () => {
			const $ = load((await got_default.get(postUrl, { headers })).body);
			const scriptTag = $("script").filter((_, el) => $(el).text()?.includes("window.__INITIAL_STATE__")).text();
			if (scriptTag) {
				const jsonStr = scriptTag.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*\});/)?.[1];
				if (jsonStr) {
					const articleData = JSON.parse(jsonStr);
					const description = JSON.parse(articleData.articleContent.content).map((data) => extractArticleContent(data)).join("");
					return {
						title: postTitle,
						link: postUrl,
						description,
						pubDate: postTime
					};
				}
			}
			return null;
		});
	}));
	return {
		title: `得到文章 - ${id === "8" ? "头条" : "精选"}`,
		link: rootUrl,
		item: items.filter(Boolean)
	};
}
//#endregion
export { route };
