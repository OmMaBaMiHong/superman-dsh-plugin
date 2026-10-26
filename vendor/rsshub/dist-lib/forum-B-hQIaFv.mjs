import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/zodgame/forum.tsx
const rootUrl = "https://zodgame.xyz";
const route = {
	path: "/forum/:fid?",
	categories: ["bbs"],
	example: "/zodgame/forum/13",
	parameters: { fid: "forum id, can be found in URL" },
	features: {
		requireConfig: [{
			name: "ZODGAME_COOKIE",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "forum",
	maintainers: ["FeCCC"],
	handler
};
async function handler(ctx) {
	const fid = ctx.req.param("fid");
	const subUrl = `${rootUrl}/api/mobile/index.php?version=4&module=forumdisplay&fid=${fid}`;
	const cookie = config.zodgame.cookie;
	if (cookie === void 0) throw new ConfigNotFoundError("Zodgame RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const info = (await got_default({
		method: "get",
		url: subUrl,
		headers: { Cookie: cookie }
	})).data.Variables;
	const ThreadList = info.forum_threadlist.map((item) => {
		const type = info.threadtypes.types[item.typeid];
		if (!type) return;
		return {
			tid: item.tid,
			title: `[${type}] ${item.subject}`,
			author: item.author,
			link: `${rootUrl}/forum.php?mod=viewthread&tid=${item.tid}&extra=page%3D1`,
			category: type,
			pubDate: parseDate(item.dbdateline * 1e3)
		};
	}).filter((item) => item !== void 0);
	const items = await Promise.all(ThreadList.map((item) => cache_default.tryGet(item.tid, async () => {
		const threadInfo = (await got_default({
			method: "get",
			url: `${rootUrl}/api/mobile/index.php?version=4&module=viewthread&tid=${item.tid}`,
			headers: { Cookie: cookie }
		})).data.Variables;
		let description = "";
		if (threadInfo.thread.freemessage) {
			description += threadInfo.thread.freemessage;
			description += renderDescription(threadInfo.postlist[0].message);
		} else description += threadInfo.postlist[0].message;
		return {
			title: item.title,
			author: item.author,
			link: item.link,
			description,
			category: item.category,
			pubDate: item.pubDate,
			guid: item.tid,
			upvotes: Number(threadInfo.thread.recommend_add),
			downvotes: Number(threadInfo.thread.recommend_sub),
			comments: Number(threadInfo.thread.replies)
		};
	})));
	return {
		title: `${info.forum.name} - ZodGame论坛`,
		link: `${rootUrl}/forum.php?mod=forumdisplay&fid=${fid}`,
		item: items
	};
}
const renderDescription = (content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("span", { children: content })
] }));
//#endregion
export { route };
