import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as NotFoundError } from "./not-found-BvVU2U31.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as processEmbedPDF } from "./embed-resource-Cq8LFxcF.mjs";
import { load } from "cheerio";
//#region lib/routes/nwnu/routes/department/academic-affairs.ts
const WEBSITE_LOGO = "https://www.nwnu.edu.cn/_upload/tpl/02/d9/729/template729/favicon.ico";
const BASE_URL = "https://jwc.nwnu.edu.cn/";
const COLUMNS = {
	tzgg: {
		title: "通知公告",
		description: "西北师范大学教务处通知公告"
	},
	jwkx: {
		title: "教务快讯",
		description: "西北师范大学教务快讯"
	}
};
const handler = async (ctx) => {
	const columnParam = ctx.req.param("column");
	if (COLUMNS[columnParam] === void 0) throw new NotFoundError(`The column ${columnParam} does not exist`);
	const columnTitle = COLUMNS[columnParam].title;
	const columnDescription = COLUMNS[columnParam].description;
	const columnPageUrl = `https://jwc.nwnu.edu.cn/${columnParam}/list.htm`;
	const { data: listResponse } = await got_default(columnPageUrl);
	const $ = load(listResponse);
	const itemLinks = $("div.list_index > ul > li").toArray().map((element) => {
		const title = $(element).find("span.f > a").text();
		const date = parseDate($(element).find("span.r").text());
		const relativeLink = $(element).find("span.f > a").attr("href");
		return {
			title,
			date,
			link: new URL(relativeLink, BASE_URL).href
		};
	});
	return {
		title: columnTitle,
		description: columnDescription,
		link: columnPageUrl,
		image: WEBSITE_LOGO,
		item: await Promise.all(itemLinks.map((item) => cache_default.tryGet(item.link, async () => {
			const CONTENT_SELECTOR = "div.wp_articlecontent";
			const { data: contentResponse } = await got_default(item.link);
			const contentPage = load(contentResponse);
			const content = processEmbedPDF(BASE_URL, contentPage(CONTENT_SELECTOR).html() || "");
			return {
				title: item.title,
				pubDate: item.date,
				link: item.link,
				description: content,
				category: ["university"],
				guid: item.link,
				id: item.link,
				image: WEBSITE_LOGO,
				content,
				updated: item.date,
				language: "zh-CN"
			};
		}))),
		allowEmpty: true,
		language: "zh-CN",
		feedLink: `https://rsshub.app/nwnu/department/academic-affairs/${columnParam}`,
		id: `https://rsshub.app/nwnu/department/academic-affairs/${columnParam}`
	};
};
const route = {
	path: "/department/academic-affairs/:column",
	name: "教务处",
	maintainers: ["PrinOrange"],
	handler,
	categories: ["university"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportRadar: true,
		supportPodcast: false,
		supportScihub: false
	},
	example: "/nwnu/department/academic-affairs/tzgg",
	radar: [{
		source: ["jwc.nwnu.edu.cn/:column/list.htm"],
		target: "/department/academic-affairs/:column"
	}],
	description: `| column | 标题     | 描述                     |
| ------ | -------- | ------------------------ |
| tzgg   | 通知公告 | 西北师范大学教务通知公告 |
| jwkx   | 教务快讯 | 西北师范大学教务快讯     |`
};
//#endregion
export { route };
