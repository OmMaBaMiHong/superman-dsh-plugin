import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/elecfans/soft.ts
const route = {
	path: "/soft/:atype",
	categories: ["programming"],
	example: "/elecfans/soft/special",
	parameters: { atype: "需获取资料的类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "资料",
	radar: [{ source: ["www.elecfans.com"] }],
	maintainers: ["tian051011"],
	handler: async (ctx) => {
		const { atype } = ctx.req.param();
		const $ = load(await rofetch(`https://www.elecfans.com/soft/${atype}/`));
		const list = $("#mainContent li").toArray().map((item) => {
			item = $(item);
			const a = item.find("a").eq(1);
			return {
				title: a.text(),
				link: String(a.attr("href"))
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			item.pubDate = parseDate($(".data-info-content2021 .upload-date").eq(1).text());
			const userInfoApi = `https://www.elecfans.com/webapi/user/getSoftUserInfo?mid=${$("#filed_mid2021").first().text()}`;
			item.author = await cache_default.tryGet(userInfoApi, async () => {
				return (await rofetch(userInfoApi)).data.uname;
			});
			item.description = $(".simditor-body").first().html();
			item.category = $(".nTags a > span").toArray().map((item) => $(item).text().trim());
			return item;
		})));
		return {
			title: `elecfans ${atype} softs`,
			link: `https://www.elecfans.com/soft/${atype}/`,
			item: items
		};
	}
};
//#endregion
export { route };
