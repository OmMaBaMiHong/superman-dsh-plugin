import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/eastday/sh.ts
const route = {
	path: "/sh",
	categories: ["traditional-media"],
	example: "/eastday/sh",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sh.eastday.com/"] }],
	name: "上海新闻",
	maintainers: ["saury"],
	handler,
	url: "sh.eastday.com/"
};
async function handler() {
	const domain = "http://wap.eastday.com";
	const response = await got_default({
		method: "get",
		url: "https://apin.eastday.com/apiplus/special/specialnewslistbyurl?specialUrl=1632798465040016&skipCount=0&limitCount=20"
	});
	const result = await Promise.all(response.data.data.list.map(async (item) => {
		const link = item.url;
		const entity = {
			title: item.title,
			description: item.abstracts,
			pubDate: timezone(parseDate(item.time), 8),
			link
		};
		try {
			const cacheKey = `eastday_sh_${link}`;
			entity.description = await cache_default.tryGet(cacheKey, async () => {
				const $ = load((await got_default({
					method: "get",
					url: link
				})).body);
				return $(".article_wrapper .mainLayer .content").html() || $(".contentBox .article .detail").html();
			});
		} catch (error) {
			logger.error(error);
		}
		return entity;
	}));
	return {
		title: "东方网-上海",
		link: `${domain}/wap/sh.html`,
		item: result
	};
}
//#endregion
export { route };
