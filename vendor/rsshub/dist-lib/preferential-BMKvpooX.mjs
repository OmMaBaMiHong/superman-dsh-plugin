import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/flyert/preferential.ts
const gbk2utf8 = (s) => iconv.decode(s, "gbk");
const host = "https://www.flyert.com";
const target = `${host}/forum.php?mod=forumdisplay&sum=all&fid=all&catid=322`;
const route = {
	path: "/preferential",
	categories: ["travel"],
	example: "/flyert/preferential",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["flyert.com/"] }],
	name: "优惠信息",
	maintainers: ["howel52"],
	handler,
	url: "flyert.com/"
};
async function handler() {
	const response = await got_default(target, { responseType: "buffer" });
	const $ = load(gbk2utf8(response.data));
	const list = $(".comiis_wzli").toArray().map((item) => ({
		title: $(item).find(".wzbt").text(),
		link: `${host}/${$(item).find(".wzbt a").attr("href")}`,
		description: $(item).find(".wznr > div:first-child").text()
	}));
	return {
		title: "飞客茶馆优惠",
		link: "https://www.flyert.com/",
		description: "飞客茶馆优惠",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const detailResponse = await got_default(item.link, { responseType: "buffer" });
			const content = load(gbk2utf8(detailResponse.data));
			content("div.artical_top").remove();
			item.description = content("#artMain").html();
			item.pubDate = timezone(parseDate(content("p.xg1 > span:nth-child(1)").attr("title") || content("p.xg1").text().split("|", 1)[0], "YYYY-M-D HH:mm"), 8);
			return item;
		})))
	};
}
//#endregion
export { route };
