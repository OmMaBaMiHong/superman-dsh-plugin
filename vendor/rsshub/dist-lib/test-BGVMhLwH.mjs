import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as CaptchaError } from "./captcha-BP6deQBe.mjs";
import { t as wait } from "./wait-Do273esS.mjs";
import { n as fetchArticle } from "./wechat-mp-D2I-Y5FJ.mjs";
//#region lib/routes/test/index.ts
let cacheIndex = 0;
const route = {
	path: "/:id/:params?",
	name: "Test",
	maintainers: ["DIYgod", "NeverBehave"],
	handler
};
async function handler(ctx) {
	if (ctx.req.param("id") === "error") throw new Error("Error test");
	if (ctx.req.param("id") === "httperror") await got_default({
		method: "get",
		url: "https://httpbingo.org/status/404"
	});
	if (ctx.req.param("id") === "config-not-found-error") throw new ConfigNotFoundError("Test config not found error");
	if (ctx.req.param("id") === "invalid-parameter-error") throw new InvalidParameterError("Test invalid parameter error");
	if (ctx.req.param("id") === "captcha-error") throw new CaptchaError("Test captcha error");
	if (ctx.req.param("id") === "redirect") {
		ctx.set("redirect", "/test/1");
		return;
	}
	let item = [];
	let image = null;
	switch (ctx.req.param("id")) {
		case "filter":
			item = [
				{
					title: "Filter Title1",
					description: "Description1",
					pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
					link: "https://github.com/DIYgod/RSSHub/issues/-1",
					author: "DIYgod0",
					category: ["Category0", "Category1"]
				},
				{
					title: "Filter Title2",
					description: "Description2",
					pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
					link: "https://github.com/DIYgod/RSSHub/issues/0",
					author: "DIYgod0",
					category: [
						"Category0",
						"Category1",
						"Category2"
					]
				},
				{
					title: "Filter Title3",
					description: "Description3",
					pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
					link: "https://github.com/DIYgod/RSSHub/issues/1",
					author: "DIYgod0",
					category: "Category3"
				}
			];
			break;
		case "filter-illegal-category":
			item.push({
				title: "TitleIllegal",
				description: "DescriptionIllegal",
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/1",
				author: "DIYgod0",
				category: [
					1,
					"CategoryIllegal",
					true,
					null,
					void 0,
					{ type: "object" }
				]
			});
			break;
		case "long":
			item.push({
				title: "Long Title ".repeat(50),
				description: "Long Description ".repeat(10),
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/0",
				author: "DIYgod0"
			});
			break;
		case "cache": {
			const description = await cache_default.tryGet("test", () => ({ text: `Cache${++cacheIndex}` }));
			item.push({
				title: "Cache Title",
				description: description.text,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/0",
				author: "DIYgod0"
			});
			break;
		}
		case "refreshCache": {
			let refresh = await cache_default.get("refreshCache");
			let noRefresh = await cache_default.get("noRefreshCache", false);
			if (!refresh) {
				refresh = "0";
				await cache_default.set("refreshCache", "1");
			}
			if (!noRefresh) {
				noRefresh = "0";
				await cache_default.set("noRefreshCache", "1", void 0);
			}
			item.push({
				title: "Cache Title",
				description: refresh + " " + noRefresh,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/0",
				author: "DIYgod0"
			});
			break;
		}
		case "cacheUrlKey": {
			const description = await cache_default.tryGet(new URL("https://rsshub.app"), () => ({ text: `Cache${++cacheIndex}` }), config.cache.routeExpire * 2);
			item.push({
				title: "Cache Title",
				description: description.text,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/0",
				author: "DIYgod0"
			});
			break;
		}
		case "complicated":
			image = "https://mock.com/DIYgod/RSSHub.png";
			item.push({
				title: "Complicated Title",
				description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">
<script>alert(1);<\/script>
<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg">
<img data-src="/DIYgod/RSSHub.jpg">
<img data-mock="/DIYgod/RSSHub.png">
<img mock="/DIYgod/RSSHub.gif">
<img src="http://mock.com/DIYgod/DIYgod/RSSHub">
<img src="/DIYgod/RSSHub.jpg" onclick="alert(1);" onerror="alert(1);" onload="alert(1);">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">`,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "//mock.com/DIYgod/RSSHub",
				author: "DIYgod"
			}, {
				title: "Complicated Title",
				description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">`,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://mock.com/DIYgod/RSSHub",
				author: "DIYgod"
			}, {
				title: "Complicated Title",
				description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">`,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "//mock.com/DIYgod/RSSHub",
				author: "DIYgod",
				enclosure_url: "https://mock.com/DIYgod/RSSHub.png",
				enclosure_type: "image/png",
				itunes_item_image: "https://mock.com/DIYgod/RSSHub.gif"
			}, {
				title: "Complicated Title",
				description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">`,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "//mock.com/DIYgod/RSSHub",
				author: "DIYgod",
				image: "https://mock.com/DIYgod/RSSHub.jpg"
			});
			break;
		case "multimedia":
			item.push({
				title: "Multimedia Title",
				description: `<img src="/DIYgod/RSSHub.jpg">
<video src="/DIYgod/RSSHub.mp4"></video>
<video poster="/DIYgod/RSSHub.jpg">
<source src="/DIYgod/RSSHub.mp4" type="video/mp4">
<source src="/DIYgod/RSSHub.webm" type="video/webm">
</video>
<audio src="/DIYgod/RSSHub.mp3"></audio>
<iframe src="/DIYgod/RSSHub.html"></iframe>`,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://mock.com/DIYgod/RSSHub",
				author: "DIYgod"
			}, {
				title: "Multimedia Title",
				description: `<img src="/DIYgod/RSSHub.jpg">
<video src="/DIYgod/RSSHub.mp4"></video>`,
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://mock.com/DIYgod/RSSHub",
				author: "DIYgod",
				enclosure_url: "https://mock.com/DIYgod/RSSHub.mp4",
				enclosure_type: "video/mp4"
			});
			break;
		case "sort":
			item.push({
				title: "Sort Title 0",
				link: "https://github.com/DIYgod/RSSHub/issues/s1",
				author: "DIYgod0"
			}, {
				title: "Sort Title 1",
				link: "https://github.com/DIYgod/RSSHub/issues/s1",
				author: "DIYgod0"
			}, {
				title: "Sort Title 2",
				link: "https://github.com/DIYgod/RSSHub/issues/s2",
				pubDate: (/* @__PURE__ */ new Date(1546272e6 - 100 * 1e3)).toUTCString(),
				author: "DIYgod0"
			}, {
				title: "Sort Title 3",
				link: "https://github.com/DIYgod/RSSHub/issues/s3",
				pubDate: (/* @__PURE__ */ new Date(1546272e6)).toUTCString(),
				author: "DIYgod0"
			});
			break;
		case "mess":
			item.push({
				title: "Mess Title",
				link: "/DIYgod/RSSHub/issues/0",
				pubDate: 1546272e6,
				author: "DIYgod0"
			});
			break;
		case "opencc":
			item.push({
				title: "小可愛",
				description: "宇宙無敵",
				link: "/DIYgod/RSSHub/issues/0",
				pubDate: (/* @__PURE__ */ new Date(1546272e6)).toUTCString(),
				author: "DIYgod0"
			});
			break;
		case "brief":
			item.push({
				title: "小可愛",
				description: "<p>宇宙無敵</p><br>".repeat(1e3),
				link: "/DIYgod/RSSHub/issues/0",
				pubDate: (/* @__PURE__ */ new Date(1546272e6)).toUTCString(),
				author: "DIYgod0"
			});
			break;
		case "json":
			item.push({
				title: "Title0",
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/-3"
			}, {
				title: "Title1",
				description: "Description1",
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/-2",
				author: "DIYgod0 ",
				category: "Category0"
			}, {
				title: "Title2 HTML in description",
				description: "<a href=\"https://github.com/DIYgod/RSSHub\">RSSHub</a>",
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				updated: (/* @__PURE__ */ new Date("2019-3-2")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/-1",
				author: [{ name: " DIYgod1" }, { name: "DIYgod2 " }],
				category: ["Category0", "Category1"]
			}, {
				title: "Title3 HTML in content",
				content: { html: "<a href=\"https://github.com/DIYgod/RSSHub\">DIYgod/RSSHub</a>" },
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				updated: (/* @__PURE__ */ new Date("2019-3-2")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/0",
				author: [
					{ name: "   DIYgod3" },
					{ name: "DIYgod4   " },
					{ name: "DIYgod5   " }
				],
				category: ["Category1"],
				enclosure_url: "https://github.com/DIYgod/RSSHub/issues/0",
				enclosure_type: "image/jpeg",
				enclosure_length: 3661,
				itunes_duration: 36610
			}, {
				title: "Title4 author is null",
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/pull/11555",
				author: null
			});
			break;
		case "gpt":
			item.push({
				title: "Title0",
				description: "Description0",
				pubDate: (/* @__PURE__ */ new Date("2019-3-1")).toUTCString(),
				link: "https://github.com/DIYgod/RSSHub/issues/0"
			});
			break;
		default:
	}
	for (let i = 1; i < 6; i++) item.push({
		title: `Title${i}`,
		description: `Description${i}`,
		pubDate: (/* @__PURE__ */ new Date((ctx.req.param("id") === "current_time" ? /* @__PURE__ */ new Date() : 1546272e6) - i * 10 * 1e3)).toUTCString(),
		link: `https://github.com/DIYgod/RSSHub/issues/${i}`,
		author: `DIYgod${i}`
	});
	if (ctx.req.param("id") === "empty") item = null;
	if (ctx.req.param("id") === "allow_empty") item = null;
	if (ctx.req.param("id") === "enclosure") item = [{
		title: "",
		link: "https://github.com/DIYgod/RSSHub/issues/1",
		enclosure_url: "https://github.com/DIYgod/RSSHub/issues/1",
		enclosure_length: 3661,
		itunes_duration: 36610
	}];
	if (ctx.req.param("id") === "slow") await wait(1e3);
	if (ctx.req.param("id") === "slow4") await wait(4e3);
	if (ctx.req.query("mode") === "fulltext") item = [{
		title: "",
		link: "https://m.thepaper.cn/newsDetail_forward_4059298"
	}];
	if (ctx.req.param("id") === "wechat-mp") {
		const params = ctx.req.param("params");
		if (!params) throw new InvalidParameterError("Invalid parameter");
		item = [await fetchArticle("https:/mp.weixin.qq.com/s" + (params.includes("&") ? "?" : "/") + params)];
	}
	return {
		image,
		title: `Test ${ctx.req.param("id")}`,
		itunes_author: ctx.req.param("id") === "enclosure" ? "DIYgod" : null,
		link: "https://github.com/DIYgod/RSSHub",
		item,
		allowEmpty: ctx.req.param("id") === "allow_empty",
		description: ctx.req.param("id") === "complicated" ? "<img src=\"http://mock.com/DIYgod/DIYgod/RSSHub\">" : ctx.req.param("id") === "multimedia" ? "<video src=\"http://mock.com/DIYgod/DIYgod/RSSHub\"></video>" : "A test route for RSSHub"
	};
}
//#endregion
export { route };
