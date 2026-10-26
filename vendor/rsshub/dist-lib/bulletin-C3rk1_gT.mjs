import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/bulletin.ts
const baseTitle = "南信大信息公告栏";
const rootUrl = "https://bulletin.nuist.edu.cn";
const map = {
	default: {
		file: "index.htm",
		title: "全部"
	},
	wjgg: {
		file: "wjgg.htm",
		title: "文件公告"
	},
	zbxx: {
		file: "zbxx.htm",
		title: "招标信息"
	},
	xsbg: {
		file: "xsbg.htm",
		title: "学术报告"
	},
	dzsw: {
		file: "dzsw.htm",
		title: "党政事务"
	},
	jxks: {
		file: "jxks.htm",
		title: "教学考试"
	},
	hytz: {
		file: "hytz.htm",
		title: "会议通知"
	},
	zzrs: {
		file: "zzrs.htm",
		title: "组织人事"
	},
	kyxx: {
		file: "kyxx.htm",
		title: "科研信息"
	},
	zsjy: {
		file: "zsjy.htm",
		title: "招生就业"
	},
	cxcy: {
		file: "cxcy.htm",
		title: "创新创业"
	},
	xyhd: {
		file: "xyhd.htm",
		title: "校园活动"
	},
	xydt: {
		file: "xydt.htm",
		title: "学院动态"
	},
	ztjz: {
		file: "ztjz.htm",
		title: "专题讲座"
	}
};
const route = {
	path: "/bulletin/:category?",
	categories: ["university"],
	example: "/nuist/bulletin/wjgg",
	parameters: { category: "分类名，默认为 `default` (全部)，支持 wjgg, kyxx 等拼音缩写" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["bulletin.nuist.edu.cn/:filename"],
		target: (params) => {
			const filename = params.filename.replace(/\.htm$/i, "");
			return `/nuist${filename === "index" ? "/bulletin" : `/bulletin/${filename}`}`;
		}
	}],
	name: "南信大信息公告栏",
	maintainers: ["gylidian", "QianYu-u"],
	handler,
	description: `| 参数    | 含义                         |
| :------ | :--------------------------- |
| default | 全部                         |
| wjgg    | 文件公告                     |
| kyxx    | 科研信息                     |
| zbxx    | 招标信息                     |
| jxks    | 教学考试                     |
| dzsw    | 党政事务                     |
| ...     | (支持官网对应栏目的拼音简写) |

::: warning
全文内容需使用 校园网或[VPN](http://vpn.nuist.edu.cn) 获取
:::`
};
async function handler(ctx) {
	const type = ctx.req.param("category") || "default";
	const info = map[type] || map.default;
	const link = `${rootUrl}/${info.file}`;
	const $ = load((await got_default(link)).data);
	const list = $("li.news").toArray().map((element) => {
		const item = $(element);
		const a = item.find(".btt a").first();
		const href = a.attr("href");
		if (!href) return null;
		const title = a.attr("title") || a.text().trim();
		const linkUrl = new URL(href, rootUrl).href;
		const dateMatch = item.text().match(/(\d{4}-\d{2}-\d{2})/);
		const pubDate = dateMatch ? parseDate(dateMatch[1]) : null;
		const category = item.find(".wjj a").attr("title") || item.find(".wjj a").text().trim() || info.title;
		return {
			title,
			link: linkUrl,
			pubDate,
			author: item.find(".arti_bm a").text().trim(),
			category
		};
	}).filter((item) => item && item.title && item.pubDate);
	return {
		title: `${baseTitle} - ${info.title}`,
		link,
		item: list
	};
}
//#endregion
export { route };
