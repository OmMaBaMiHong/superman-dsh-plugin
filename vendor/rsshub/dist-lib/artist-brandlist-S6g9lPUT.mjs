import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/ktown4u/artist-brandlist.ts
const route = {
	path: "/artistBrandlist/:grpNo/:grpNo2?",
	categories: ["shopping"],
	example: "/ktown4u/artistBrandlist/234590/1723449",
	parameters: {
		grpNo: "artist id (Get in url)",
		grpNo2: "product category id (Get in url), empty for all categories"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [],
		target: "/artistBrandlist/:grpNo/:grpNo2"
	}],
	name: "Get the products on sale",
	maintainers: ["JamesWDGu"],
	handler: async (ctx) => {
		const { grpNo, grpNo2 = "" } = ctx.req.param();
		const data = await rofetch(`https://cn.ktown4u.com/selectArtistBrandList?cateGrpNo=${grpNo2}&currentPage=1&goodsSearch=newgoods&grpNo=${grpNo}&searchType=ARTIST`, {
			method: "POST",
			headers: {
				accept: "application/json, text/plain, */*",
				"accept-language": "en,zh-CN;q=0.9,zh;q=0.8"
			},
			parseResponse: JSON.parse
		});
		const items = data.map((item) => ({
			title: item.GOODS_NM,
			url: item.IMG_PATH,
			link: `https://cn.ktown4u.com/iteminfo?goods_no=${item.GOODS_NO}`,
			description: desc(item),
			pubDate: parseDate(item.RELEASE_DT)
		}));
		return {
			title: rssTitle(data),
			link: `https://cn.ktown4u.com/artistBrandlist?grp_no=${grpNo}&grp_no2=${grpNo2}`,
			item: items
		};
	}
};
const rssTitle = (data) => `ktown4u ${data[0].GRP_NM}`;
const desc = (item) => {
	const saleState = item.SALE_YN === "N" ? "【售罄】" : "";
	let price = `${item.CURR_F_CD}${item.DISP_PRICE}`;
	if (item.DISP_PRICE !== item.DISP_DC_PRICE) price = `${item.CURR_F_CD}${item.DISP_DC_PRICE} / 原价：${price}`;
	return `${saleState} ${price} <br> <img src=${item.IMG_PATH}> <br> ${item.GOODS_NM}`;
};
//#endregion
export { route };
