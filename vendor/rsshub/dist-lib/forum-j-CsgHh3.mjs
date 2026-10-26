import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/nga/forum.ts
const X_UA = "NGA_skull/6.0.5(iPhone10,3;iOS 12.0.1)";
const route = {
	path: "/forum/:fid/:recommend?",
	categories: ["bbs"],
	view: 0,
	example: "/nga/forum/489",
	parameters: {
		fid: "分区 id, 可在分区主页 URL 找到, 没有 fid 时 stid 同样适用",
		recommend: "是否只显示精华主题, 留空为否, 任意值为是"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分区帖子",
	maintainers: ["xyqfer"],
	handler
};
async function handler(ctx) {
	const { fid, recommend } = ctx.req.param();
	let cookieString = `guestJs=${Math.floor(Date.now() / 1e3)};`;
	if (config.nga.uid && config.nga.cid) cookieString = `ngaPassportUid=${config.nga.uid}; ngaPassportCid=${config.nga.cid};`;
	const formatContent = (content) => content.replaceAll(/\[img\](.+?)\[\/img\]/g, (match, p1) => {
		return `<img src="${p1.replaceAll(/\?.*/g, "")}" />`;
	}).replaceAll(/\[url\](.+?)\[\/url\]/g, "<a href=\"$1\">$1</a>");
	const homePage = await got_default.post("https://ngabbs.com/app_api.php?__lib=subject&__act=list", {
		headers: {
			"X-User-Agent": X_UA,
			Cookie: cookieString
		},
		form: {
			fid,
			recommend: recommend ? 1 : 0
		}
	});
	const forumname = homePage.data.forumname;
	const list = homePage.data.result.data.filter(({ tid }) => tid);
	const resultItem = await Promise.all(list.map(async ({ subject, postdate, tid }) => {
		const link = `https://nga.178.com/read.php?tid=${tid}`;
		const item = {
			title: subject,
			description: "",
			link,
			pubDate: parseDate(postdate, "X")
		};
		item.description = await cache_default.tryGet(`nga-forum: ${link}`, async () => {
			const response = await got_default.post("https://ngabbs.com/app_api.php?__lib=post&__act=list", {
				headers: {
					"X-User-Agent": X_UA,
					Cookie: cookieString
				},
				form: { tid }
			});
			return response.data.code === 0 ? formatContent(response.data.result[0].content) : response.data.msg;
		});
		return item;
	}));
	return {
		title: `NGA-${forumname}${recommend ? "-精华" : ""}`,
		link: `https://nga.178.com/thread.php?fid=${fid}`,
		description: "NGA是国内专业的游戏玩家社区,魔兽世界,英雄联盟,炉石传说,风暴英雄,暗黑破坏神3(D3)游戏攻略讨论,以及其他热门游戏玩家社区",
		item: resultItem
	};
}
//#endregion
export { route };
