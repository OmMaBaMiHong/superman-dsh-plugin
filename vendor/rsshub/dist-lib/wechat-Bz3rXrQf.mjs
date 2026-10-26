import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { t as utils_default } from "./utils-D6S7i0PO.mjs";
import { load } from "cheerio";
//#region lib/routes/newrank/wechat.ts
const route = {
	path: "/wechat/:wxid",
	categories: ["social-media"],
	example: "/newrank/wechat/chijiread",
	parameters: { wxid: "微信号，若微信号与新榜信息不一致，以新榜为准" },
	features: {
		requireConfig: [{
			name: "NEWRANK_COOKIE",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "微信公众号",
	maintainers: ["lessmoe", "pseudoyu"],
	handler
};
async function handler(ctx) {
	if (!config.newrank || !config.newrank.cookie) throw new ConfigNotFoundError("newrank RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const uid = ctx.req.param("wxid");
	const nonce = utils_default.random_nonce(9);
	const { data: summaryHTML } = await got_default({
		method: "get",
		url: `https://www.newrank.cn/new/readDetial?account=${uid}`,
		headers: {
			Connection: "keep-alive",
			Cookie: config.newrank.cookie
		}
	});
	const mainsrc = load(summaryHTML)("script").toArray().find((item) => (item.attribs.src || "").startsWith("/new/static/js/main.")).attribs.src;
	const { data: mainScript } = await got_default({
		method: "get",
		url: `https://www.newrank.cn${mainsrc}`
	});
	const N_TOKEN_match = mainScript.match(/"N-Token":"([^"]+)/);
	if (!N_TOKEN_match) throw new Error("Cannot find n-token");
	const N_TOKEN = N_TOKEN_match[1];
	const response = await got_default({
		method: "post",
		url: "https://gw.newrank.cn/api/wechat/xdnphb/detail/v1/rank/article/lists",
		headers: {
			Connection: "keep-alive",
			Cookie: config.newrank.cookie,
			"n-token": N_TOKEN
		},
		form: {
			account: uid,
			nonce,
			xyz: utils_default.decrypt_wechat_detail_xyz(uid, nonce)
		}
	});
	const name = response.data.value.user.name;
	const realTimeArticles = utils_default.flatten(response.data.value.realTimeArticles);
	const articles = utils_default.flatten(response.data.value.articles);
	const items = [...realTimeArticles, ...articles].map((item) => ({
		id: item.id,
		title: item.title,
		description: "",
		link: item.url,
		pubDate: item.publicTime
	}));
	await Promise.all(items.map((item) => finishArticleItem(item)));
	return {
		title: name + " - 微信公众号",
		link: `https://www.newrank.cn/new/readDetial?account=${uid}`,
		item: items
	};
}
//#endregion
export { route };
