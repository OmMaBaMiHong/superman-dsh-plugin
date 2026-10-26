import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/who/news-room.ts
const route = {
	path: "/news-room/:category?/:language?",
	categories: ["government"],
	example: "/who/news-room/feature-stories",
	parameters: {
		category: "Category, see below, Feature stories by default",
		language: "Language, see below, English by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["who.int/news-room/:type"],
		target: "/news-room/:type"
	}],
	name: "Newsroom",
	maintainers: ["LogicJake", "nczitzk"],
	handler,
	url: "who.int/news",
	description: `Category

| Feature stories | Commentaries |
| --------------- | ------------ |
| feature-stories | commentaries |

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "feature-stories";
	const language = ctx.req.param("language") ?? "";
	const rootUrl = "https://www.who.int";
	const currentUrl = `${rootUrl}/${language ? `${language}/` : ""}news-room/${category}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let list = $(".list-view--item a");
	if (list.length === 0) list = (await got_default({
		method: "get",
		url: `${rootUrl}/api/hubs/${category.replaceAll("-", "")}?sf_culture=zh&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl&$top=30`
	})).data.value.map((item) => ({
		title: item.Title,
		link: `${currentUrl}/detail/${item.ItemDefaultUrl}`,
		pubDate: parseDate(item.PublicationDateAndTime)
	}));
	else list = list.toArray().map((item) => {
		item = $(item);
		return { link: `${item.attr("href").indexOf("http") === 0 ? "" : rootUrl}${item.attr("href")}` };
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const matches = detailResponse.data.match(/"headline":"(.*)","description":"(.*)","datePublished":"(.*)","image"/);
		if (matches) {
			item.title = matches[1];
			item.description = matches[2];
			item.pubDate = parseDate(matches[3]);
		} else item.description = load(detailResponse.data)(".sf-content-block").html();
		return item;
	})));
	return {
		title: `${$("meta[property=\"og:title\"]").attr("content")} - WHO`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
