import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sjtu/cs/tzgg.tsx
const host = "https://www.cs.sjtu.edu.cn";
const ajaxUrl = `${host}/active/ajax_type_list.html`;
const categoryMap = {
	bkspy: {
		name: "本科生培养",
		code: "notice-xssw-bkspy"
	},
	yjspy: {
		name: "研究生培养",
		code: "notice-xssw-yjspy"
	},
	gjjl: {
		name: "国际交流",
		code: "notice-xssw-gjjl"
	},
	djdy: {
		name: "党建德育",
		code: "notice-xssw-djdy"
	},
	txgz: {
		name: "团学工作",
		code: "notice-xssw-txgz"
	},
	zyfz: {
		name: "职业发展",
		code: "notice-xssw-zyfz"
	},
	qt: {
		name: "其他",
		code: "notice-xssw-qt"
	}
};
function absolutize(url) {
	if (!url) return "";
	return new URL(url, host).href;
}
function parseListing(json) {
	const $ = load(json.content);
	return $("li").toArray().map((el) => {
		const $a = $(el).find("> a");
		const link = absolutize($a.attr("href"));
		const title = $a.find(".tit").text().trim();
		const day = $a.find(".time p").text().trim();
		return {
			title,
			link,
			date: `${$a.find(".time span").text().trim()}-${day}`
		};
	}).filter((it) => it.link && it.title);
}
function enrichItem(item) {
	return cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		const $body = $("div.xw-cont");
		const $txt = $body.find(".txt");
		$txt.find("img").each((_, e) => {
			const src = $(e).attr("src") || $(e).attr("_src");
			if (src) $(e).attr("src", absolutize(src));
		});
		$txt.find("a").each((_, e) => {
			const href = $(e).attr("href");
			if (href) $(e).attr("href", absolutize(href));
		});
		const publishedMatch = $body.find(".jj p").first().text().match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
		let pubDate;
		if (publishedMatch) {
			const [, y, m, d] = publishedMatch;
			pubDate = timezone(parseDate(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`, "YYYY-MM-DD"), 8);
		}
		return {
			title: item.title,
			link: item.link,
			description: $txt.html() ?? "",
			pubDate: pubDate ?? timezone(parseDate(item.date, "YYYY-MM-DD"), 8)
		};
	});
}
const route = {
	path: "/cs/tzgg/:category",
	categories: ["university"],
	example: "/sjtu/cs/tzgg/bkspy",
	parameters: { category: "通知类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: Object.entries(categoryMap).map(([key, { code }]) => ({
		source: [`www.cs.sjtu.edu.cn/${code}.html`],
		target: `/cs/tzgg/${key}`
	})),
	name: "计算机学院 - 通知公告",
	maintainers: ["BeaCox"],
	handler,
	url: "www.cs.sjtu.edu.cn/notice-xssw-bkspy.html",
	description: `| 本科生培养 | 研究生培养 | 国际交流 | 党建德育 | 团学工作 | 职业发展 | 其他 |
| ---------- | ---------- | -------- | -------- | -------- | -------- | ---- |
| bkspy      | yjspy      | gjjl     | djdy     | txgz     | zyfz     | qt   |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const cat = categoryMap[category];
	if (!cat) throw new Error(`Unknown category: ${category}. Valid: ${Object.keys(categoryMap).join(", ")}`);
	const listLink = `${host}/${cat.code}.html`;
	const items = parseListing(await rofetch(ajaxUrl, {
		method: "POST",
		body: new URLSearchParams({
			page: "1",
			cat_code: cat.code,
			type: "",
			search: "",
			extend_id: "0",
			template: "ajax_news_list1_search"
		}),
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		parseResponse: JSON.parse
	}));
	const dataItems = (await Promise.allSettled(items.map((it) => enrichItem(it)))).map((result, index) => result.status === "fulfilled" ? result.value : {
		title: items[index].title,
		link: items[index].link,
		pubDate: timezone(parseDate(items[index].date, "YYYY-MM-DD"), 8)
	});
	return {
		title: `上海交通大学计算机学院 - 通知公告 - ${cat.name}`,
		link: listLink,
		description: `上海交通大学计算机学院（网络空间安全学院、密码学院）通知公告 - ${cat.name}`,
		language: "zh-CN",
		allowEmpty: true,
		item: dataItems
	};
}
//#endregion
export { route };
