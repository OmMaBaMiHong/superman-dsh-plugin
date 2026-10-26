import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/magazinelib/latest-magazine.tsx
const host = "https://magazinelib.com";
const renderImage = (imgUrl) => renderToString(/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: imgUrl }) }));
const route = {
	path: "/latest-magazine/:query?",
	categories: ["reading"],
	example: "/magazinelib/latest-magazine/new+yorker",
	parameters: { query: "query, search page querystring" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Latest Magazine",
	maintainers: ["EthanWng97"],
	handler,
	description: "For instance, when doing search at <https://magazinelib.com> and you get url `https://magazinelib.com/?s=new+yorker`, the query is `new+yorker`"
};
async function handler(ctx) {
	const query = ctx.req.param("query");
	const response = await got_default({
		method: "get",
		url: `${host}/wp-json/wp/v2/posts/`,
		searchParams: {
			search: query,
			per_page: 30,
			_embed: 1
		}
	});
	let subtitle = query;
	if (subtitle === void 0) subtitle = "";
	else {
		subtitle = subtitle.replaceAll(/[^\dA-Z]+/gi, " ").toUpperCase();
		subtitle = ` - ${subtitle}`;
	}
	const items = response.data.map((obj) => {
		const data = {
			date: obj.date_gmt,
			link: obj.link,
			featuredMediaLink: obj._links["wp:featuredmedia"][0].href,
			title: obj.title.rendered
		};
		const content = load(obj.content.rendered)(".vk-att");
		content.find("img[src=\"https://magazinelib.com/wp-includes/images/media/default.png\"]").remove();
		data.content = content.html();
		const imgUrl = obj._embedded["wp:featuredmedia"][0].source_url;
		data.description = data.content + renderImage(imgUrl);
		data.categories = obj._embedded["wp:term"][0].map((item) => item.name);
		return data;
	});
	return {
		title: `MagazineLib - Latest Magazines${subtitle}`,
		link: `${host}/?s=${query}`,
		description: `MagazineLib - Latest Magazines${subtitle}`,
		item: items.map((item) => ({
			title: item.title,
			link: item.link,
			category: item.categories,
			pubDate: new Date(item.pubDate).toUTCString(),
			description: item.description
		}))
	};
}
//#endregion
export { route };
