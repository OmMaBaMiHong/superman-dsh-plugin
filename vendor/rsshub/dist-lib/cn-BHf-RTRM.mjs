import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/mckinsey/cn/category-map.ts
const categories = {
	2: {
		name: "汽车",
		slug: "autos"
	},
	3: {
		name: "金融服务",
		slug: "banking-insurance"
	},
	4: {
		name: "消费者",
		slug: "consumers"
	},
	5: {
		name: "医药与医疗",
		slug: "healthcare-pharmaceuticals"
	},
	7: {
		name: "数字化",
		slug: "business-technology"
	},
	8: {
		name: "制造业",
		slug: "manufacturing"
	},
	10: {
		name: "技术，媒体与通信",
		slug: "technology-media-and-telecom"
	},
	12: {
		name: "城市化与可持续发展",
		slug: "urbanization-sustainability"
	},
	13: {
		name: "创新",
		slug: "innovation"
	},
	16: {
		name: "人才与领导力",
		slug: "talent-leadership"
	},
	18: {
		name: "宏观经济",
		slug: "macroeconomy"
	},
	19: {
		name: "麦肯锡全球研究院",
		slug: "mckinsey-global-institute"
	},
	25: {
		name: "洞见",
		slug: "insights"
	},
	41: {
		name: "资本项目和基础设施",
		slug: "capital-projects-infrastructure"
	},
	42: {
		name: "旅游、运输和物流",
		slug: "交通运输与物流"
	},
	19139: {
		name: "出海与国际化、转型",
		slug: "出海与国际化、转型"
	},
	45: {
		name: "全球基础材料",
		slug: "全球基础材料"
	}
};
//#endregion
//#region lib/routes/mckinsey/cn/index.ts
const baseUrl = "https://www.mckinsey.com.cn";
const route = {
	path: "/cn/:category?",
	categories: ["finance"],
	view: 0,
	example: "/mckinsey/cn",
	parameters: { category: {
		description: "分类，留空为 `最新洞见`",
		options: Object.values(categories).map((label) => ({
			value: label.slug,
			label: label.name
		})),
		default: "最新洞见"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "洞见",
	maintainers: ["laampui"],
	handler,
	description: `| 分类                            | 分类名             |
| ------------------------------- | ------------------ |
|                                 | 全部洞见           |
| autos                           | 汽车               |
| banking-insurance               | 金融服务           |
| consumers                       | 消费者             |
| healthcare-pharmaceuticals      | 医药与医疗         |
| business-technology             | 数字化             |
| manufacturing                   | 制造业             |
| technology-media-and-telecom    | 技术，媒体与通信   |
| urbanization-sustainability     | 城市化与可持续发展 |
| innovation                      | 创新               |
| talent-leadership               | 人才与领导力       |
| macroeconomy                    | 宏观经济           |
| mckinsey-global-institute       | 麦肯锡全球研究院   |
| capital-projects-infrastructure | 资本项目和基础设施 |
| 交通运输与物流                  | 旅游、运输和物流   |
| 出海与国际化、转型              | 出海与国际化、转型 |
| 全球基础材料                    | 全球基础材料       |`
};
async function handler(ctx) {
	const { category = "25" } = ctx.req.param();
	let categorySlug = "";
	if (category === "25") {} else if (Object.hasOwn(categories, category)) categorySlug = categories[category].slug;
	else {
		const c = Object.values(categories).find((c) => c.slug === category);
		categorySlug = c ? c.slug : "";
	}
	const link = `${baseUrl}/insights/${categorySlug ? `${categorySlug}/` : ""}`;
	const headers = {
		"accept-language": "en-US,en;q=0.9",
		"sec-fetch-dest": "document",
		"sec-fetch-mode": "navigate",
		"sec-fetch-site": "none"
	};
	const $ = load(await rofetch(link, { headers }));
	const list = $(".fl-post-grid-post").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("h2 a");
		return {
			title: a.attr("title"),
			description: $item.find(".fl-post-grid-content").html()?.trim(),
			link: a.attr("href"),
			pubDate: $item.find("[itemprop=\"datePublished\"]").length ? parseDate($item.find("[itemprop=\"datePublished\"]").attr("content")) : void 0
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link, { headers }));
		item.description = $(".ast-post-format-").html() || item.description;
		item.guid = $("link[rel=\"shortlink\"]").attr("href");
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		image: $("meta[name=\"msapplication-TileImage\"]").attr("content"),
		item: items
	};
}
//#endregion
export { route };
