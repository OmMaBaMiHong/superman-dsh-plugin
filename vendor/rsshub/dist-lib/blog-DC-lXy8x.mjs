import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/sensortower/templates/description.tsx
const renderDescription = ({ image, header, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("img", { src: image }) : null,
	header ? /* @__PURE__ */ jsx(Fragment, { children: raw(header) }) : null,
	description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
] }));
//#endregion
//#region lib/routes/sensortower/blog.ts
const route = {
	path: "/blog/:language?",
	categories: ["new-media"],
	example: "/sensortower/blog",
	parameters: { language: "Language, see below, English by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [
			"sensortower.com/blog",
			"sensortower.com/zh-CN/blog",
			"sensortower.com/ja/blog",
			"sensortower.com/ko/blog",
			"sensortower.com/"
		],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["nczitzk"],
	handler,
	url: "sensortower.com/blog",
	description: `| English | Chinese | Japanese | Korean |
| ------- | ------- | -------- | ------ |
|         | zh-CN   | ja       | ko     |`
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "";
	const rootUrl = "https://sensortower.com";
	const currentUrl = `${rootUrl}${language ? `/${language}` : ""}/blog`;
	let items = (await got_default({
		method: "get",
		url: currentUrl
	})).data.match(/"uri":"(\/blog\/.*?)"/g).map((item) => ({ link: `${rootUrl}${language ? `/${language}` : ""}${item.match(/"(\/blog\/.*?)"/)[1]}` }));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		const detail = JSON.parse(`{${detailResponse.data.match(/("title":.*?),"body":/)[1]}}`);
		content("h1").remove();
		content("h5").parent().remove();
		content("div[data-testid=\"Text-embedded-entry-block\"]").remove();
		content("img").each((_, el) => {
			const image = (content(el).attr("srcset") ?? content(el).attr("src")).split("?w=", 1)[0];
			content(el).replaceWith(renderDescription({ image }));
		});
		item.title = detail.title;
		item.author = detail.author.name;
		item.pubDate = parseDate(detail.pubDate, "MMMM YYYY");
		item.category = [...detail.tags?.map((t) => t.title) ?? [], ...detail.category?.map((c) => c.title) ?? []];
		item.description = renderDescription({
			header: content("header[data-csk-entry-type=\"blog\"]").html() ?? void 0,
			description: content("div[data-csk-entry-type=\"blog\"] div[data-testid=\"Text-root\"]").html() ?? void 0
		});
		return item;
	})));
	return {
		title: "Sensor Tower - Blog",
		link: currentUrl,
		item: items,
		language: language || "en-US"
	};
}
//#endregion
export { route };
