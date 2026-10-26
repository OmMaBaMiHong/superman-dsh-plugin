import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as NotFoundError } from "./not-found-BvVU2U31.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as processEmbedPDF } from "./embed-resource-Cq8LFxcF.mjs";
import { load } from "cheerio";
//#region lib/routes/nwnu/routes/department/postgraduate.ts
const WEBSITE_LOGO = "https://www.nwnu.edu.cn/_upload/tpl/02/d9/729/template729/favicon.ico";
const BASE_URL = "https://yjsy.nwnu.edu.cn/";
const COLUMNS = {
	"2701": {
		title: "招生工作（包括硕士、博士招生）",
		description: "研究生院招生信息（包含硕士招生和博士招生两个栏目）"
	},
	"2738": {
		title: "工作动态",
		description: "研究生院工作动态"
	},
	"2712": {
		title: "博士招生",
		description: "研究生院博士研究生招生信息"
	},
	"2713": {
		title: "硕士招生",
		description: "研究生院硕士研究生招生信息"
	},
	"2702": {
		title: "培养工作",
		description: "培养工作栏目信息汇总"
	},
	"2703": {
		title: "学科建设",
		description: "研究生院学科建设信息汇总"
	},
	"2704": {
		title: "学位工作",
		description: "研究生院学位工作栏目信息汇总"
	}
};
const handler = async (ctx) => {
	const columnParam = ctx.req.param("column");
	if (COLUMNS[columnParam] === void 0) throw new NotFoundError(`The column ${columnParam} does not exist`);
	const columnTitle = COLUMNS[columnParam].title;
	const columnDescription = COLUMNS[columnParam].description;
	const columnPageUrl = `https://yjsy.nwnu.edu.cn/${columnParam}/list.htm`;
	const { data: listResponse } = await got_default(columnPageUrl);
	const $ = load(listResponse);
	const itemLinks = $("#AjaxList > ul > li.a-list").toArray().map((element) => {
		const title = $(element).find("a:nth-child(2)").attr("title");
		const date = parseDate($(element).find("span.pdate").text());
		const relativeLink = $(element).find("a:nth-child(2)").attr("href");
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
			const CONTENT_SELECTOR = "div.content_div";
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
		feedLink: `https://rsshub.app/nwnu/department/postgraduate/${columnParam}`,
		id: `https://rsshub.app/nwnu/department/postgraduate/${columnParam}`
	};
};
const route = {
	path: "/department/postgraduate/:column",
	name: "研究生院",
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
	example: "/nwnu/department/postgraduate/2701",
	radar: [{
		source: ["yjsy.nwnu.edu.cn/:column/list.htm"],
		target: "/department/postgraduate/:column"
	}],
	description: `| column | 标题                           | 描述                                               |
| ------ | ------------------------------ | -------------------------------------------------- |
| 2701   | 招生工作（包括硕士、博士招生） | 研究生院招生信息（包含硕士招生和博士招生两个栏目） |
| 2712   | 博士招生                       | 研究生院博士研究生招生信息                         |
| 2713   | 硕士招生                       | 研究生院硕士研究生招生信息                         |
| 2702   | 培养工作                       | 培养工作栏目信息汇总                               |
| 2703   | 学科建设                       | 研究生院学科建设信息汇总                           |
| 2704   | 学位工作                       | 研究生院学位工作栏目信息汇总                       |`
};
//#endregion
export { route };
