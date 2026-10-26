import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/mfa/wjdt.ts
const categories = {
	gjldrhd: "gjldrhd_674881",
	wsrc: "wsrc_674883",
	wjbxw: "wjbxw_674885",
	sjxw: "sjxw_674887",
	fyrbt: "fyrbt_674889",
	cfhsl: "cfhsl_674891",
	dsrm: "dsrm_674893",
	zwbd: "zwbd_674895",
	zcjd: "zcjd"
};
const route = {
	path: "/wjdt/:category?",
	name: "外交动态",
	maintainers: ["nicolaszf", "nczitzk"],
	handler,
	description: `| 分类       | category |
| ---------- | -------- |
| 领导人活动 | gjldrhd  |
| 外事日程   | wsrc     |
| 部领导活动 | wjbxw    |
| 业务动态   | sjxw     |
| 发言人表态 | fyrbt    |
| 吹风会     | cfhsl    |
| 大使任免   | dsrm     |
| 驻外报道   | zwbd     |
| 政策解读   | zcjd     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "gjldrhd";
	const currentUrl = `https://www.mfa.gov.cn/web/wjdt_674879/${categories[category]}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("ul.list1 li a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 35).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href").replace(/^\./, () => currentUrl)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content("#News_Body_Txt_A").html();
		item.pubDate = timezone(parseDate(content(".time span").last().text()), 8);
		item.category = content("meta[name=\"Keywords\"]").attr("content")?.split(";") ?? [];
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
