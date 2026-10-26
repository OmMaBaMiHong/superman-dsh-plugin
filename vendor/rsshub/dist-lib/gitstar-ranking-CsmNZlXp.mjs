import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/gitstar-ranking/index.tsx
const renderDescription = ({ images, stargazersCount, language, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, image.src) : null) : null, stargazersCount ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	stargazersCount ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Stars" }), /* @__PURE__ */ jsx("td", { children: stargazersCount })] }) : null,
	language ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Language" }), /* @__PURE__ */ jsx("td", { children: language })] }) : null,
	description ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Description" }), /* @__PURE__ */ jsx("td", { children: description })] }) : null
] }) }) : null] }));
const handler = async (ctx) => {
	const { category = "repositories" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "100");
	const baseUrl = "https://gitstar-ranking.com";
	const targetUrl = new URL(category, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "en";
	const items = $("a.list-group-item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const stargazersCount = Number($el.find("span.stargazers_count").text()?.trim());
		const title = $el.find("span.hidden-xs").text()?.trim();
		const image = $el.find("img.avatar_image_big").attr("src");
		const language = $el.find("div.repo-language").text()?.trim();
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			stargazersCount,
			language,
			description: $el.find("div.repo-description").text()?.trim()
		});
		const linkUrl = $el.attr("href");
		const categories = language ? [language] : [];
		const guid = `gitstar-ranking-${title}-${stargazersCount}`;
		return {
			title: `${title} ⭐${stargazersCount}`,
			description,
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
			language
		};
	});
	const title = $("title").text();
	return {
		title,
		description: title.split(/-/, 1)[0],
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author: title.split(/-/).pop()?.trim(),
		language,
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/:category?",
	name: "Ranking",
	url: "gitstar-ranking.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/gitstar-ranking/repositories",
	parameters: { category: {
		description: "Category, Repositories by default",
		options: [
			{
				label: "Users",
				value: "users"
			},
			{
				label: "Organizations",
				value: "organizations"
			},
			{
				label: "Repositories",
				value: "repositories"
			}
		]
	} },
	description: `::: tip
To subscribe to [Repositories](https://gitstar-ranking.com/repositories), where the source URL is \`https://gitstar-ranking.com/repositories\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/gitstar-ranking/repositories\`](https://rsshub.app/gitstar-ranking/repositories).
:::

| Category                                                   | ID                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| [Users](https://gitstar-ranking.com/users)                 | [users](https://rsshub.app/gitstar-ranking/users)                 |
| [Organizations](https://gitstar-ranking.com/organizations) | [organizations](https://rsshub.app/gitstar-ranking/organizations) |
| [Repositories](https://gitstar-ranking.com/repositories)   | [repositories](https://rsshub.app/gitstar-ranking/repositories)   |`,
	categories: ["programming"],
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
			source: ["gitstar-ranking.com/:category"],
			target: "/:category"
		},
		{
			title: "Users",
			source: ["gitstar-ranking.com/users"],
			target: "/users"
		},
		{
			title: "Organizations",
			source: ["gitstar-ranking.com/organizations"],
			target: "/organizations"
		},
		{
			title: "Repositories",
			source: ["gitstar-ranking.com/repositories"],
			target: "/repositories"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
