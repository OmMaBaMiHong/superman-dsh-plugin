import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/data.ts
var data_default = { wh: {
	news: {
		name: "山东大学（威海）新闻网",
		route: "/news",
		source: ["/*path", "/"],
		titlePrefix: "(威海)新闻网|",
		docs: "https://docs.rsshub.app/routes/university#shan-dong-da-xue-wei-hai",
		getTarget: (url) => "/news/" + url.replace(/\.htm$/, ""),
		url: "https://xinwen.wh.sdu.edu.cn/",
		columns: {
			xyyw: {
				name: "校园要闻",
				url: "xyyw.htm"
			},
			xsdt: {
				name: "学生动态",
				url: "xsdt.htm"
			},
			zhxw: {
				name: "综合新闻",
				url: "zhxw.htm"
			},
			sdsd: {
				name: "山大视点",
				url: "sdsd.htm"
			},
			jjxy: {
				name: "菁菁校园",
				url: "jjxy.htm"
			},
			xyjx: {
				name: "校园简讯",
				url: "xyjx.htm"
			},
			mjzc: {
				name: "玛珈之窗",
				url: "mjzc.htm"
			},
			rdzt: {
				name: "热点专题",
				url: "rdzt.htm"
			},
			mtsj: {
				name: "媒体视角",
				url: "mtsj.htm"
			},
			gjsy: {
				name: "高教视野",
				url: "gjsy.htm"
			},
			llxx: {
				name: "理论学习",
				url: "llxx.htm"
			}
		}
	},
	jwc: {
		name: "山东大学（威海）教务处",
		route: "/jwc",
		source: ["/*path", "/"],
		titlePrefix: "(威海)教务处|",
		docs: "https://docs.rsshub.app/routes/university#shan-dong-da-xue-wei-hai",
		getTarget: (url) => "/jwc/" + url.replace(/\.htm$/, ""),
		url: "https://jwc.wh.sdu.edu.cn/",
		columns: {
			gzzd: {
				name: "规章制度",
				url: "gzzd.htm"
			},
			zyjs: {
				name: "专业建设",
				url: "zyjs.htm"
			},
			sjjx: {
				name: "实践教学",
				url: "sjjx.htm"
			},
			zbfc: {
				name: "支部风采",
				url: "zbfc.htm"
			},
			fwzn: {
				name: "服务指南",
				url: "fwzn.htm"
			},
			jwyw: {
				name: "教务要闻",
				url: "jwyw.htm"
			},
			gztz: {
				name: "工作通知",
				url: "gztz.htm"
			},
			jwjb: {
				name: "教务简报",
				url: "jwjb.htm"
			},
			cyxz: {
				name: "常用下载",
				url: "cyxz.htm"
			}
		}
	}
} };
//#endregion
//#region lib/routes/sdu/extractor/sdrj.ts
const sdrj = (link) => cache_default.tryGet(link, async () => {
	let content, author, exactDate;
	try {
		const $ = load((await got_default(link)).data);
		content = $("#vsb_content").html();
		author = $("form[name='_newscontent_fromname'] > h1").text();
		const exactDateText = $("form[name='_newscontent_fromname'] > p.info").text().trim().match(/^发布时间：(?<date>\d+\/\d+\/\d+\s\d{2}:\d{2}:\d{2})/).groups.date;
		exactDate = timezone(parseDate(exactDateText, "YYYY/MM/DD HH:mm:ss"), 8);
		return {
			description: content,
			author,
			exactDate
		};
	} catch {
		return {
			description: content,
			author,
			exactDate
		};
	}
});
//#endregion
//#region lib/routes/sdu/extractor/view.ts
const view = (link) => cache_default.tryGet(link, async () => {
	let content, author, exactDate;
	try {
		const $ = load((await got_default(link)).data);
		content = $("#vsb_content").html();
		author = $("form[name='_newscontent_fromname'] > div > p:last-of-type").text();
		const exactDateText = $(".news_tit > p:last-child").text().match(/^发布日期：(?<date>\d+年\d+月\d+日\s\d{2}:\d{2})/).groups.date;
		exactDate = timezone(parseDate(exactDateText, "YYYY年MM月DD日 HH:mm"), 8);
		return {
			description: content,
			author,
			exactDate
		};
	} catch {
		return {
			description: content,
			author,
			exactDate
		};
	}
});
//#endregion
//#region lib/routes/sdu/extractor/wh/jwc.ts
const jwc = (link) => cache_default.tryGet(link, async () => {
	let content, exactDate;
	try {
		const form = load((await got_default(link)).data)("form[name='_newscontent_fromname']");
		form.find("h2").remove();
		const exactDateElement = form.find("#author");
		const exactDateStr = exactDateElement.text();
		exactDateElement.remove();
		content = form.html();
		const exactDateText = exactDateStr.match(/^创建时间：(?<date>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/).groups.date;
		exactDate = timezone(parseDate(exactDateText, "YYYY-MM-DD HH:mm:ss"), 8);
		return {
			description: content,
			exactDate
		};
	} catch {
		return {
			description: content,
			exactDate
		};
	}
});
//#endregion
//#region lib/routes/sdu/extractor/wh/news.ts
const news = (link) => cache_default.tryGet(link, async () => {
	let content, author, exactDate;
	try {
		const $ = load((await got_default(link)).data);
		content = $("#main-content").html();
		author = $("#source").text();
		const exactDateText = $(".news_tit > p:last-child").text().match(/^发布日期：(?<date>\d+年\d+月\d+日\s\d{2}:\d{2})/).groups.date;
		exactDate = timezone(parseDate(exactDateText, "YYYY年MM月DD日 HH:mm"), 8);
		return {
			description: content,
			author,
			exactDate
		};
	} catch {
		return {
			description: content,
			author,
			exactDate
		};
	}
});
//#endregion
//#region lib/routes/sdu/extractor/index.ts
const index = (link) => {
	if (link.startsWith("https://xinwen.wh.sdu.edu.cn/")) return news(link);
	if (link.startsWith("https://www.view.sdu.edu.cn/")) return view(link);
	if (link.startsWith("https://www.sdrj.sdu.edu.cn/")) return sdrj(link);
	if (link.startsWith("https://jwc.wh.sdu.edu.cn/")) return jwc(link);
	return {};
};
//#endregion
export { data_default as n, index as t };
