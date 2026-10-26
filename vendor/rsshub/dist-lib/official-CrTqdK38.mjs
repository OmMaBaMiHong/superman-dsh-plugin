import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/mihoyo/templates/official.tsx
const renderOfficialDescription = (hasCover, coverList, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [hasCover ? coverList.map((cover) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: cover.url }), /* @__PURE__ */ jsx("br", {})] })) : null, content ? /* @__PURE__ */ jsx(Fragment, { children: raw(content) }) : null] }));
//#endregion
//#region lib/routes/mihoyo/bbs/official.ts
const GITS_MAP = {
	1: "崩坏三",
	2: "原神",
	3: "崩坏二",
	4: "未定事件簿",
	6: "崩坏：星穹铁道",
	8: "绝区零"
};
const TYPE_MAP = {
	1: "公告",
	2: "活动",
	3: "资讯"
};
const GAME_SHORT_MAP = {
	1: "bh3",
	2: "ys",
	3: "bh2",
	4: "wd",
	6: "sr",
	8: "zzz"
};
const OFFICIAL_PAGE_MAP = {
	1: "6",
	2: "28",
	3: "31",
	4: "33",
	6: "53",
	8: "58"
};
var MiHoYoOfficialError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "MiHoYoOfficialError";
	}
};
const getNewsList = async ({ gids, type, page_size, last_id }) => {
	return (await got_default({
		method: "get",
		url: `https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?${new URLSearchParams({
			client_type: "4",
			gids,
			type,
			page_size,
			last_id
		}).toString()}`
	}))?.data?.data?.list;
};
const getPostContent = async (row, default_gid = "2") => {
	const post = row.post;
	const post_id = post.post_id;
	const url = `https://bbs-api.miyoushe.com/post/wapi/getPostFull?${new URLSearchParams({ post_id }).toString()}`;
	return await cache_default.tryGet(url, async () => {
		const res = await got_default(url);
		const fullRow = res?.data?.data?.post;
		if (!fullRow) throw new MiHoYoOfficialError(`mihoyo/bbs/official: getPostContent failed: ${url} - ${JSON.stringify(res)}`);
		const gid = fullRow?.post?.game_id || default_gid;
		const author = fullRow?.user?.nickname || "";
		const content = fullRow?.post?.content || "";
		const tags = fullRow?.topics?.map((item) => item.name) || [];
		const description = renderOfficialDescription(post.has_cover, row.cover_list, content);
		return {
			title: post.subject,
			link: `https://www.miyoushe.com/${GAME_SHORT_MAP[gid]}/article/${post_id}`,
			description,
			pubDate: parseDate(post.created_at * 1e3),
			category: tags,
			author
		};
	});
};
const getPostContents = async (list, default_gid = "2") => {
	return (await Promise.all(list.map((item) => {
		try {
			return getPostContent(item, default_gid);
		} catch (error) {
			if (error instanceof MiHoYoOfficialError) {
				logger.error(error.message);
				return null;
			}
			throw error;
		}
	}))).filter(Boolean);
};
const route = {
	path: "/bbs/official/:gids/:type?/:page_size?/:last_id?",
	categories: ["game"],
	example: "/mihoyo/bbs/official/2/3/20/",
	parameters: {
		gids: "游戏id",
		type: "公告类型，默认为 2(即 活动)",
		page_size: "分页大小，默认为 20 ",
		last_id: "跳过的公告数，例如指定为 40 就是从第 40 条公告开始，可用于分页"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "米游社 - 官方公告",
	maintainers: ["CaoMeiYouRen"],
	handler,
	description: `游戏 id

| 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 绝区零 |
| ------ | ---- | ------ | ---------- | -------- | ------ |
| 1      | 2    | 3      | 4          | 6        | 8      |

公告类型

| 公告 | 活动 | 资讯 |
| ---- | ---- | ---- |
| 1    | 2    | 3    |`
};
async function handler(ctx) {
	const { gids, type = "2", page_size = "20", last_id = "" } = ctx.req.param();
	const list = await getNewsList({
		gids,
		type,
		page_size,
		last_id
	});
	const items = await getPostContents(list, gids);
	return {
		title: `米游社 - ${GITS_MAP[gids] || ""} - ${TYPE_MAP[type] || ""}`,
		link: `https://www.miyoushe.com/${GAME_SHORT_MAP[gids]}/home/${OFFICIAL_PAGE_MAP[gids]}?type=${type}`,
		item: items
	};
}
//#endregion
export { route };
