import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/guancha/personalpage.ts
const route = {
	path: "/personalpage/:uid",
	categories: ["new-media"],
	example: "/guancha/personalpage/243983",
	parameters: { uid: "用户id， 可在URL中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "个人主页文章",
	maintainers: ["Jeason0228"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const host = "https://user.guancha.cn";
	const link = `https://app.guancha.cn/user/get-published-list?page_size=20&page_no=1&uid=${uid}`;
	const list = (await got_default({
		method: "get",
		url: link,
		headers: { Referer: host }
	})).data.data.items;
	const user_nick = list[0].user_nick;
	/** Get time from relative time in HTML */
	function getpass_at(e) {
		const minuteRelativeTime = /(\d+)\s*分钟前/;
		const hourRelativeTime = /(\d+)\s*小时前/;
		const yesterdayRelativeTime = /昨天\s*(\d+):(\d+)/;
		const shortDate = /(\d+)-(\d+)\s+(\d+):(\d+)/;
		const localToChinaOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset() * 60 * 1e3 - -8 * 3600 * 1e3;
		let time;
		if (e === "刚刚") time = /* @__PURE__ */ new Date();
		else if (minuteRelativeTime.test(e)) {
			const rel = minuteRelativeTime.exec(e);
			time = /* @__PURE__ */ new Date(Date.now() - Number.parseInt(rel[1]) * 60 * 1e3);
		} else if (hourRelativeTime.test(e)) {
			const rel = hourRelativeTime.exec(e);
			time = /* @__PURE__ */ new Date(Date.now() - Number.parseInt(rel[1]) * 60 * 60 * 1e3);
		} else if (yesterdayRelativeTime.test(e)) {
			const rel = yesterdayRelativeTime.exec(e);
			time = new Date(Date.now() - 86400 * 1e3 + localToChinaOffset);
			time.setHours(Number.parseInt(rel[1]), Number.parseInt(rel[2]), 0, 0);
			time = new Date(time.getTime() - localToChinaOffset);
		} else if (shortDate.test(e)) {
			const rel = shortDate.exec(e);
			const year = new Date(Date.now() + localToChinaOffset).getFullYear();
			time = new Date(year, Number.parseInt(rel[1]) - 1, Number.parseInt(rel[2]), Number.parseInt(rel[3]), Number.parseInt(rel[4]));
			time = new Date(time.getTime() - localToChinaOffset);
		} else time = new Date(e);
		return time;
	}
	return {
		title: `${user_nick}-观察者-风闻社区`,
		link,
		description: `${user_nick} 的个人主页`,
		item: list.map((item) => ({
			title: item.title,
			description: item.summary,
			pubDate: getpass_at(item.pass_at),
			link: `https://user.guancha.cn/main/content?id=${item.id}`,
			author: item.user_nick
		}))
	};
}
//#endregion
export { route };
