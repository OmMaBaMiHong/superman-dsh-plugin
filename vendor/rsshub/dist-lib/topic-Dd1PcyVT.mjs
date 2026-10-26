import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/vice/topic.tsx
const render = (data) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	data.image ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: data.image.url,
		alt: data.image.alt
	}), /* @__PURE__ */ jsx("figcaption", { children: data.image.caption || data.image.credit || data.image.alt })] }) : null,
	data.body ? /* @__PURE__ */ jsx("p", { children: raw(data.body.html) }) : null,
	data.heading2 ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("hr", {}), /* @__PURE__ */ jsx("h2", { children: raw(data.heading2.html) })] }) : null,
	data.oembed ? raw(data.oembed.html) : null
] }));
const route = {
	path: "/topic/:topic/:language?",
	categories: ["traditional-media"],
	example: "/vice/topic/politics/en",
	parameters: {
		topic: "Can be found in the URL",
		language: "defaults to `en`, use the website to discover other codes"
	},
	radar: [{
		source: ["www.vice.com/:language/topic/:topic"],
		target: "/topic/:topic/:language"
	}],
	name: "Topic",
	maintainers: ["K33k0"],
	handler,
	url: "vice.com/"
};
async function handler(ctx) {
	const { language = "en", topic } = ctx.req.param();
	const $ = load(await rofetch(`https://www.vice.com/${language}/topic/${topic}`));
	const list = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.listPageData.articles.map((item) => ({
		title: item.title,
		link: `https://vice.com${item.url}`,
		pubDate: parseDate(item.publish_date, "x"),
		author: item.contributions.map((c) => c.contributor.full_name).join(", "),
		description: item.dek,
		category: [.../* @__PURE__ */ new Set([item.primary_topic.name, ...item.topics.map((t) => t.name)])]
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		const articleNextData = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.data.articles[0];
		const bodyComponent = JSON.parse(articleNextData.body_components_json);
		item.description = render({ image: {
			url: articleNextData.thumbnail_url,
			alt: articleNextData.caption,
			caption: articleNextData.caption,
			credit: articleNextData.credit
		} }) + bodyComponent.map((component) => {
			switch (component.role) {
				case "body": return render({ body: { html: component.html } });
				case "heading2": return render({ heading2: { html: component.html } });
				case "image": return render({ image: {
					url: component.URL,
					alt: component.alt,
					caption: component.caption
				} });
				case "oembed":
				case "tweet":
				case "youtube": return render({ oembed: { html: component.oembed.html } });
				default: return "";
			}
		}).join("");
		return item;
	})));
	return {
		title: `VICE | ${topic} articles`,
		link: `https://vice.com/${language}/topic/${topic}`,
		item: items
	};
}
//#endregion
export { route };
