import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/warthunder/news.tsx
const renderDescription = (desc) => renderToString(/* @__PURE__ */ jsx(WarthunderDescription, {
	description: desc.description,
	imglink: desc.imglink
}));
const WarthunderDescription = ({ description, imglink }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	description,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("img", { src: `https:${imglink ?? ""}` })
] });
const route = {
	path: "/news",
	categories: ["game"],
	example: "/warthunder/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["warthunder.com/en/news", "warthunder.com/"] }],
	name: "News",
	maintainers: ["axojhf"],
	handler,
	url: "warthunder.com/en/news",
	description: `News data from <https://warthunder.com/en/news/>
The \`pubDate\` provided under UTC time zone, so please ignore the specific time!!!`
};
async function handler() {
	const $ = load(await rofetch("https://warthunder.com/en/news/"));
	return {
		title: "War Thunder News",
		link: "https://warthunder.com/en/news/",
		item: $("div.showcase__item.widget").toArray().map((item) => {
			item = $(item);
			let pubDate = parseDate(item.find("div.widget__content > ul > li.widget-meta__item.widget-meta__item--right").text(), "D MMMM YYYY", "en");
			pubDate = timezone(pubDate, 0);
			const category = [];
			if (item.find("div.widget__pin").length !== 0) category.push("pinned");
			if (item.find("a.widget__decal").length !== 0) category.push("decal");
			if (item.find("div.widget__badge").length !== 0) category.push(item.find("div.widget__badge").text());
			return {
				link: `https://warthunder.com${item.find("a.widget__link").attr("href")}`,
				title: item.find("div.widget__content > div.widget__title").text(),
				pubDate,
				description: renderDescription({
					description: item.find("div.widget__content > div.widget__comment").text(),
					imglink: item.find("div.widget__poster > img.widget__poster-media").attr("data-src")
				}),
				category
			};
		})
	};
}
//#endregion
export { route };
