import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as utils_default } from "./utils-D6S7i0PO.mjs";
//#region lib/routes/newrank/douyin.ts
const route = {
	path: "/douyin/:dyid",
	categories: ["social-media"],
	example: "/newrank/douyin/110266463747",
	parameters: { dyid: "抖音ID，可在新榜账号详情 URL 中找到" },
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
	name: "抖音短视频",
	maintainers: ["lessmoe"],
	handler,
	description: `::: warning
免费版账户抖音每天查询次数 20 次，如需增加次数可购买新榜会员或等待未来多账户支持
:::`
};
async function handler(ctx) {
	if (!config.newrank || !config.newrank.cookie) throw new ConfigNotFoundError("newrank RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const uid = ctx.req.param("dyid");
	const nonce = utils_default.random_nonce(9);
	const url_detail = "https://xd.newrank.cn/xdnphb/nr/cloud/douyin/detail/aweme?xyz=" + utils_default.decrypt_douyin_detail_xyz(nonce) + "&nonce=" + nonce;
	const cookie = config.newrank.cookie;
	const response_detail = await got_default({
		method: "post",
		url: url_detail,
		headers: {
			Connection: "keep-alive",
			Cookie: cookie,
			"Content-Type": "application/json"
		},
		data: JSON.stringify({
			create_time_end: "",
			create_time_start: "",
			date_type: "",
			is_promotion: "0",
			is_seed: "0",
			keyword: "",
			size: 20,
			sort: "create_time",
			start: 1,
			uid
		})
	});
	const response_account = await got_default({
		method: "post",
		url: "https://xd.newrank.cn/xdnphb/nr/cloud/douyin/detail/accountInfoAll?nonce=" + nonce + "&xyz=" + utils_default.decrypt_douyin_account_xyz(nonce),
		headers: {
			Connection: "keep-alive",
			Cookie: cookie,
			"Content-Type": "application/json"
		},
		data: JSON.stringify({ uid })
	});
	const name = response_account.data.data.nickname;
	const description = response_account.data.data.signature;
	const items = utils_default.flatten(response_detail.data.data.list).map((item) => ({
		title: item.aweme_desc,
		description: "",
		link: item.share_url,
		pubDate: item.create_time
	}));
	return {
		title: name + " - 抖音",
		description,
		link: "https://xd.newrank.cn/data/d/account/workList/" + uid,
		item: items
	};
}
//#endregion
export { route };
