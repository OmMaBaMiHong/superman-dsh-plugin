import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderGoods } from "./goods-CRIKOqjy.mjs";
//#region lib/routes/xiaomiyoupin/crowdfunding.ts
const base_url = "https://m.xiaomiyoupin.com";
const route = {
	path: "/crowdfunding",
	categories: ["shopping"],
	example: "/xiaomiyoupin/crowdfunding",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xiaomiyoupin.com/"] }],
	name: "小米有品众筹",
	maintainers: ["bigfei"],
	handler,
	url: "xiaomiyoupin.com/"
};
async function handler() {
	const site_url = (await got_default("https://home.mi.com/lasagne/page/5")).data.redirect.location;
	const urlParams = new URLSearchParams(site_url);
	const pageid = urlParams.get("pageid");
	const sign = urlParams.get("sign");
	const query_list = (await got_default(`${base_url}/mtop/navi/venue/page?page_id=${pageid}&pdl=jianyu&sign=${sign}`, { headers: { accept: "*/*" } })).data.data.floors.find((floor) => floor.module_key === "crowding").query_list;
	return {
		title: "小米有品众筹",
		link: site_url,
		description: "小米有品众筹",
		item: (await got_default.post(`${base_url}/mtop/navi/venue/batch?page_id=${pageid}&pdl=jianyu&sign=${sign}`, { json: { query_list } })).data.data.result_list[0].list.map((e) => {
			const goods = e.value.goods;
			return {
				title: goods.name,
				guid: `xiaomiyoupin:${goods.gid}`,
				description: renderGoods(goods),
				link: goods.jump_url,
				pubDate: (/* @__PURE__ */ new Date(goods.fist_release_time * 1e3)).toUTCString()
			};
		})
	};
}
//#endregion
export { route };
