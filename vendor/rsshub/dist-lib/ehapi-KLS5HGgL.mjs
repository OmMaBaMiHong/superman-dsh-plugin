import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import path from "node:path";
import { load } from "cheerio";
//#region lib/routes/ehentai/ehapi.ts
const headers = {};
const has_cookie = config.ehentai.ipb_member_id && config.ehentai.ipb_pass_hash && config.ehentai.sk;
const from_ex = has_cookie && config.ehentai.igneous;
if (has_cookie) if (from_ex) {
	const { ipb_member_id, ipb_pass_hash, sk, igneous } = config.ehentai;
	headers.cookie = `ipb_member_id=${ipb_member_id};ipb_pass_hash=${ipb_pass_hash};sk=${sk};igneous=${igneous}`;
} else {
	const { ipb_member_id, ipb_pass_hash, sk } = config.ehentai;
	headers.cookie = `ipb_member_id=${ipb_member_id};ipb_pass_hash=${ipb_pass_hash};sk=${sk}`;
}
if (config.ehentai.star) headers.cookie += `;star=${config.ehentai.star}`;
function ehgot(url) {
	return from_ex ? got_default({
		method: "get",
		url: `https://exhentai.org/${url}`,
		headers
	}) : got_default({
		method: "get",
		url: `https://e-hentai.org/${url}`,
		headers
	});
}
function ehgot_thumb(cache, thumb_url) {
	return cache.tryGet(thumb_url, async () => {
		try {
			const data = (await got_default({
				method: "get",
				responseType: "buffer",
				url: thumb_url,
				headers
			})).body.toString("base64");
			return `data:image/${path.extname(thumb_url).slice(1)};base64,${data}`;
		} catch (error) {
			logger.warn("Cannot download thumbnail: " + thumb_url, error);
			return thumb_url;
		}
	});
}
async function parsePage(cache, data, get_bittorrent = false, embed_thumb = false) {
	const $ = load(data);
	let layout = "t";
	let galleries = $("div[class^=\"itg gld\"]");
	if (galleries.length <= 0) {
		galleries = $("table[class^=\"itg gltm\"] tbody");
		layout = "m";
	}
	if (galleries.length <= 0) {
		galleries = $("table[class^=\"itg gltc\"] tbody");
		layout = "l";
	}
	if (galleries.length <= 0) {
		galleries = $("table[class^=\"itg glte\"] tbody");
		layout = "e";
	}
	if (galleries.length <= 0) return [];
	async function parseElement(cache, element) {
		const el = $(element);
		const title = el.find(".glink").html();
		const rawDate = el.find("div[id^=\"posted_\"]").text();
		const pubDate = rawDate ? timezone(rawDate, 0) : rawDate;
		let el_a;
		let el_img;
		if ("mpl".includes(layout)) {
			el_a = el.find("td[class^=\"gl3\"] a");
			el_img = el.find("td[class^=gl2] div.glthumb div img");
		} else if (layout === "e") {
			el_a = el.find("td[class^=\"gl1\"] a");
			el_img = el_a.find("img");
		} else if (layout === "t") {
			el_a = el.find("div[class^=\"gl3t\"] a");
			el_img = el_a.find("img");
		}
		const link = el_a.attr("href");
		let thumbnail = el_img.data("src") ?? el_img.attr("src");
		if (config.ehentai.img_proxy && thumbnail) {
			const url = new URL(thumbnail);
			thumbnail = config.ehentai.img_proxy + url.pathname + url.search;
		}
		if (embed_thumb && thumbnail) thumbnail = await ehgot_thumb(cache, thumbnail);
		const description = `<img src='${thumbnail}' alt='thumbnail'>`;
		if (title && link) {
			const item = {
				title,
				description,
				pubDate,
				link
			};
			if (get_bittorrent) {
				const bittorrent_page_url = el.find("div.gldown").find("a").attr("href");
				if (bittorrent_page_url) {
					const bittorrent_url = await getBittorrent(cache, bittorrent_page_url);
					if (bittorrent_url) {
						item.enclosure_url = bittorrent_url;
						item.enclosure_type = "application/x-bittorrent";
						item.bittorrent_page_url = bittorrent_page_url;
					}
				}
			}
			if ("le".includes(layout)) item.author = $(el).find("div.gt[title^=\"artist:\"]").toArray().map((tag) => $(tag).text()).join(" / ");
			return item;
		}
	}
	const item_Promises = [];
	galleries.children().each((index, element) => {
		item_Promises.push(parseElement(cache, element));
	});
	const items_with_null = await Promise.all(item_Promises);
	const items = [];
	for (const item of items_with_null) if (item) items.push(item);
	return items;
}
let p = "";
function getBittorrent(cache, bittorrent_page_url) {
	return cache.tryGet(bittorrent_page_url, async () => {
		try {
			const $ = load((await got_default({
				method: "get",
				url: bittorrent_page_url,
				headers
			})).data);
			const el_forms = $("form").toArray();
			let bittorrent_url;
			for (const el_form of el_forms) {
				const onclick = $(el_form).find("a").attr("onclick");
				if (onclick) {
					const match = onclick.match(/'(.*?)'/);
					if (match) {
						bittorrent_url = match[1];
						const match_p = bittorrent_url.match(/torrent\?p=(.*)$/);
						if (match_p) p = match_p[1];
					}
				}
			}
			return bittorrent_url;
		} catch {
			return;
		}
	});
}
function updateBittorrent_url(cache, items) {
	for (const item of items) {
		if (!item.enclosure_url) continue;
		item.enclosure_url = item.enclosure_url.replace(/torrent\?p=.*$/, () => `torrent?p=${p}`);
		cache.set(item.bittorrent_page_url, item.enclosure_url);
	}
	return items;
}
async function gatherItemsByPage(cache, url, get_bittorrent = false, embed_thumb = false) {
	return updateBittorrent_url(cache, await parsePage(cache, (await ehgot(url)).data, get_bittorrent, embed_thumb));
}
async function getFavoritesItems(cache, favcat, inline_set, page, get_bittorrent = false, embed_thumb = false) {
	if (page) return gatherItemsByPage(cache, `favorites.php?favcat=${favcat}&next=${page}`, get_bittorrent, embed_thumb);
	return updateBittorrent_url(cache, await parsePage(cache, (await ehgot(`favorites.php?favcat=${favcat}&inline_set=${inline_set}`)).data, get_bittorrent, embed_thumb));
}
function getSearchItems(cache, params, page, get_bittorrent = false, embed_thumb = false) {
	return page ? gatherItemsByPage(cache, `?${params}&next=${page}`, get_bittorrent, embed_thumb) : gatherItemsByPage(cache, `?${params}`, get_bittorrent, embed_thumb);
}
function getTagItems(cache, tag, page, get_bittorrent = false, embed_thumb = false) {
	return page ? gatherItemsByPage(cache, `tag/${tag}?next=${page}`, get_bittorrent, embed_thumb) : gatherItemsByPage(cache, `tag/${tag}`, get_bittorrent, embed_thumb);
}
var ehapi_default = {
	getFavoritesItems,
	getSearchItems,
	getTagItems,
	has_cookie,
	from_ex
};
//#endregion
export { ehapi_default as t };
