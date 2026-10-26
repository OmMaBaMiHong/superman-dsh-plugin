import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import querystring from "node:querystring";
//#region lib/routes/scut/jwc/notice.ts
const baseUrl = "http://jw.scut.edu.cn";
const refererUrl = "http://jw.scut.edu.cn/dist/";
const listPageUrl = "http://jw.scut.edu.cn/zhinan/cms/toPosts.do";
const listApiUrl = "http://jw.scut.edu.cn/zhinan/jw/api/v2/findInformNotice.do";
const articleApiUrl = "http://jw.scut.edu.cn/zhinan/jw/api/v2/getArticleInfo.do";
const getArticleUrlById = (id) => `${baseUrl}/zhinan/cms/article/view.do?type=posts&id=${id}`;
const getArticleMobileUrlById = (id) => `${baseUrl}/dist/#/detail/index?id=${id}&type=notice`;
const categoryMap = {
	all: {
		title: "全部",
		tag: "0"
	},
	course: {
		title: "选课",
		tag: "1"
	},
	exam: {
		title: "考试",
		tag: "2"
	},
	practice: {
		title: "实践",
		tag: "3"
	},
	communication: {
		title: "交流",
		tag: "4"
	},
	teacher: {
		title: "教师",
		tag: "5"
	},
	info: {
		title: "信息",
		tag: "6"
	}
};
const convertTimezoneToCST = (date) => {
	const timeZone = 8;
	const serverOffset = date.getTimezoneOffset() / 60;
	return /* @__PURE__ */ new Date(date.getTime() - 3600 * 1e3 * (timeZone + serverOffset));
};
const generateArticlePubDate = (createDateStr) => {
	const date = new Date(createDateStr);
	date.setHours(8);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return convertTimezoneToCST(date);
};
const isRedirectPage = (data) => !!data.link;
const resolveRelativeUrl = (html) => html.replaceAll("src=\"/", () => `src="${new URL(".", baseUrl).href}`).replaceAll("href=\"/", () => `href="${new URL(".", baseUrl).href}`);
const apiSuccessAssert = (data) => {
	if (!data.success) throw new Error("article api error");
};
const generateArticleLink = (id) => `<p>链接：<a href="${getArticleUrlById(id)}">电脑版</a>&nbsp;|&nbsp;<a href="${getArticleMobileUrlById(id)}">手机版</a></p>`;
const generateArticleFullText = (data) => resolveRelativeUrl(data.content) + generateArticleLink(data.id);
const route = {
	path: "/jwc/notice/:category?",
	categories: ["university"],
	example: "/scut/jwc/notice/all",
	parameters: { category: "通知分类，默认为 `all`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处通知公告",
	maintainers: ["imkero"],
	handler,
	description: `| 全部 | 选课   | 考试 | 实践     | 交流          | 教师    | 信息 |
| ---- | ------ | ---- | -------- | ------------- | ------- | ---- |
| all  | course | exam | practice | communication | teacher | info |`
};
async function handler(ctx) {
	const categoryName = ctx.req.param("category") || "all";
	const categoryMeta = categoryMap[categoryName];
	const qs = querystring.stringify({
		pageNo: 1,
		pageSize: 20,
		tag: categoryMeta.tag
	});
	const listApiResponse = await got_default({
		method: "post",
		url: `${listApiUrl}?${qs}`,
		headers: { Referer: refererUrl }
	});
	apiSuccessAssert(listApiResponse.data);
	const articleMetaArray = listApiResponse.data.data.list;
	const out = await Promise.all(articleMetaArray.map(async (articleMeta) => {
		const articleUrl = getArticleUrlById(articleMeta.id);
		const cacheIn = await cache_default.get(articleUrl);
		if (cacheIn) return JSON.parse(cacheIn);
		const qs = querystring.stringify({
			id: articleMeta.id,
			categoryType: ""
		});
		const articleApiResponse = await got_default({
			method: "post",
			url: `${articleApiUrl}?${qs}`,
			headers: { Referer: refererUrl }
		});
		apiSuccessAssert(articleApiResponse.data);
		const articleData = articleApiResponse.data.data;
		articleData.id = articleMeta.id;
		let articleFullText = null;
		if (!isRedirectPage(articleData)) articleFullText = generateArticleFullText(articleData);
		const item = {
			title: articleData.name,
			link: articleUrl,
			description: articleFullText,
			pubDate: generateArticlePubDate(articleData.createDate).toUTCString()
		};
		cache_default.set(articleUrl, JSON.stringify(item));
		return item;
	}));
	return {
		title: "华南理工大学教务处通知公告 - " + categoryMeta.title,
		link: listPageUrl,
		item: out
	};
}
//#endregion
export { route };
