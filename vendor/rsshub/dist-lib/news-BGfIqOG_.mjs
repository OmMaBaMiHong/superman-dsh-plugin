import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/shanghaimuseum/news.ts
const route = {
	path: "/information/news/:type?",
	categories: ["travel"],
	example: "/shanghaimuseum/information/news/all",
	parameters: { type: "News type, supported values: all (新闻与公告) | news (新闻动态) | bulletin (本馆公告) | finance (财务公开). Default: all." },
	name: "News & Announcements",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.shanghaimuseum.net/mu/frontend/pg/infomation/news"],
		target: "/information/news"
	}],
	handler: async (ctx) => {
		const type = ctx.req.param("type") || "all";
		const baseUrl = "https://www.shanghaimuseum.net";
		const apiUrl = `${baseUrl}/mu/frontend/pg/infomation/search-info`;
		const payload = {
			limit: 20,
			page: 1,
			params: { langCode: "CHINESE" }
		};
		let titleTag = "新闻与公告";
		switch (type) {
			case "news":
				Object.assign(payload.params, { infoTypeCodes: ["INFOMATION_TYPE_2"] });
				titleTag = "新闻动态";
				break;
			case "bulletin":
				Object.assign(payload.params, { infoTypeCodes: ["INFOMATION_TYPE_6"] });
				titleTag = "本馆公告";
				break;
			case "finance":
				Object.assign(payload.params, { bulletinInfoTypeCode: "BULLETIN_INFO_TYPE_5" });
				titleTag = "财务公开";
				break;
			default:
				Object.assign(payload.params, { infoTypeCodes: ["INFOMATION_TYPE_2", "INFOMATION_TYPE_6"] });
				break;
		}
		const items = (await got_default({
			method: "post",
			url: apiUrl,
			json: payload,
			headers: { referer: `${baseUrl}/mu/frontend/pg/infomation/news?type=${type}` }
		})).data.data.map((item) => {
			const itemLink = `${baseUrl}/mu/frontend/pg/article/id/${item.code}`;
			return {
				title: item.titleDecoded || item.title,
				pubDate: parseDate(item.issueTime),
				category: item.infoType?.entryItemName || item.bulletinInfoType?.entryItemName,
				link: itemLink
			};
		});
		return {
			title: `上海博物馆 - ${titleTag}`,
			link: `${baseUrl}/mu/frontend/pg/infomation/news?type=${type}`,
			language: "zh-CN",
			item: items
		};
	}
};
//#endregion
export { route };
