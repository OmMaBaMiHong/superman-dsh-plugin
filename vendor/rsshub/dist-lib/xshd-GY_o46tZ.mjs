import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as fetchArticle, t as WeChatMpError } from "./wechat-mp-D2I-Y5FJ.mjs";
import { Fragment, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/sjtu/cs/xshd.tsx
const host = "https://www.cs.sjtu.edu.cn";
function absolutize(url) {
	if (!url) return "";
	return new URL(url, host).href;
}
function parseListing(html) {
	const $ = load(html);
	return $(".ny-con .u12 > li").toArray().map((el) => {
		const $el = $(el);
		const link = absolutize($el.find("> a").attr("href"));
		const title = $el.find(".txt .tit").text();
		const image = absolutize($el.find(".imgk img").attr("src"));
		const adRows = $el.find(".txt .ad p").toArray().map((p) => $(p).find("span").text().trim()).filter(Boolean);
		const findRow = (prefix) => adRows.find((s) => s.startsWith(prefix))?.slice(prefix.length) ?? "";
		return {
			title,
			link,
			image,
			timeText: findRow("时间："),
			location: findRow("地点："),
			speakers: findRow("报告人："),
			topic: findRow("主题：")
		};
	}).filter((it) => it.link && it.title);
}
function publishDateFromImage(imageUrl) {
	const m = imageUrl.match(/\/upload\/[^/]+\/(\d{4})(\d{2})(\d{2})\//);
	if (!m) return;
	const [, y, mo, d] = m;
	return timezone(parseDate(`${y}-${mo}-${d}`, "YYYY-MM-DD"), 8);
}
function renderDescription(item) {
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		item.timeText && /* @__PURE__ */ jsxs("p", { children: ["举办时间：", item.timeText] }),
		item.location && /* @__PURE__ */ jsxs("p", { children: ["地点：", item.location] }),
		item.topic && /* @__PURE__ */ jsxs("p", { children: ["主题：", item.topic] })
	] }));
}
function rewriteRelativeUrls($, item) {
	item.find("img").each((_, e) => {
		const src = $(e).attr("src") || $(e).attr("_src");
		if (src) $(e).attr("src", absolutize(src));
	});
	item.find("a").each((_, e) => {
		const href = $(e).attr("href");
		if (href) $(e).attr("href", absolutize(href));
	});
}
function extractWechatUrl(finalUrl) {
	return new URL(finalUrl).searchParams.get("target_url") || finalUrl;
}
function basicItem(item) {
	return {
		title: item.title,
		link: item.link,
		description: renderDescription(item),
		author: item.speakers || void 0,
		image: item.image || void 0,
		pubDate: publishDateFromImage(item.image)
	};
}
function enrichItem(item) {
	return cache_default.tryGet(item.link, async () => {
		const response = await rofetch.raw(item.link);
		const finalUrl = response.url;
		let description = renderDescription(item);
		let pubDate = publishDateFromImage(item.image);
		if (new URL(finalUrl).hostname === "mp.weixin.qq.com") try {
			const article = await fetchArticle(extractWechatUrl(finalUrl));
			description += `<hr>${article.description}`;
			pubDate = article.pubDate || pubDate;
		} catch (error) {
			if (!(error instanceof WeChatMpError)) throw error;
		}
		else {
			const $ = load(response._data ?? "");
			const $body = $(".xw-cont");
			if ($body.length > 0) {
				const $txt = $body.find(".txt");
				rewriteRelativeUrls($, $txt);
				description += `<hr>${$txt.html() ?? ""}`;
				const publishedMatch = $body.find(".jj p").first().text().match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
				if (publishedMatch) {
					const [, y, m, d] = publishedMatch;
					pubDate = timezone(parseDate(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`, "YYYY-MM-DD"), 8);
				}
			}
		}
		return {
			title: item.title,
			link: item.link,
			description,
			author: item.speakers || void 0,
			image: item.image || void 0,
			pubDate
		};
	});
}
const route = {
	path: "/cs/xshd",
	categories: ["university"],
	example: "/sjtu/cs/xshd",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.cs.sjtu.edu.cn/xshd.html"],
		target: "/cs/xshd"
	}],
	name: "计算机学院 - 学术活动",
	maintainers: ["BeaCox"],
	handler,
	url: "www.cs.sjtu.edu.cn/xshd.html"
};
async function handler() {
	const listLink = `${host}/xshd.html`;
	const items = parseListing(await rofetch(listLink));
	return {
		title: "上海交通大学计算机学院 - 学术活动",
		link: listLink,
		description: "上海交通大学计算机学院（网络空间安全学院、密码学院）学术活动",
		language: "zh-CN",
		item: (await Promise.allSettled(items.map((it) => enrichItem(it)))).map((result, index) => result.status === "fulfilled" ? result.value : basicItem(items[index]))
	};
}
//#endregion
export { route };
