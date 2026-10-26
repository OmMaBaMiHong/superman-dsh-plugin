import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/likeshop/index.ts
const route = {
	path: "/:site",
	categories: ["social-media"],
	example: "/likeshop/nytimes",
	parameters: { site: "the site attached to likeshop.me/" },
	radar: [{ source: ["likeshop.me/"] }],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Posts",
	maintainers: ["nickyfoto"],
	handler,
	description: "LikeShop link in bio takes your audience from Instagram and TikTok to your website in one easy step."
};
async function handler(ctx) {
	const site = ctx.req.param("site");
	const items = (await rofetch(`https://api.likeshop.me/api/accounts/${site}/galleries/likeshop`)).data.media.map((item) => ({
		title: item.title === "-" ? item.comment : item.title,
		link: item.product_url.split("?", 1)[0],
		description: `<p><img src="${item.image_url.split("?", 1)[0]}"></p>${item.comment ? `<p>${item.comment}</p>` : ""}`,
		guid: item.id
	}));
	return {
		title: `@${site} Likeshop`,
		link: `https://likeshop.me/${site}`,
		item: items
	};
}
//#endregion
export { route };
