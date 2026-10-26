import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/eastday/24.ts
const categories = {
	社会: "shehui",
	娱乐: "yule",
	国际: "guoji",
	军事: "junshi",
	养生: "yangsheng",
	汽车: "qiche",
	体育: "tiyu",
	财经: "caijing",
	游戏: "youxi",
	科技: "keji",
	国内: "guonei",
	宠物: "chongwu",
	情感: "qinggan",
	人文: "renwen",
	教育: "jiaoyu"
};
const route = {
	path: "/24/:category?",
	categories: ["traditional-media"],
	example: "/eastday/24",
	parameters: { category: "分类，见下表，默认为社会" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["mini.eastday.com/"],
		target: "/24"
	}],
	name: "24 小时热闻",
	maintainers: ["nczitzk"],
	handler,
	url: "mini.eastday.com/",
	description: `| 推荐 | 社会 | 娱乐 | 国际 | 军事 |
| ---- | ---- | ---- | ---- | ---- |

| 养生 | 汽车 | 体育 | 财经 | 游戏 |
| ---- | ---- | ---- | ---- | ---- |

| 科技 | 国内 | 宠物 | 情感 | 人文 | 教育 |
| ---- | ---- | ---- | ---- | ---- | ---- |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "社会";
	const rootUrl = "https://mini.eastday.com";
	const response = await got_default({
		method: "get",
		url: `${rootUrl}/ns/api/detail/trust/trust-news-${categories[category]}.json`
	});
	const list = JSON.parse(response.data.match(/\((.*)\)/)[1]).data.trust.map((item) => ({
		title: item.topic,
		link: `${rootUrl}${item.url}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		const pageNumber = Number.parseInt(detailResponse.data.match(/var page_num = '(\d+)'/)[1]);
		item.description = content("#J-contain_detail_cnt").html();
		item.pubDate = timezone(parseDate(content("meta[property=\"og:release_date\"]").attr("content")), 8);
		if (pageNumber > 1) {
			const links = [];
			for (let i = 2; i <= pageNumber; i++) links.push(item.link.replace(/\.html/, () => `-${i}.html`));
			for (const link of links) cache_default.tryGet(link, async () => {
				const subContent = load((await got_default({
					method: "get",
					url: link
				})).data);
				subContent("img").each((_, el) => {
					subContent(el).attr("src", subContent(el).attr("data-url"));
				});
				item.description += subContent("#J-contain_detail_cnt").html();
			});
		}
		return item;
	})));
	return {
		title: `24小时${category}热闻 - 东方资讯`,
		link: `${rootUrl}/#${categories[category]}`,
		item: items
	};
}
//#endregion
export { route };
