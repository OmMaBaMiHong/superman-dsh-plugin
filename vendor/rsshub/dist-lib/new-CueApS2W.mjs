import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import iconv from "iconv-lite";
//#region lib/routes/xys/new.tsx
const route = {
	path: "/new",
	categories: ["blog"],
	example: "/xys/new",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xys.org/", "xys.org/new.html"] }],
	name: "新到资料",
	maintainers: ["wenzhenl"],
	handler,
	url: "xys.org/"
};
async function handler(ctx) {
	const currentUrl = `http://www.xys.org/new.html`;
	const response = await got_default({
		method: "get",
		url: currentUrl,
		responseType: "buffer"
	});
	const $ = load(iconv.decode(response.data, "gb2312"));
	let items = $("li a").slice(4, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
		item = $(item);
		let link = item.attr("href");
		/^https?:\/\//.test(link) || (link = "http://www.xys.org/" + link.replace(/^\//, ""));
		let date = item.parent().text().trim().slice(0, 8);
		date = parseDate(date, "YY.MM.DD");
		return {
			title: item.text(),
			link,
			pubDate: date
		};
	});
	items = await Promise.all(items.filter((item) => !item.link.endsWith(".zip")).map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.match(/(?:https?:\/\/)?(?:www\.)?youtu\.?be.*(?:v=|v\/|\/)([\w-]+)&?/g)) item.description = renderDescription(item.link.slice(32));
		else {
			const detailResponse = await got_default({
				method: "get",
				url: item.link,
				responseType: "buffer"
			});
			item.description = load(iconv.decode(detailResponse.data, "gb2312")).text().replaceAll("\n", "<br>\n");
		}
		return item;
	})));
	return {
		title: "新语丝 - 新到资料",
		link: currentUrl,
		item: items
	};
}
const renderDescription = (youTube) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: youTube ? /* @__PURE__ */ jsx("iframe", {
	width: "560",
	height: "315",
	src: `https://www.youtube-nocookie.com/embed/${youTube}`,
	frameborder: "0",
	allowfullscreen: true,
	referrerpolicy: "strict-origin-when-cross-origin"
}) : null }));
//#endregion
export { route };
