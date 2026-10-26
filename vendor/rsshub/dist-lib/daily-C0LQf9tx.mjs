import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
import utc from "dayjs/plugin/utc.js";
//#region lib/routes/mrdx/utils.ts
function getElementChildrenInnerText(element) {
	let text = "";
	for (const child of element.children) {
		if (child.type === "text") text += child.data.trim();
		if (child.children !== void 0) text += getElementChildrenInnerText(child);
	}
	return text;
}
//#endregion
//#region lib/routes/mrdx/daily.ts
dayjs.extend(utc);
const route = {
	path: "/today",
	categories: ["traditional-media"],
	example: "/mrdx/today",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mrdx.cn*"] }],
	name: "今日",
	maintainers: ["Dustin-Jiang"],
	handler,
	url: "mrdx.cn*"
};
async function handler() {
	const baseUrl = `http://mrdx.cn/content/${dayjs().utcOffset(8).format("YYYYMMDD")}`;
	const link = `${baseUrl}/Page01DK.htm`;
	const passagesList = load((await got_default({
		url: link,
		method: "get"
	})).data)(".listdaohang > ul > li a").toArray().map((item) => ({ link: new URL(`${baseUrl}/${item.attribs.daoxiang}`).href }));
	return {
		title: "新华每日电讯",
		link,
		item: await Promise.all(passagesList.map((passage) => cache_default.tryGet(passage.link, async () => {
			const $ = load((await got_default({
				url: passage.link,
				method: "get"
			})).data);
			const title = getElementChildrenInnerText($(".bggray > .margin15 > h2")[0]) + getElementChildrenInnerText($(".bggray > .margin15 > h3")[0]) + getElementChildrenInnerText($(".bggray > .margin15 > h4")[0]) + getElementChildrenInnerText($(".bggray > .margin15 > h5")[0]);
			const [author, pubDate] = getElementChildrenInnerText($(".shijian")[0]).split(" ").filter((item) => item !== "").map((item) => item.trim());
			const content = $(".contenttext").html();
			return {
				title,
				author,
				pubDate: parseDate(pubDate, "YYYY年MM月DD日"),
				guid: passage.link,
				link: passage.link,
				description: content
			};
		}))),
		description: "中国报纸发行前三强。位列《人民日报》，《参考消息》之后。《新华每日电讯》是新华社出版的一份新闻电讯报，1993年创办，具有很高的权威性和准确性，有“一报在手，便知天下”之美誉。《新华每日电讯》为对开八版日报，集中刊登[新华社]每天向国内播发的电讯稿及图片稿。打开《新华每日电讯》，中国和全世界每天发生的重大事件便将一目了然。在人类生活节奏日益加快的当今世界，《新华每日电讯》以最便捷、最醒目的方式为公众提供最重要的新闻报道，受到公众的喜爱和拥护。"
	};
}
//#endregion
export { route };
