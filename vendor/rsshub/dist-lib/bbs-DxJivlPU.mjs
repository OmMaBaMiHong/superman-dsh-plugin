import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { load } from "cheerio";
//#region lib/routes/uestc/bbs.ts
const route = {
	path: "/bbs/:types?",
	name: "清水河畔",
	maintainers: ["huyyi"],
	categories: ["university"],
	url: "bbs.uestc.edu.cn",
	example: "/uestc/bbs/newthread",
	parameters: { types: "选择内容类型(多选`,`分割），可选值：[newreply,newthread,digest,life,hotlist]。默认为所有。" },
	features: {
		requireConfig: [{
			name: "UESTC_BBS_COOKIE",
			optional: false,
			description: "河畔的cookie"
		}, {
			name: "UESTC_BBS_AUTH_KEY",
			optional: false,
			description: "河畔Header中的authorization字段"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	description: `::: tip
仅支持自建，您需要设置以下配置才能正常使用：

- 河畔 cookie: \`UESTC_BBS_COOKIE\`
- Header 中的授权字段: \`UESTC_BBS_AUTH_KEY\`

:::`,
	radar: [{
		source: ["bbs.uestc.edu.cn/*"],
		target: "/bbs/newthread"
	}],
	handler: async (ctx) => {
		const { bbsCookie, bbsAuthStr } = config.uestc;
		if (!bbsCookie || !bbsAuthStr) throw new ConfigNotFoundError("未配置 Cookie 或 Authorization。请检查配置。");
		const { types = "newreply,newthread,digest,life,hotlist" } = ctx.req.param();
		const data = await rofetch(`https://bbs.uestc.edu.cn/star/api/v1/index?top_list=${types}`, { headers: {
			Cookie: bbsCookie,
			Referer: "https://bbs.uestc.edu.cn/new",
			authorization: bbsAuthStr
		} });
		const itemsRaw = Object.entries(data.data.top_list).flatMap(([label, items]) => items.map((item) => ({
			...item,
			label
		})));
		return {
			title: "清水河畔",
			link: "https://bbs.uestc.edu.cn/new",
			item: await Promise.all(itemsRaw.map((item) => cache_default.tryGet(`https://bbs.uestc.edu.cn/forum.php?mod=viewthread&tid=${item.thread_id}`, async () => {
				item.description = load(await rofetch(`https://bbs.uestc.edu.cn/forum.php?mod=viewthread&tid=${item.thread_id}`, { headers: {
					Cookie: bbsCookie,
					Referer: "https://bbs.uestc.edu.cn",
					authorization: bbsAuthStr
				} }))("div#postlist").html();
				return {
					title: item.subject,
					link: `https://bbs.uestc.edu.cn/thread/${item.thread_id}`,
					author: item.author,
					category: item.label,
					img: item.icon,
					pubDate: timezone(parseDate(item.dateline), 8),
					description: item.description
				};
			})))
		};
	}
};
//#endregion
export { route };
