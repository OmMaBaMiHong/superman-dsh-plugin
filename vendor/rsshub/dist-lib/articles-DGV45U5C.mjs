import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/meritalk/templates/description.tsx
const renderDescription = ({ featuredImage, fullContent }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [featuredImage ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(featuredImage), /* @__PURE__ */ jsx("br", {})] }) : null, fullContent ? raw(fullContent) : null] }));
//#endregion
//#region lib/routes/meritalk/articles.ts
const route = {
	path: "/articles",
	categories: ["new-media"],
	example: "/meritalk/articles",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["meritalk.com/articles/"],
		target: "/articles"
	}],
	name: "Latest Articles",
	maintainers: ["superguyDiluc"],
	handler
};
async function handler() {
	const { data: response } = await got_default("https://www.meritalk.com/articles");
	const $ = load(response);
	const list = $("div.news-block-sm").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find(".news-block-title a");
		const link = a.attr("href");
		return {
			title: a.text().trim(),
			link,
			pubDate: parseDate($item.find("time[datetime]").attr("datetime")),
			category: $item.find(".category-header-name a").toArray().map((elem) => $(elem).text()),
			description: ""
		};
	});
	return {
		title: "News – MeriTalk",
		link: "https://www.meritalk.com/articles/",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			item.description = renderDescription({
				featuredImage: $(".single-featured-image").first().html() || "",
				fullContent: $(".single-body").first().html() || ""
			});
			return item;
		})))
	};
}
//#endregion
export { route };
