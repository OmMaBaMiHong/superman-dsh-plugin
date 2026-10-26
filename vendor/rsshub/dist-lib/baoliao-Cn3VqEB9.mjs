import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getHeaders } from "./utils-B0H7APTF2.mjs";
import { load } from "cheerio";
//#region lib/routes/smzdm/baoliao.ts
const route = {
	path: "/baoliao/:uid",
	categories: ["shopping"],
	example: "/smzdm/baoliao/7367111021",
	parameters: { uid: "用户id，网址上直接可以看到" },
	features: {
		requireConfig: [{
			name: "SMZDM_COOKIE",
			description: "什么值得买登录后的 Cookie 值"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zhiyou.smzdm.com/member/:uid/baoliao"] }],
	name: "用户爆料",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	if (!config.smzdm.cookie) throw new ConfigNotFoundError("什么值得买排行榜 is disabled due to the lack of SMZDM_COOKIE");
	const link = `https://zhiyou.smzdm.com/member/${ctx.req.param("uid")}/baoliao/`;
	const $ = load((await got_default(link, { headers: getHeaders() })).data);
	const title = $(".info-stuff-nickname").text();
	const list = $(".pandect-content-stuff").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".pandect-content-title a").text(),
			link: item.find(".pandect-content-title a").attr("href"),
			pubDate: timezone(parseDate(item.find(".pandect-content-time").text(), ["YYYY-MM-DD", "MM-DD HH:mm"]), 8)
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link, { headers: getHeaders() })).data);
		item.description = $("article.txt-detail").html();
		item.pubDate = timezone(parseDate($(".time").first().text().trim().replace("更新时间：", "")), 8);
		item.author = title;
		return item;
	})));
	return {
		title: `${title}的爆料 - 什么值得买`,
		link,
		item: out
	};
}
//#endregion
export { route };
