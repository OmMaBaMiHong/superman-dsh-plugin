import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-bBrFemnt.mjs";
import { load } from "cheerio";
//#region lib/routes/yicai/utils.ts
const rootUrl = "https://www.yicai.com";
const ProcessItems = async (apiUrl) => {
	const items = (await got_default({
		method: "get",
		url: apiUrl
	})).data.map((item) => ({
		title: item.NewsTitle,
		link: item.url.startsWith("http") ? item.url : `${rootUrl}${item.AppID === 0 ? "/vip" : ""}${item.url}`,
		author: item.NewsAuthor || item.NewsSource || item.CreaterName,
		pubDate: timezone(parseDate(item.CreateDate), 8),
		category: [item.ChannelName],
		description: renderDescription({
			image: {
				src: item.originPic,
				alt: item.NewsTitle
			},
			video: {
				src: item.VideoUrl,
				type: item.VideoUrl?.split(/\./).pop() ?? void 0
			},
			intro: item.NewsNotes
		})
	}));
	return Promise.all(fetchFullArticles(items));
};
function fetchFullArticles(items) {
	return items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		if (!item.pubDate) {
			const dataScript = content("script[src='/js/alert.min.js']").next().text() || content("title").next().text();
			item.pubDate = parseDate(`${new Map(JSON.parse(dataScript.match(/_pb = (\[.*?\]);/)[1].replaceAll("'", "\""))).get("actime")}:00`);
		}
		content("h1").remove();
		content(".u-btn6, .m-smallshare, .topic-hot").remove();
		item.description = (item.description ?? "") + (content(".multiText, #multi-text, .txt").html() ?? "");
		return item;
	}));
}
//#endregion
export { fetchFullArticles as n, rootUrl as r, ProcessItems as t };
