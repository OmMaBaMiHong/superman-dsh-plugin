import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/douban/book/latest.ts
const linkUrl = "https://book.douban.com/latest";
const baseUrl = "https://m.douban.com/rexxar/api/v2/subject_collection";
const params = "items?start=0&count=10&mode=collection&for_mobile=1";
const route = {
	path: "/book/latest/:type?",
	categories: ["social-media"],
	example: "/douban/book/latest/fiction",
	parameters: { type: "专题分类，可选，默认为 `all`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新书速递",
	maintainers: ["fengkx", "lyqluis"],
	description: `| 文学          | 小说    | 历史文化 | 社会纪实  | 科学新知 | 艺术设计 | 商业经管 | 绘本漫画 |
| ------------- | ------- | -------- | --------- | -------- | -------- | -------- | -------- |
| prose\\_poetry | fiction | history  | biography | science  | art      | business | comics   |`,
	handler
};
const SUBCATS = {
	all: "全部",
	prose_poetry: "文学",
	fiction: "小说",
	history: "历史文化",
	biography: "社会纪实",
	science: "科学新知",
	art: "艺术设计",
	business: "商业经管",
	comics: "绘本漫画"
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "all";
	const subUrl = `new_book_${type}`;
	const url = `${baseUrl}/${subUrl}/${params}`;
	const items = (await got_default.get(url)).data.items;
	return {
		title: `豆瓣新书速递${type === "all" ? "" : "-" + SUBCATS[type]}`,
		link: `${linkUrl}${type === "all" ? "" : "?subcat=" + SUBCATS[type]}`,
		item: items.map(({ title, url, card_subtitle, cards, pic, rating, null_rating_reason }) => {
			const rate = rating.value ? `${rating.value}分` : null_rating_reason;
			return {
				title,
				description: `${`<img src="${pic.normal}">`}<br>${title}<br><br>${card_subtitle}<br><br>${cards[0]?.content ?? ""}<br><br>${rate}`,
				link: url
			};
		})
	};
}
//#endregion
export { route };
