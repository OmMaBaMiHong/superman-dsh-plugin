import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/iqiyi/album.tsx
const route = {
	path: "/album/:id",
	categories: ["multimedia"],
	example: "/iqiyi/album/神武天尊-2020-1b4lufwxd7h",
	parameters: { id: "剧集 id, 可在该主页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "剧集",
	maintainers: ["TonyRL"],
	handler,
	description: `::: tip
可抓取內容根据服务器所在地区而定
:::`
};
async function handler(ctx) {
	const { data: response } = await got_default(`https://www.iq.com/album/${ctx.req.param("id")}`);
	const $ = load(response);
	const { album } = JSON.parse($("#__NEXT_DATA__").text()).props.initialState;
	const { data: { data: baseInfo } } = await got_default(`https://pcw-api.iqiyi.com/album/album/baseinfo/${album.videoAlbumInfo.albumId}`);
	if (Object.keys(album.cacheAlbumList).length === 0) throw new InvalidParameterError(`${baseInfo.name} is not available in this server region.`);
	let pos = 1;
	let hasMore;
	let epgs = [];
	do {
		const { data: { data } } = await got_default(`https://pcw-api.iq.com/api/v2/episodeListSource/${album.videoAlbumInfo.albumId}`, { searchParams: {
			platformId: 3,
			modeCode: "intl",
			langCode: "zh_cn",
			endOrder: album.videoAlbumInfo.maxOrder,
			startOrder: pos
		} });
		epgs = [...epgs, ...data.epg];
		pos = data.pos;
		hasMore = data.hasMore;
	} while (hasMore);
	const items = epgs.map((item) => ({
		title: item.name,
		description: renderToString(/* @__PURE__ */ jsx("img", { src: `https:${item.pic.replace("http:", "https:")}` })),
		link: `https://www.iq.com/play/${item.playLocSuffix}`,
		pubDate: parseDate(item.initIssueTime)
	}));
	return {
		title: baseInfo.name,
		description: baseInfo.description,
		image: album.videoAlbumInfo.albumFocus1024,
		link: `https://www.iq.com/album/${album.videoAlbumInfo.albumLocSuffix}`,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
