import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wechat/announce.ts
const route = {
	path: "/announce",
	categories: ["programming"],
	example: "/wechat/announce",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mp.weixin.qq.com/cgi-bin/announce"] }],
	name: "公众平台系统公告栏目",
	maintainers: ["xyqfer"],
	handler,
	url: "mp.weixin.qq.com/cgi-bin/announce"
};
async function handler() {
	const { data: htmlString } = await got_default({
		method: "get",
		url: "https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncementlist&lang=zh_CN"
	});
	const $ = load(htmlString);
	const announceList = [];
	$(".mp_news_list > .mp_news_item").each((_, el) => {
		const $item = $(el);
		const $link = $item.find("a");
		const time = $item.find(".read_more").text();
		const title = $item.find("strong").text();
		announceList.push({
			title: `${time} ${title}`,
			link: `https://mp.weixin.qq.com${$link.attr("href")}`,
			description: title,
			pubDate: parseDate(time)
		});
	});
	return {
		title: "微信公众平台-系统公告栏目",
		link: "https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncementlist&lang=zh_CN",
		item: announceList
	};
}
//#endregion
export { route };
