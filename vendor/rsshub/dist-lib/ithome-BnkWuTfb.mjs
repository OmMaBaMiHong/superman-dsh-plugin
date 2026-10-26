import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/ithome/index.ts
const get_url = (caty) => `https://${caty}.ithome.com/`;
const config = {
	it: { title: "IT 资讯" },
	soft: { title: "软件之家" },
	win10: { title: "win10 之家" },
	win11: { title: "win11 之家" },
	iphone: { title: "iphone 之家" },
	ipad: { title: "ipad 之家" },
	android: { title: "android 之家" },
	digi: { title: "数码之家" },
	next: { title: "智能时代" }
};
const route = {
	path: "/:caty",
	categories: ["new-media"],
	example: "/ithome/it",
	parameters: { caty: "类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类资讯",
	maintainers: ["luyuhuang"],
	handler,
	description: `| it      | soft     | win10      | win11      | iphone      | ipad      | android      | digi     | next     |
| ------- | -------- | ---------- | ---------- | ----------- | --------- | ------------ | -------- | -------- |
| IT 资讯 | 软件之家 | win10 之家 | win11 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |`
};
async function handler(ctx) {
	const cfg = config[ctx.req.param("caty")];
	if (!cfg) throw new InvalidParameterError("Bad category. See <a href=\"https://docs.rsshub.app/routes/new-media#it-zhi-jia\">https://docs.rsshub.app/routes/new-media#it-zhi-jia</a>");
	const current_url = get_url(ctx.req.param("caty"));
	const $ = load((await got_default({
		method: "get",
		url: current_url
	})).data);
	const list = $("#list > div.fl > ul > li > div > h2 > a").slice(0, 10).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const post = content("#paragraph");
		post.find("img[data-original]").each((_, ele) => {
			ele = $(ele);
			ele.attr("src", ele.attr("data-original"));
			ele.removeAttr("class");
			ele.removeAttr("data-original");
		});
		item.description = post.html();
		item.pubDate = (/* @__PURE__ */ new Date(content("#pubtime_baidu").text() + " GMT+8")).toUTCString();
		return item;
	})));
	return {
		title: "IT 之家 - " + cfg.title,
		link: current_url,
		image: "https://img.ithome.com/m/images/logo.png",
		item: items
	};
}
//#endregion
export { route };
