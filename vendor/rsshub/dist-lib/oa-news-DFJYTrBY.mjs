import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import { CookieJar } from "tough-cookie";
import pMap from "p-map";
//#region lib/routes/gdut/oa-news.ts
const site = "https://oas.gdut.edu.cn/seeyon";
const typeMap = {
	department: {
		id: "-288156881891407086",
		name: "部处简讯"
	},
	academy: {
		id: "-6133000885854714423",
		name: "学院简讯"
	},
	notice: {
		id: "2945931106835317958",
		name: "校内通知"
	},
	announcement: {
		id: "906433874899913754",
		name: "公示公告"
	},
	tender_result: {
		id: "-1226046021292568614",
		name: "招标结果"
	},
	tender_invite: {
		id: "-3656117696093796045",
		name: "招标公告"
	}
};
function getArg(type) {
	return JSON.stringify([{
		page: 1,
		size: 50
	}, {
		subject: "",
		departmentName: "",
		newsType: type ? type.id : "",
		startDate: "",
		endDate: "",
		canLogin: "true"
	}]);
}
const route = {
	path: "/oa_news/:type?",
	categories: ["university"],
	example: "/gdut/oa_news/notice",
	parameters: { type: "通知类型，留空则获取所有分类" },
	feature: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["oas.gdut.edu.cn/seeyon"],
		target: "/oa_news/"
	}],
	name: "通知公文网",
	maintainers: [
		"jim-kirisame",
		"GamerNoTitle",
		"Richard-Zheng"
	],
	handler,
	url: "oas.gdut.edu.cn/seeyon",
	description: `学校可能会因为 IP 来源非学校而做出一定的限制，建议在校内网络环境下使用 RSS 阅读器订阅。

| 类型     | 参数           | 可能需要校内访问 |
| -------- | -------------- | ---------------- |
| 部处简讯 | department     | 是               |
| 学院简讯 | academy        | 是               |
| 校内通知 | notice         | 是               |
| 公示公告 | announcement   | 是               |
| 招标结果 | tender\\_result | 否               |
| 招标公告 | tender\\_invite | 否               |`
};
async function handler(ctx) {
	const typeParam = ctx.req.param("type") ?? "notice";
	if (typeMap[typeParam] === void 0) throw new Error("通知类型" + typeParam + "未定义");
	const type = typeMap[typeParam];
	const cookieJar = new CookieJar();
	await got_default("https://oas.gdut.edu.cn/seeyon/ggIP.do?method=portalSeachMore&subject=&departmentName=&newsType=&startDate=&endDate=", { cookieJar });
	const resp = await got_default.post("https://oas.gdut.edu.cn/seeyon/ajax.do?method=ajaxAction&managerName=ggManager&rnd=1", {
		cookieJar,
		form: {
			managerMethod: "kkFindListDatas",
			arguments: getArg(type)
		}
	});
	if (!resp.data.data) throw new Error("文章列表获取失败，可能是被临时限制了访问，请稍后重试\n" + JSON.stringify(resp.data));
	const results = await pMap(resp.data.data.map((item) => ({
		title: item.title,
		guid: item.id,
		link: "https://oas.gdut.edu.cn/seeyon/newsData.do?method=newsView&newsId=" + item.id,
		pubDate: timezone(parseDate(item.publishDate), 8),
		author: item.publishUserDepart,
		category: item.typeName
	})), async (data) => {
		const link = data.link;
		data.description = await cache_default.tryGet(link, async () => {
			const $ = load((await got_default(link, { cookieJar })).data);
			const node = $("#content");
			node.find("*").filter((_, el) => el.type === "comment" || el.tagName === "meta" || el.tagName === "style").remove();
			node.find("*").contents().filter((_, el) => el.type === "comment" || el.tagName === "meta" || el.tagName === "style").remove();
			node.find("*").each((_, el) => {
				if (el.attribs.style !== void 0) {
					const newSty = el.attribs.style.split(";").filter((s) => {
						const styBlocklist = [
							"color:rgb(0,0,0)",
							"color:black",
							"background:rgb(255,255,255)",
							"background:white",
							"text-align:left",
							"text-align:justify",
							"font-style:normal",
							"font-weight:normal"
						];
						const styPrefixBlocklist = [
							"font-family",
							"font-size",
							"background",
							"text-autospace",
							"text-transform",
							"letter-spacing",
							"line-height",
							"padding",
							"margin",
							"text-justify",
							"word-break",
							"vertical-align",
							"mso-",
							"-ms-"
						];
						const sty = s.trim();
						if (styBlocklist.includes(sty.replaceAll(/\s+/g, ""))) return false;
						for (const prefix of styPrefixBlocklist) if (sty.startsWith(prefix)) return false;
						return true;
					}).join(";");
					if (newSty) el.attribs.style = newSty;
					else delete el.attribs.style;
				}
				if (el.attribs.class && el.attribs.class.trim().startsWith("Mso")) delete el.attribs.class;
				if (el.attribs.lang) delete el.attribs.lang;
				if (el.tagName === "font" || el.tagName === "o:p") $(el).replaceWith(el.childNodes);
				if (el.tagName === "span" && !el.attribs.style) $(el).replaceWith(el.childNodes);
			});
			node.find("span").each((_, el) => {
				if (el.childNodes.length === 0) $(el).remove();
			});
			return node.html();
		});
		return data;
	}, { concurrency: 2 });
	return {
		title: "广东工业大学通知公文网 - " + type.name,
		link: site,
		description: "广东工业大学通知公文网",
		item: results
	};
}
//#endregion
export { route };
