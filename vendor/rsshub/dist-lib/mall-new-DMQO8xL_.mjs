import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bilibili/mall-new.ts
const resolveImageUrl = (imageUrl) => imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl;
const route = {
	path: "/mall/new/:category?",
	categories: ["social-media"],
	example: "/bilibili/mall/new/1",
	parameters: { category: "分类，默认全部，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "会员购新品上架",
	maintainers: ["DIYgod"],
	handler,
	description: `| 全部 | 手办 | 魔力赏 | 周边 | 游戏 |
| ---- | ---- | ------ | ---- | ---- |
| 0    | 1    | 7      | 3    | 6    |`
};
async function handler(ctx) {
	const response = await got_default({
		method: "get",
		url: `https://mall.bilibili.com/mall-c-search/home/new_items/list?pageNum=1&pageSize=20&version=1.0&cityId=0&cateType=${ctx.req.param("category") || 0}`,
		headers: { Referer: "https://mall.bilibili.com/newdate.html?noTitleBar=1&page=new&from=new_product&loadingShow=1" }
	});
	const days = response.data.data.vo.days;
	const items = [];
	for (const day of days) items.push(...day.presaleItems);
	return {
		title: `会员购新品上架-${response.data.data.vo.cateTabs.find((item) => item.cateType === response.data.data.vo.currentCateType).cateName}`,
		link: "https://mall.bilibili.com/newdate.html?noTitleBar=1&page=new&from=new_product&loadingShow=1",
		item: items.map((item) => ({
			title: item.name,
			description: `${item.name}<br>${item.priceDesc ? `${item.pricePrefix}${item.priceSymbol}${item.priceDesc[0]}` : ""}<br><img src="${resolveImageUrl(item.img)}"><br><a href="${item.itemUrl}">APP 内打开</a>`,
			link: item.itemUrlForH5
		}))
	};
}
//#endregion
export { route };
