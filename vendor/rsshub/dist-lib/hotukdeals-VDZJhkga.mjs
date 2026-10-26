import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hotukdeals/index.ts
const route = {
	path: "/:type",
	categories: ["shopping"],
	example: "/hotukdeals/hot",
	parameters: { type: "should be one of highlights, hot, new, discussed" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "thread",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	let type = ctx.req.param("type");
	if (type === "highlights") type = "";
	const $ = load((await got_default.get(`https://www.hotukdeals.com/${type}?page=1&ajax=true&layout=horizontal`, { headers: { Referer: `https://www.hotukdeals.com/${type}` } })).data.data.content);
	const list = $("article.thread");
	return {
		title: `hotukdeals ${type}`,
		link: `https://www.hotukdeals.com/${type}`,
		item: list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find(".cept-tt").text(),
				description: `${item.find(".thread-listImgCell").html()}<br>${item.find(".cept-vote-temp").html()}<br>${item.find(".overflow--fade").html()}<br>${item.find(".threadGrid-body .userHtml").html()}`,
				link: item.find(".cept-tt").attr("href")
			};
		}).toReversed()
	};
}
//#endregion
export { route };
