import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-CMHIYLf3.mjs";
import { load } from "cheerio";
//#region lib/routes/cde/zdyz.ts
const baseUrl = "https://www.cde.org.cn";
const zdyzMap = { zdyz: {
	domesticGuide: {
		title: "发布通告",
		url: `${baseUrl}/zdyz/listpage/2853510d929253719601db17b8a9fd81`,
		endPoint: "/zdyz/getDomesticGuideList",
		form: {
			pageNum: 1,
			pageSize: 10,
			searchTitle: "",
			isFbtg: 1,
			classid: "2853510d929253719601db17b8a9fd81",
			issueDate1: "",
			issueDate2: ""
		}
	},
	opinionList: {
		title: "征求意见",
		url: `${baseUrl}/zdyz/listpage/3c49fad55caad7a034c263cfc2b6eb9c`,
		endPoint: "/zdyz/getOpinionList",
		form: {
			pageNum: 1,
			pageSize: 10,
			searchTitle: "",
			issueDate1: "",
			issueDate2: "",
			fclass: "征求意见"
		}
	}
} };
const route = {
	path: "/zdyz/:category",
	categories: ["government"],
	example: "/cde/zdyz/domesticGuide",
	parameters: { category: "类别，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "指导原则专栏",
	maintainers: ["TonyRL"],
	handler,
	description: `|    发布通告   |   征求意见  |
| :-----------: | :---------: |
| domesticGuide | opinionList |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const { data } = await got_default.post(`${baseUrl}${zdyzMap.zdyz[category].endPoint}`, {
		form: zdyzMap.zdyz[category].form,
		headers: {
			referer: zdyzMap.zdyz[category].url,
			cookie: await utils_default.getCookie(ctx)
		}
	});
	const list = data.data.records.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.issueDate),
		link: item.externalLinks
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link, { headers: {
			referer: zdyzMap.zdyz[category].url,
			cookie: await utils_default.getCookie(ctx)
		} })).data);
		item.description = $(".new_detail_content").html() + $(".relatedNews").html();
		return item;
	})));
	return {
		title: `${zdyzMap.zdyz[category].title} - 国家药品监督管理局药品审评中心`,
		link: zdyzMap.zdyz[category].url,
		item: items
	};
}
//#endregion
export { route };
