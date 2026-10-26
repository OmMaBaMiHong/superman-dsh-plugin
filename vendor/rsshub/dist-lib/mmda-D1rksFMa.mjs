import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import queryString from "query-string";
//#region lib/routes/booru/templates/description.tsx
const renderDescription = ({ image, title, posted, by, source, rating, score }) => renderToString(/* @__PURE__ */ jsxs("div", {
	class: "item-description",
	children: [
		image ? /* @__PURE__ */ jsx("img", {
			src: image,
			alt: title
		}) : null,
		posted ? /* @__PURE__ */ jsxs("p", { children: ["posted: ", /* @__PURE__ */ jsx("span", {
			class: "posted",
			children: posted
		})] }) : null,
		by ? /* @__PURE__ */ jsxs("p", { children: ["by: ", /* @__PURE__ */ jsx("span", {
			class: "by",
			children: by
		})] }) : null,
		source ? /* @__PURE__ */ jsxs("p", { children: ["source: ", /* @__PURE__ */ jsx("span", {
			class: "source",
			children: source
		})] }) : null,
		rating ? /* @__PURE__ */ jsxs("p", { children: ["rating: ", /* @__PURE__ */ jsx("span", {
			class: "rating",
			children: rating
		})] }) : null,
		score ? /* @__PURE__ */ jsxs("p", { children: ["score: ", /* @__PURE__ */ jsx("span", {
			class: "score",
			children: score
		})] }) : null
	]
}));
//#endregion
//#region lib/routes/booru/mmda.ts
const route = {
	path: "/mmda/tags/:tags?",
	categories: ["picture"],
	example: "/booru/mmda/tags/full_body%20blue_eyes",
	parameters: { tags: "标签，多个标签使用 `%20` 连接，如需根据作者查询则在 `user:` 后接上作者名，如：`user:xxxx`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["mmda.booru.org/index.php"] }],
	name: "MMDArchive 标签查询",
	maintainers: ["N78Wy"],
	handler,
	description: `For example:

- 默认查询 (什么 tag 都不加)：\`/booru/mmda/tags\`
- 默认查询单个 tag：\`/booru/mmda/tags/full_body\`
- 默认查询多个 tag：\`/booru/mmda/tags/full_body%20blue_eyes\`
- 默认查询根据作者查询：\`/booru/mmda/tags/user:xxxx\``
};
async function handler(ctx) {
	const baseUrl = "https://mmda.booru.org";
	const tags = ctx.req.param("tags");
	const query = queryString.stringify({
		tags,
		page: "post",
		s: "list"
	}, { skipNull: true });
	const { data: response } = await got_default(`${baseUrl}/index.php`, { searchParams: query });
	const $ = load(response);
	const list = $("#post-list > div.content > div > div:nth-child(3) span").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		const user = item.find("script[type=\"text/javascript\"]").first().text().match(/user':'(.*?)'/)?.[1] ?? "";
		const title = a.find("img").first().attr("title") ?? "";
		const imageSrc = a.find("img").first().attr("src") ?? "";
		return {
			title,
			link: `${baseUrl}/${a.attr("href")}`,
			image: imageSrc,
			author: user,
			description: renderDescription({
				title,
				image: imageSrc,
				by: user
			})
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		const statisticsTages = $("#tag_list > ul");
		statisticsTages.find("li, br, strong").remove();
		const statisticsStr = statisticsTages.text();
		const regex = /(?<key>[^\s:]+)\s*:\s*(?<value>.+)/g;
		const result = {};
		for (const match of statisticsStr.matchAll(regex)) {
			const { key, value } = match.groups ?? {};
			result[key.trim().toLocaleLowerCase()] = value.trim();
		}
		const bigImage = $("#image").attr("src");
		if (result.posted) item.pubDate = parseDate(result.posted);
		item.description = renderDescription({
			title: item.title,
			image: bigImage ?? item.image,
			posted: item.pubDate ?? "",
			by: result.by,
			source: result.source,
			rating: result.rating,
			score: result.score
		});
		return item;
	})));
	return {
		title: tags,
		link: `${baseUrl}/index.php?${query}`,
		item: items
	};
}
//#endregion
export { route };
