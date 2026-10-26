import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getHeaders } from "./utils-B0H7APTF2.mjs";
import { load } from "cheerio";
//#region lib/routes/smzdm/haowen.ts
const route = {
	path: "/haowen/:day?",
	categories: ["shopping"],
	example: "/smzdm/haowen/1",
	parameters: { day: {
		description: "以天为时间跨度，默认为 `1`",
		options: [
			{
				value: "1",
				label: "今日热门"
			},
			{
				value: "7",
				label: "周热门"
			},
			{
				value: "30",
				label: "月热门"
			}
		],
		default: "1"
	} },
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
	name: "好文",
	maintainers: ["LogicJake", "pseudoyu"],
	handler
};
async function handler(ctx) {
	if (!config.smzdm.cookie) throw new ConfigNotFoundError("什么值得买排行榜 is disabled due to the lack of SMZDM_COOKIE");
	const link = `https://post.smzdm.com/hot_${ctx.req.param("day") ?? "1"}/`;
	const $ = load(await rofetch(link, { headers: getHeaders() }));
	const title = $("li.filter-tab.active").text();
	const list = $("li.feed-row-wide").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find("h5.z-feed-title a").text(),
			link: $item.find("h5.z-feed-title a").attr("href"),
			pubDate: timezone(parseDate($item.find("span.z-publish-time").text()), 8)
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link ?? "", async () => {
		const $ = load(await rofetch(item.link ?? "", { headers: getHeaders() }));
		const content = $("#articleId");
		content.find(".item-name").remove();
		content.find(".recommend-tab").remove();
		const releaseDate = $("meta[property=\"og:release_date\"]").attr("content");
		return {
			title: item.title,
			link: item.link,
			description: content.html() || "",
			pubDate: releaseDate ? timezone(parseDate(releaseDate), 8) : item.pubDate,
			author: $("meta[property=\"og:author\"]").attr("content") || ""
		};
	})));
	return {
		title: `${title}-什么值得买好文`,
		link,
		item: out.filter((item) => item !== null)
	};
}
//#endregion
export { route };
