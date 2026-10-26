import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/douyin/templates/cover.tsx
const renderCover = ({ img, videoList }) => {
	const videoUrl = videoList?.[0];
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		img ? videoUrl ? /* @__PURE__ */ jsx("a", {
			href: videoUrl,
			rel: "noreferrer",
			children: /* @__PURE__ */ jsx("img", {
				src: img,
				style: "width: 50%;"
			})
		}) : /* @__PURE__ */ jsx("img", {
			src: img,
			style: "width: 50%;"
		}) : null,
		img && videoUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("br", {})] }) : null,
		videoUrl ? /* @__PURE__ */ jsx("a", {
			href: videoUrl,
			rel: "noreferrer",
			children: "视频直链"
		}) : null
	] }));
};
//#endregion
//#region lib/routes/douyin/templates/desc.tsx
const renderDesc = ({ desc, media }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	raw(desc),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	raw(media)
] }));
//#endregion
//#region lib/routes/douyin/templates/embed.tsx
const renderEmbed = ({ img, duration, videoList = [] }) => renderToString(/* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	referrerpolicy: "no-referrer",
	style: "width:50%",
	poster: img,
	duration,
	children: videoList.map((source) => /* @__PURE__ */ jsx("source", {
		referrerpolicy: "no-referrer",
		src: source
	}))
}));
//#endregion
//#region lib/routes/douyin/templates/iframe.tsx
const renderIframe = ({ content }) => {
	return renderToString(/* @__PURE__ */ jsx("iframe", {
		referrerpolicy: "no-referrer",
		width: "100%",
		height: "150vh",
		frameborder: "0",
		marginheight: "0",
		marginwidth: "0",
		style: "border:0; margin:0; padding:0; width:100%; height:150vh;",
		srcdoc: `<!DOCTYPE html><html><head><meta name="referrer" content="no-referrer"></head><body>${content}</body></html>`
	}));
};
//#endregion
//#region lib/routes/douyin/utils.ts
const templates = {
	desc: renderDesc,
	cover: renderCover,
	embed: renderEmbed,
	iframe: renderIframe
};
const resolveUrl = (url, tls = true, forceResolve = false) => {
	if (!url) return "";
	if (url.startsWith("//")) return (tls ? "https:" : "http:") + url;
	if (forceResolve && !/^https?:\/\//.test(url)) return (tls ? "https://" : "http://") + url;
	return url;
};
const proxyVideo = (url, proxy) => {
	if (!(url && proxy)) return url + "";
	if (proxy.includes("?")) {
		if (!proxy.endsWith("=")) proxy += "=";
		return proxy + encodeURIComponent(url);
	}
	if (!proxy.endsWith("/")) proxy += "/";
	return proxy + url;
};
const getOriginAvatar = (url) => resolveUrl(url).replace(/^(.*\.douyinpic\.com\/).*(\/aweme-avatar\/)([^?]*)(\?.*)?$/, "$1origin$2$3").replaceAll(/~\w+_\d+x\d+/g, "");
/**
* FeedFuse 注入的 Cookie 头。优先读取自定义头（来自当前订阅用户的凭据），
* 回退到标准 Cookie 头，避免与内嵌场景互斥。
*/
const DOUYIN_COOKIE_DOMAIN = ".douyin.com";
const getCookieFromContext = (ctx) => ctx.req.header("x-feedfuse-cookie") || ctx.req.header("cookie") || "";
/**
* 把 Cookie 头字符串写入浏览器上下文，用于绕过抖音反爬 WAF。
* cookie 为空 / 无法解析时静默跳过，不影响原有行为。
*/
const applyCookie = async (context, cookieStr) => {
	if (!cookieStr) return;
	const cookies = cookieStr.split(";").map((item) => item.trim()).filter(Boolean).map((item) => {
		const equalIndex = item.indexOf("=");
		if (equalIndex <= 0) return;
		return {
			name: item.slice(0, equalIndex).trim(),
			value: item.slice(equalIndex + 1).trim(),
			domain: DOUYIN_COOKIE_DOMAIN,
			path: "/"
		};
	}).filter((item) => item !== void 0);
	if (cookies.length > 0) await context.addCookies(cookies);
};
//#endregion
export { resolveUrl as a, proxyVideo as i, getCookieFromContext as n, templates as o, getOriginAvatar as r, applyCookie as t };
