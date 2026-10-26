import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/hoyolab/constant.ts
const HOST = "https://bbs-api-os.hoyolab.com";
const POST_FULL = "/community/post/wapi/getPostFull";
const LINK = "https://www.hoyolab.com";
const PRIVATE_IMG = "<img src=\"https://hoyolab-upload-private.hoyolab.com/upload";
const PUBLIC_IMG = "<img src=\"https://upload-os-bbs.hoyolab.com/upload";
const OFFICIAL_PAGE_TYPE = {
	2: 27,
	6: 39,
	8: 47,
	1: 31,
	4: 35,
	5: 43
};
//#endregion
//#region lib/routes/hoyolab/utils.ts
const getGameInfoList = () => cache_default.tryGet("hoyolab:gameNameList", async () => {
	const { data } = await got_default("https://bbs-api-os-static.hoyolab.com/community/apihub/static/api/getAppConfig");
	return JSON.parse(data.data.config.hoyolab_game_info_list);
});
const getI18nGameInfo = async (gid, language) => {
	const game = (await getGameInfoList()).find((item) => item.game_id === Number(gid));
	return {
		name: game?.game_name_list.find((item) => item.locale === language)?.raw_name ?? game?.game_name_list.find((item) => item.locale === "en-us")?.raw_name,
		icon: game?.game_icon
	};
};
const getI18nType = (language) => cache_default.tryGet(`hoyolab:type:${language}`, async () => {
	const { data } = await got_default(`https://webstatic.hoyoverse.com/admin/mi18n/bbs_oversea/m07281525151831/m07281525151831-${language}.json`);
	return {
		1: {
			title: data.official_notify,
			sort: "notices"
		},
		2: {
			title: data.official_activity,
			sort: "events"
		},
		3: {
			title: data.official_info,
			sort: "news"
		}
	};
});
//#endregion
//#region lib/routes/hoyolab/news.tsx
const getEventList = async ({ type, gids, size, language }) => {
	return (await got_default({
		method: "get",
		url: `https://bbs-api-os.hoyolab.com/community/post/wapi/getNewsList?${new URLSearchParams({
			type,
			gids,
			page_size: size
		}).toString()}`,
		headers: { "X-Rpc-Language": language }
	}))?.data?.data?.list || [];
};
const replaceImgDomain = (content) => content.replaceAll(PRIVATE_IMG, () => PUBLIC_IMG);
const getPostContent = (list, { language }) => Promise.all(list.map(async (row) => {
	const post = row.post;
	const post_id = post.post_id;
	const url = `${HOST}${POST_FULL}?${new URLSearchParams({
		post_id,
		language
	}).toString()}`;
	return await cache_default.tryGet(url, async () => {
		const res = await got_default({
			method: "get",
			url,
			headers: { "X-Rpc-Language": language }
		});
		const author = res?.data?.data?.post?.user?.nickname || "";
		let content = res?.data?.data?.post?.post?.content || "";
		if (content === language || !content) content = post.content;
		const description = renderPostDescription({
			hasCover: post.has_cover,
			coverList: row.cover_list,
			content: replaceImgDomain(content)
		});
		return {
			title: post.subject,
			link: `${LINK}/article/${post_id}`,
			description,
			pubDate: parseDate(post.created_at * 1e3),
			author
		};
	});
}));
const route = {
	path: "/news/:language/:gids/:type",
	categories: ["game"],
	example: "/hoyolab/news/zh-cn/2/2",
	parameters: {
		language: "Language",
		gids: "Game ID",
		type: "Announcement type"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Official Announcement",
	maintainers: ["ZenoTian"],
	handler,
	description: `| Language         | Code  |
| ---------------- | ----- |
| 简体中文         | zh-cn |
| 繁體中文         | zh-tw |
| 日本語           | ja-jp |
| 한국어           | ko-kr |
| English (US)     | en-us |
| Español (EU)     | es-es |
| Français         | fr-fr |
| Deutsch          | de-de |
| Русский          | ru-ru |
| Português        | pt-pt |
| Español (Latino) | es-mx |
| Indonesia        | id-id |
| Tiếng Việt       | vi-vn |
| ภาษาไทย          | th-th |

| Honkai Impact 3rd | Genshin Impact | Tears of Themis | HoYoLAB | Honkai: Star Rail | Zenless Zone Zero |
| ----------------- | -------------- | --------------- | ------- | ----------------- | ----------------- |
| 1                 | 2              | 4               | 5       | 6                 | 8                 |

| Notices | Events | Info |
| ------- | ------ | ---- |
| 1       | 2      | 3    |`
};
async function handler(ctx) {
	try {
		const { type, gids, language } = ctx.req.param();
		const params = {
			type,
			gids,
			language,
			size: Number.parseInt(ctx.req.query("limit")) || 15
		};
		const gameInfo = await getI18nGameInfo(gids, language);
		const typeInfo = await getI18nType(language);
		const list = await getEventList(params);
		const items = await getPostContent(list, params);
		return {
			title: `HoYoLAB-${gameInfo.name}-${typeInfo[type].title}`,
			link: `${LINK}/circles/${gids}/${OFFICIAL_PAGE_TYPE[gids]}/official?page_type=${OFFICIAL_PAGE_TYPE[gids]}&page_sort=${typeInfo[type].sort}`,
			item: items,
			image: gameInfo.icon,
			icon: gameInfo.icon,
			logo: gameInfo.icon
		};
	} catch (error) {
		logger.error(error);
	}
}
const renderPostDescription = ({ hasCover, coverList, content }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [hasCover ? coverList?.map((cover) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: cover.url }), /* @__PURE__ */ jsx("br", {})] })) : null, raw(content)] }));
//#endregion
export { route };
