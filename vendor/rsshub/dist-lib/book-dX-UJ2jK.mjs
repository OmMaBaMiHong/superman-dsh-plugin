import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import CryptoJS from "crypto-js";
//#region lib/routes/creative-comic/utils.ts
const apiHost = "https://api.creative-comic.tw";
const device = "web_desktop";
const DEFAULT_TOKEN = "freeforccc2020reading";
const getBook = (bookId, uuid) => got_default(`${apiHost}/book/${bookId}/info`, { headers: {
	device,
	uuid
} });
const getChapter = (id, uuid) => got_default(`${apiHost}/book/chapter/${id}`, { headers: {
	device,
	uuid
} });
const getChapters = (bookId, uuid) => got_default(`${apiHost}/book/${bookId}/chapter`, { headers: {
	device,
	uuid
} });
const getImgEncrypted = async (pageId, quality) => {
	const { data: res } = await got_default(`https://storage.googleapis.com/ccc-www/fs/chapter_content/encrypt/${pageId}/${quality}`, {
		headers: { device },
		responseType: "buffer"
	});
	return Buffer.from(res).toString("base64");
};
const getImgKey = (pageId, uuid) => got_default(`${apiHost}/book/chapter/image/${pageId}`, { headers: {
	device,
	uuid
} });
const getUuid = () => cache_default.tryGet("creative-comic:uuid", async () => {
	const { data } = await got_default(`${apiHost}/guest`, { headers: { device } });
	return data.data;
});
const decrypt = (encrypted, secrets) => CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Hex.parse(secrets.key), {
	iv: CryptoJS.enc.Hex.parse(secrets.iv),
	mode: CryptoJS.mode.CBC,
	padding: CryptoJS.pad.Pkcs7
}).toString(CryptoJS.enc.Utf8);
const token2Key = (token) => {
	const t = CryptoJS.SHA512(token).toString();
	return {
		key: t.slice(0, 64),
		iv: t.slice(30, 62)
	};
};
const getRealKey = (imgKey, token = DEFAULT_TOKEN) => {
	const secrets = token2Key(token);
	const realKey = decrypt(imgKey, secrets).split(":");
	return {
		key: realKey[0],
		iv: realKey[1]
	};
};
//#endregion
//#region lib/routes/creative-comic/book.tsx
const route = {
	path: "/book/:id/:coverOnly?/:quality?",
	categories: ["anime"],
	example: "/creative-comic/book/117",
	parameters: {
		id: "漫畫 ID，可在 URL 中找到",
		coverOnly: "僅獲取封面，非 `true` 時將獲取**全部**頁面，預設 `true`",
		quality: "閱讀品質，標準畫質 `1`，高畫質 `2`，預設 `1`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["creative-comic.tw/book/:id/*"],
		target: "/:id"
	}],
	name: "漫畫",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { id, coverOnly = "true", quality = "1" } = ctx.req.param();
	const uuid = await getUuid();
	const { data: { data: book } } = await getBook(id, uuid);
	const { data: { data: chapters } } = await getChapters(id, uuid);
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 3;
	const items = await Promise.all(chapters.chapters.toSorted((a, b) => b.idx - a.idx).slice(0, limit).map(async (c) => {
		let pages;
		if (coverOnly !== "true" && coverOnly !== "1") {
			const { data: { data: chapter } } = await getChapter(c.id, uuid);
			if (chapter.chapter.free_day === null || chapter.chapter.free_day === 0) pages = await Promise.all(chapter.chapter.proportion.map(async (p) => {
				let { data: imgKey } = await getImgKey(p.id, uuid);
				imgKey = imgKey.data.key;
				const realKey = getRealKey(imgKey);
				const encrypted = await getImgEncrypted(p.id, quality);
				return cache_default.tryGet(`${apiHost}/fs/chapter_content/encrypt/${p.id}/${quality}`, () => decrypt(encrypted, realKey));
			}));
		}
		return {
			title: c.vol_name,
			description: renderChapterDescription(c, pages, c.image1),
			pubDate: parseDate(c.online_at),
			updated: parseDate(c.updated_at),
			link: `https://www.creative-comic.tw/reader_comic/${c.id}`,
			author: book.author.map((author) => author.name).join(", "),
			category: book.tags.map((tag) => tag.name)
		};
	}));
	return {
		title: `${book.name} | CCC創作集`,
		description: `${book.brief} ${book.description}`,
		link: book.share_link,
		image: book.image1,
		item: items,
		language: "zh-hant"
	};
}
const renderChapterDescription = (chapter, pages, cover) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	chapter ? /* @__PURE__ */ jsx("p", { children: chapter.name }) : null,
	pages?.map((page) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("img", { src: page })] })),
	cover ? /* @__PURE__ */ jsx("img", { src: cover }) : null
] }));
//#endregion
export { route };
