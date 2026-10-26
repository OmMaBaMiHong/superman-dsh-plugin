import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as maskHeader, r as pixivGot, t as utils_default } from "./utils-DCw-yt542.mjs";
import { load } from "cheerio";
import { JSDOM, VirtualConsole } from "jsdom";
import queryString from "query-string";
//#region lib/routes/pixiv/api/get-illust-detail.ts
/**
* 获取插画详细信息
* @param {string} illust_id 插画作品 id
* @param {string} token pixiv oauth token
* @returns {Promise<got.AxiosResponse<{illust: IllustDetail}>>}
*/
function getIllustDetail(illust_id, token) {
	return pixivGot("https://app-api.pixiv.net/v1/illust/detail", {
		headers: {
			...maskHeader,
			Authorization: "Bearer " + token
		},
		searchParams: queryString.stringify({
			illust_id,
			filter: "for_ios"
		})
	});
}
//#endregion
//#region lib/routes/pixiv/novel-api/content/utils.ts
function convertPixivProtocolExtended(caption) {
	return caption.replaceAll(/pixiv:\/\/novels\/(\d+)/g, (_match, p1) => `https://www.pixiv.net/novel/show.php?id=${p1}`).replaceAll(/pixiv:\/\/illusts\/(\d+)/g, (_match, p1) => `https://www.pixiv.net/artworks/${p1}`).replaceAll(/pixiv:\/\/users\/(\d+)/g, (_match, p1) => `https://www.pixiv.net/users/${p1}`).replaceAll(/pixiv:\/\/novel\/series\/(\d+)/g, (_match, p1) => `https://www.pixiv.net/novel/series/${p1}`);
}
async function parseNovelContent(content, images, token) {
	try {
		if (token) {
			const imageMatches = content.matchAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g).toArray();
			const imageIdToUrl = /* @__PURE__ */ new Map();
			await Promise.all(imageMatches.map(async ([, illustId, pageNum]) => {
				if (!illustId) return;
				try {
					const illust = (await getIllustDetail(illustId, token)).data.illust;
					const imageUrl = utils_default.getImgs(illust).map((img) => img.match(/src="([^"]+)"/)?.[1] || "")[Number(pageNum) || 0];
					if (imageUrl) imageIdToUrl.set(pageNum ? `${illustId}-${pageNum}` : illustId, imageUrl);
				} catch (error) {
					logger.warn(`Failed to fetch illust detail for ID ${illustId}: ${error instanceof Error ? error.message : String(error)}`);
				}
			}));
			content = content.replaceAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g, (match, illustId, pageNum) => {
				const key = pageNum ? `${illustId}-${pageNum}` : illustId;
				const imageUrl = imageIdToUrl.get(key);
				return imageUrl ? `<img src="${imageUrl}" alt="pixiv illustration ${illustId}${pageNum ? ` page ${pageNum}` : ""}">` : match;
			});
		} else content = content.replaceAll(/\[pixivimage:(\d+)(?:-(\d+))?\]/g, (_, illustId) => `<a href="https://www.pixiv.net/artworks/${illustId}" target="_blank" rel="noopener noreferrer">Pixiv Artwork #${illustId}</a>`);
		content = content.replaceAll(/\[uploadedimage:(\d+)\]/g, (match, imageId) => {
			const imageUrl = images[imageId];
			if (imageUrl) return `<img src="${utils_default.getProxiedImageUrl(imageUrl)}" alt="novel illustration ${imageId}">`;
			return match;
		});
		content = content.replaceAll("\n", "<br>").replaceAll(/(<br>){2,}/g, "</p><p>").replaceAll(/\[\[rb:([^>\n\r\u{2028}\u{2029}]*)>(.*?)\]\]/gu, "<ruby>$1<rt>$2</rt></ruby>").replaceAll(/\[\[jumpuri:([^>\n\r\u{2028}\u{2029}]*)>(.*?)\]\]/gu, "<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>").replaceAll(/\[jump:(\d+)\]/g, "Jump to page $1").replaceAll(/\[chapter:(.*?)\]/g, "<h2>$1</h2>").replaceAll("[newpage]", "<hr>");
		const $content = load(`<article><p>${content}</p></article>`);
		$content("p p").each((_, elem) => {
			const $elem = $content(elem);
			$elem.replaceWith($elem.html() || "");
		});
		$content("p h2").each((_, elem) => {
			const $elem = $content(elem);
			const $parent = $elem.parent("p");
			const html = $elem.prop("outerHTML");
			if ($parent.length && html) $parent.replaceWith(`</p>${html}<p>`);
		});
		return $content.html() || "";
	} catch (error) {
		throw new Error(`Error parsing novel content: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
	}
}
//#endregion
//#region lib/routes/pixiv/novel-api/content/nsfw.ts
async function getNSFWNovelContent(novelId, token) {
	return await cache_default.tryGet(`https://app-api.pixiv.net/webview/v2/novel:${novelId}`, async () => {
		const response = await pixivGot("https://app-api.pixiv.net/webview/v2/novel", {
			headers: {
				...maskHeader,
				Authorization: "Bearer " + token
			},
			searchParams: queryString.stringify({
				id: novelId,
				viewer_version: "20221031_ai"
			})
		});
		const virtualConsole = new VirtualConsole().on("error", () => void 0);
		const { window } = new JSDOM(response.data, {
			runScripts: "dangerously",
			virtualConsole
		});
		const novelDetail = window.pixiv?.novel;
		window.close();
		if (!novelDetail) throw new Error("No novel data found");
		const images = Object.fromEntries(Object.entries(novelDetail.images).filter(([, image]) => image?.urls?.original).map(([id, image]) => [id, image.urls.original]));
		const parsedContent = await parseNovelContent(novelDetail.text, images, token);
		return {
			id: novelDetail.id,
			title: novelDetail.title,
			description: novelDetail.caption,
			content: parsedContent,
			userId: novelDetail.userId,
			userName: null,
			bookmarkCount: novelDetail.rating.bookmark,
			viewCount: novelDetail.rating.view,
			likeCount: novelDetail.rating.like,
			createDate: parseDate(novelDetail.cdate),
			updateDate: null,
			isOriginal: novelDetail.isOriginal,
			aiType: novelDetail.aiType,
			tags: novelDetail.tags,
			coverUrl: novelDetail.coverUrl,
			images,
			seriesId: novelDetail.seriesId || null,
			seriesTitle: novelDetail.seriesTitle || null
		};
	});
}
//#endregion
//#region lib/routes/pixiv/novel-api/content/sfw.ts
const baseUrl = "https://www.pixiv.net";
async function getSFWNovelContent(novelId) {
	const url = `${baseUrl}/ajax/novel/${novelId}`;
	return await cache_default.tryGet(url, async () => {
		const novelDetail = (await got_default(url, { headers: { referer: `${baseUrl}/novel/show.php?id=${novelId}` } })).data;
		if (!novelDetail) throw new Error("No novel data found");
		const body = novelDetail.body;
		const images = {};
		if (novelDetail.body.textEmbeddedImages) for (const [id, image] of Object.entries(novelDetail.body.textEmbeddedImages)) images[id] = utils_default.getProxiedImageUrl(image.urls.original);
		const parsedContent = await parseNovelContent(novelDetail.body.content, images);
		return {
			id: body.id,
			title: body.title,
			description: body.description,
			content: parsedContent,
			userId: body.userId,
			userName: body.userName,
			bookmarkCount: body.bookmarkCount,
			viewCount: body.viewCount,
			likeCount: body.likeCount,
			createDate: parseDate(body.createDate),
			updateDate: parseDate(body.uploadDate),
			isOriginal: body.isOriginal,
			aiType: body.aiType,
			tags: body.tags.tags.map((tag) => tag.tag),
			coverUrl: body.coverUrl,
			images,
			seriesId: body.seriesNavData?.seriesId?.toString() || null,
			seriesTitle: body.seriesNavData?.title || null
		};
	});
}
//#endregion
export { getNSFWNovelContent as n, convertPixivProtocolExtended as r, getSFWNovelContent as t };
