import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { i as maskHeader, n as getToken, r as pixivGot, t as utils_default } from "./utils-DCw-yt542.mjs";
import { n as getNSFWNovelContent, t as getSFWNovelContent } from "./sfw-C8kdZTQ9.mjs";
import { load } from "cheerio";
import queryString from "query-string";
//#region lib/routes/pixiv/novel-api/series/nsfw.ts
const baseUrl$2 = "https://www.pixiv.net";
async function getNovelSeries(seriesId, offset, token) {
	return (await pixivGot("https://app-api.pixiv.net/v2/novel/series", {
		headers: {
			...maskHeader,
			Authorization: "Bearer " + token
		},
		searchParams: queryString.stringify({
			series_id: seriesId,
			last_order: offset
		})
	})).data;
}
async function getNSFWSeriesNovels(seriesId, limit = 10) {
	if (limit > 30) limit = 30;
	if (!config.pixiv || !config.pixiv.refreshToken) throw new ConfigNotFoundError("This user is an R18 creator, PIXIV_REFRESHTOKEN is required.\npixiv RSS is disabled due to the lack of relevant config.\n該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。");
	const token = await getToken();
	if (!token) throw new ConfigNotFoundError("pixiv not login");
	const seriesData = (await pixivGot(`${baseUrl$2}/ajax/novel/series/${seriesId}`, { headers: {
		...maskHeader,
		Authorization: "Bearer " + token
	} })).data;
	let offset = seriesData.body.total - limit;
	if (offset < 0) offset = 0;
	const appSeriesData = await getNovelSeries(seriesId, offset, token);
	const items = await Promise.all(appSeriesData.novels.map(async (novel) => {
		const novelContent = await getNSFWNovelContent(novel.id, token);
		return {
			title: novel.title,
			description: `
                    <img src="${utils_default.getProxiedImageUrl(novelContent.coverUrl)}" />
                    <div>
                    <p>${novelContent.description}</p>
                    <hr>
                    ${novelContent.content}
                    </div>
                `,
			link: `${baseUrl$2}/novel/show.php?id=${novel.id}`,
			pubDate: novel.create_date,
			author: novel.user.name,
			category: novelContent.tags
		};
	}));
	return {
		title: appSeriesData.novel_series_detail.title,
		description: appSeriesData.novel_series_detail.caption,
		link: `${baseUrl$2}/novel/series/${seriesId}`,
		image: utils_default.getProxiedImageUrl(seriesData.body.cover.urls.original),
		item: items
	};
}
//#endregion
//#region lib/routes/pixiv/novel-api/series/sfw.ts
const baseUrl$1 = "https://www.pixiv.net";
async function getSFWSeriesNovels(seriesId, limit = 10) {
	const $ = load((await got_default(`${baseUrl$1}/novel/series/${seriesId}`)).data);
	const title = $("meta[property=\"og:title\"]").attr("content") || "";
	const description = $("meta[property=\"og:description\"]").attr("content") || "";
	const image = $("meta[property=\"og:image\"]").attr("content") || "";
	const data = (await got_default(`${baseUrl$1}/ajax/novel/series/${seriesId}/content_titles`, { headers: { referer: `${baseUrl$1}/novel/series/${seriesId}` } })).data;
	if (data.error) throw new Error(data.message || "Failed to get series data");
	const chapters = data.body.slice(-Math.abs(limit));
	const chapterStartNum = Math.max(data.body.length - limit + 1, 1);
	const items = await Promise.all(chapters.map(async (chapter, index) => {
		if (!chapter.available) return {
			title: `#${chapterStartNum + index} ${chapter.title}`,
			description: "PIXIV_REFRESHTOKEN is required to view the full content.<br>需要 PIXIV_REFRESHTOKEN 才能查看完整內文。",
			link: `${baseUrl$1}/novel/show.php?id=${chapter.id}`
		};
		const novelContent = await getSFWNovelContent(chapter.id);
		return {
			title: `#${chapterStartNum + index} ${novelContent.title}`,
			description: `
                    <img src="${utils_default.getProxiedImageUrl(novelContent.coverUrl)}" />
                    <div>
                    <p>${novelContent.description}</p>
                    <hr>
                    ${novelContent.content}
                    </div>
                `,
			link: `${baseUrl$1}/novel/show.php?id=${novelContent.id}`,
			pubDate: novelContent.createDate,
			author: novelContent.userName || `User ID: ${novelContent.userId}`,
			category: novelContent.tags
		};
	}).toReversed());
	return {
		title,
		description,
		image: utils_default.getProxiedImageUrl(image),
		link: `${baseUrl$1}/novel/series/${seriesId}`,
		item: items
	};
}
//#endregion
//#region lib/routes/pixiv/novel-series.ts
const baseUrl = "https://www.pixiv.net";
const route = {
	path: "/novel/series/:id",
	categories: ["social-media"],
	example: "/pixiv/novel/series/11586857",
	parameters: { id: "Series id, can be found in URL" },
	features: {
		requireConfig: [{
			name: "PIXIV_REFRESHTOKEN",
			optional: true,
			description: `
refresh_token after Pixiv login, required for accessing R18 novels
Pixiv 登錄後的 refresh_token，用於獲取 R18 小說
[https://docs.rsshub.app/deploy/config#pixiv](https://docs.rsshub.app/deploy/config#pixiv)`
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Novel Series",
	maintainers: ["SnowAgar25", "keocheung"],
	handler,
	radar: [{
		source: ["www.pixiv.net/novel/series/:id"],
		target: "/novel/series/:id"
	}]
};
const hasPixivAuth = () => Boolean(config.pixiv && config.pixiv.refreshToken);
async function handler(ctx) {
	const id = ctx.req.param("id");
	const { limit } = ctx.req.query();
	if ((await got_default(`${baseUrl}/ajax/novel/series/${id}`)).data.body.xRestrict > 0) return await getNSFWSeriesNovels(id, limit);
	if (hasPixivAuth()) return await getNSFWSeriesNovels(id, limit);
	return await getSFWSeriesNovels(id, limit);
}
//#endregion
export { route };
