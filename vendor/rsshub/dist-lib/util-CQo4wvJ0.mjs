import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/nhentai/util.tsx
const baseUrl = "https://nhentai.net";
const getCookie = async (username, password, cache) => {
	const loginUrl = "https://nhentai.net/login/";
	const cacheKey = "nhentai:cookie";
	const cachedCookie = await cache.get(cacheKey);
	if (cachedCookie) {
		const { cookie, time } = JSON.parse(cachedCookie);
		if (Date.now() - time < 86400 * 3 * 1e3) return cookie;
	}
	const { data, headers } = await got_default(loginUrl);
	const csrfTokenMiddleware = data.match(/name="csrfmiddlewaretoken" value="(.*?)"/)[1];
	const csrfTokenCookie = headers["set-cookie"].map((c) => c.split(";", 1)[0]).join("; ");
	const login = await got_default.post(loginUrl, {
		headers: {
			referer: loginUrl,
			cookie: csrfTokenCookie
		},
		form: {
			csrfmiddlewaretoken: csrfTokenMiddleware,
			username_or_email: username,
			password,
			next: ""
		},
		followRedirect: false
	});
	if (login.statusCode !== 302) {
		cache.set(cacheKey, JSON.stringify({
			cookie: "",
			time: Date.now()
		}));
		return "";
	}
	const userTokenCookie = login.headers["set-cookie"].map((c) => c.split(";", 1)[0]).join("; ");
	cache.set(cacheKey, JSON.stringify({
		cookie: userTokenCookie,
		time: Date.now()
	}));
	return userTokenCookie;
};
const fetchPage = async (url) => {
	try {
		return await rofetch(url);
	} catch (error) {
		if ((error.status ?? error.statusCode) === 403) {
			const { page, destroy } = await getPlaywrightPage(url, { onBeforeLoad: async (page) => {
				const allowedTypes = /* @__PURE__ */ new Set([
					"document",
					"script",
					"xhr",
					"fetch"
				]);
				await page.route("**/*", (route) => {
					const request = route.request();
					allowedTypes.has(request.resourceType()) ? route.continue() : route.abort();
				});
			} });
			const content = await page.content();
			await destroy();
			return content;
		}
		throw error;
	}
};
const getSimple = async (url) => {
	const $ = load(await fetchPage(url));
	return $(".gallery a.cover").toArray().map((ele) => parseSimpleDetail($(ele)));
};
const getDetails = (cache, simples, limit) => Promise.all(simples.slice(0, limit).map((simple) => cache.tryGet(simple.link, () => getDetail(simple))));
const getTorrents = async (cache, simples, limit) => {
	if (!config.nhentai || !config.nhentai.username || !config.nhentai.password) throw new ConfigNotFoundError("nhentai RSS with torrents is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const cookie = await getCookie(config.nhentai.username, config.nhentai.password, cache);
	if (!cookie) throw new ConfigNotFoundError("Invalid username (or email) or password for nhentai torrent download");
	return getTorrentWithCookie(cache, simples, cookie, limit);
};
const getTorrentWithCookie = (cache, simples, cookie, limit) => Promise.all(simples.slice(0, limit).map((simple) => cache.tryGet(simple.link + "download", () => getTorrent(simple, cookie))));
const parseSimpleDetail = ($ele) => {
	const link = new URL($ele.attr("href"), baseUrl).href;
	const thumb = $ele.children("img");
	const highResoThumbSrc = (thumb.attr("data-src") || thumb.attr("src")).replace("thumb", "1").replace(/t(\d+)\.nhentai\.net/, "i$1.nhentai.net").replace(".webp.webp", ".webp");
	return {
		title: $ele.children(".caption").text(),
		link,
		description: `<img src="${highResoThumbSrc}">`
	};
};
const getTorrent = async (simple, cookie) => {
	const { link } = simple;
	const response = await rofetch(link + "download", { headers: { Cookie: cookie } });
	return {
		...simple,
		enclosure_url: response,
		enclosure_type: "application/x-bittorrent"
	};
};
const getDetail = async (simple) => {
	const { link } = simple;
	const $ = load(await fetchPage(link));
	const galleryImgs = $(".gallerythumb img").toArray().map((ele) => new URL($(ele).attr("data-src"), baseUrl).href).map((src) => src.replace(/(.+)(\d)t\.(.+)/, (_, p1, p2, p3) => `${p1}${p2}.${p3}`)).map((src) => src.replace(/t(\d+)\.nhentai\.net/, "i$1.nhentai.net")).map((src) => src.replace(/\.(jpg|png|gif)\.webp$/, ".$1")).map((src) => src.replace(/\.webp\.webp$/, ".webp"));
	return {
		...simple,
		title: $("div#info > h2").text() || $("div#info > h1").text(),
		pubDate: parseDate($("time").attr("datetime")),
		description: renderDescription(galleryImgs.length, galleryImgs)
	};
};
const renderDescription = (length, images) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("h1", { children: [length, " pages"] }),
	/* @__PURE__ */ jsx("br", {}),
	images.map((image, index) => /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] }, `${image}-${index}`))
] }));
//#endregion
export { getSimple as n, getTorrents as r, getDetails as t };
