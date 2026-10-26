import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/baozimh/index.tsx
const rootUrl = "https://www.baozimh.com";
const route = {
	path: "/comic/:name",
	categories: ["anime"],
	example: "/baozimh/comic/guowangpaiming-shiricaofu",
	parameters: { name: "漫画名称，在漫画链接可以得到(`comic/` 后的那段)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.baozimh.com/comic/:name"] }],
	name: "订阅漫画",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const url = `${rootUrl}/comic/${name}`;
	const $ = load((await got_default(url)).data);
	const comicTitle = $("div > div.pure-u-1-1.pure-u-sm-2-3.pure-u-md-3-4 > div > h1").text();
	const list = $("#chapter-items").first().children().toArray().map((item) => {
		return {
			title: $(item).find("span").text(),
			link: rootUrl + $(item).find("a").attr("href")
		};
	});
	const otherList = $("#chapters_other_list").first().children().toArray().map((item) => {
		return {
			title: $(item).find("span").text(),
			link: rootUrl + $(item).find("a").attr("href")
		};
	});
	const combinedList = [...list, ...otherList];
	combinedList.reverse();
	const items = await Promise.all(combinedList.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		item.description = renderToString(/* @__PURE__ */ jsx(Fragment, { children: $(".comic-contain").find("amp-img").toArray().map((img) => /* @__PURE__ */ jsx("img", { src: $(img).attr("src") })) }));
		return item;
	})));
	return {
		title: `包子漫画-${comicTitle}`,
		description: $(".comics-detail__desc").text(),
		link: url,
		item: items
	};
}
//#endregion
export { route };
