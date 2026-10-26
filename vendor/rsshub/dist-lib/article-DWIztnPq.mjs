import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wyzxwk/article.ts
const route = {
	path: "/article/:id?",
	categories: ["new-media"],
	example: "/wyzxwk/article/shushe",
	parameters: { id: "栏目 id，可在栏目页 URL 中找到，默认为时代观察" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wyzxwk.com/Article/:id", "wyzxwk.com/"] }],
	name: "栏目",
	maintainers: ["nczitzk"],
	handler,
	description: `时政

| 时代观察 | 舆论战争 |
| -------- | -------- |
| shidai   | yulun    |

经济

| 经济视点 | 社会民生 | 三农关注 | 产业研究 |
| -------- | -------- | -------- | -------- |
| jingji   | shehui   | sannong  | chanye   |

国际

| 国际纵横 | 国防外交 |
| -------- | -------- |
| guoji    | guofang  |

思潮

| 理想之旅 | 思潮碰撞 | 文艺新生 | 读书交流 |
| -------- | -------- | -------- | -------- |
| lixiang  | sichao   | wenyi    | shushe   |

历史

| 历史视野 | 中华文化 | 中华医药 | 共产党人 |
| -------- | -------- | -------- | -------- |
| lishi    | zhonghua | zhongyi  | cpers    |

争鸣

| 风华正茂 | 工农之声 | 网友杂谈 | 网友时评 |
| -------- | -------- | -------- | -------- |
| qingnian | gongnong | zatan    | shiping  |

活动

| 乌有公告 | 红色旅游 | 乌有讲堂  | 书画欣赏 |
| -------- | -------- | --------- | -------- |
| gonggao  | lvyou    | jiangtang | shuhua   |`
};
async function handler(ctx) {
	const currentUrl = `http://www.wyzxwk.com/Article/${ctx.req.param("id") ?? "shidai"}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".g-sd").remove();
	let items = $("h3 a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.indexOf("wyzxwk.com") > 0) try {
			const detailResponse = await got_default({
				method: "get",
				url: item.link
			});
			const content = load(detailResponse.data);
			content(".zs-modal-body").prev().nextAll().remove();
			const pubDate = detailResponse.data.match(/<span class="s-grey-3">(\d{4}-\d{2}-\d{2})<\/span>/);
			if (pubDate) item.pubDate = parseDate(pubDate[1], "YYYY-MM-DD");
			item.description = content("article").html();
		} catch {
			item.description = "";
		}
		return item;
	})));
	return {
		title: `${$("title").text().split(" - ", 1)[0]} - 乌有之乡网刊`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
