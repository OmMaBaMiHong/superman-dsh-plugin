import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/csu/mail.ts
async function fetch(address) {
	return load((await got_default(address)).data)(".tb-ct-info").html();
}
const route = {
	path: "/mail/:type?",
	categories: ["university"],
	example: "/csu/mail",
	parameters: { type: "类型" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "校长信箱",
	maintainers: ["j1g5awi"],
	handler,
	description: `| 类型 | 校长信箱 | 党委信箱 |
| ---- | -------- | -------- |
| 参数 | 01       | 02       |`
};
async function handler(ctx) {
	const baseUrl = "https://oa.csu.edu.cn";
	const { type = "01" } = ctx.req.param();
	const link = `${baseUrl}/mailbox/NoAuth/MailList_Pub?tp=${type}`;
	const list = (await got_default.post(`${baseUrl}/mailbox/NoAuth/Get_MailList_Pub`, { form: {
		params: `{"XXLX":"${type}","tjnr":""}`,
		pageSize: 1,
		pageNo: 15
	} })).data.data.map((item) => ({
		title: item.WJBT,
		link: `${baseUrl}/mailbox/NoAuth/MailInInfo?XXLX=${type}&id=${item.NBBM}`,
		pubDate: timezone(parseDate(item.LXSJ), 8),
		author: item.FZDW,
		category: item.NRFL
	}));
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = await fetch(item.link);
		return item;
	})));
	return {
		title: `中南大学学校信箱 - ${type === "01" ? "校长信箱" : "党委信箱"}`,
		link,
		item: out
	};
}
//#endregion
export { route };
