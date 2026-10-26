import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { a as resolveUrl, i as proxyVideo, n as getCookieFromContext, o as templates, r as getOriginAvatar, t as applyCookie } from "./utils-aoskalbv.mjs";
//#region lib/routes/douyin/user.ts
const route = {
	path: "/user/:uid/:routeParams?",
	categories: ["social-media"],
	example: "/douyin/user/MS4wLjABAAAARcAHmmF9mAG3JEixq_CdP72APhBlGlLVbN-1eBcPqao",
	parameters: {
		uid: "uid，可在用户页面 URL 中找到",
		routeParams: "额外参数，query string 格式，请参阅上面的表格"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["douyin.com/user/:uid"],
		target: "/user/:uid"
	}],
	name: "博主",
	maintainers: ["Max-Tortoise", "Rongronggg9"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	if (!uid.startsWith("MS4wLjABAAAA")) throw new InvalidParameterError("Invalid UID. UID should start with <b>MS4wLjABAAAA</b>.");
	const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param("routeParams")));
	const embed = fallback(void 0, queryToBoolean(routeParams.embed), false);
	const iframe = fallback(void 0, queryToBoolean(routeParams.iframe), false);
	const relay = resolveUrl(routeParams.relay, true, true);
	const tab = routeParams.tab === "like" || routeParams.tab === "favorite" ? routeParams.tab : "post";
	const pageUrl = `https://www.douyin.com/user/${uid}${tab === "post" ? "" : `?showTab=${tab}`}`;
	const feedfuseCookie = getCookieFromContext(ctx);
	const pageData = await cache_default.tryGet(`douyin:user:${uid}:${tab}`, async () => {
		let postData;
		const context = await outPlaywright();
		const page = await context.newPage();
		await applyCookie(context, feedfuseCookie);
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "xhr" ? route.continue() : route.abort();
		});
		page.on("response", async (response) => {
			if (response.request().url().includes("/web/aweme/") && !postData) try {
				const json = await response.json();
				if (json && Array.isArray(json.aweme_list) && json.aweme_list.length > 0) postData = json;
			} catch {}
		});
		logger.http(`Requesting ${pageUrl}`);
		await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
		const deadline = Date.now() + 3e4;
		while (!postData && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 1e3));
		await context.close();
		if (!postData) throw new Error("Empty post data. The request may be filtered by WAF.");
		return postData;
	}, config.cache.routeExpire, false);
	if (!pageData.aweme_list?.length) throw new Error("Empty post data. The request may be filtered by WAF.");
	const userInfo = pageData.aweme_list[0].author;
	return {
		title: userInfo.nickname,
		image: getOriginAvatar(userInfo.avatar_thumb.url_list.at(-1)),
		link: pageUrl,
		item: pageData.aweme_list.map((post) => {
			let videoList = post.video?.bit_rate?.map((item) => resolveUrl(item.play_addr.url_list.at(-1)));
			if (relay) videoList = videoList.map((item) => proxyVideo(item, relay));
			let duration = post.video?.duration;
			duration &&= duration / 1e3;
			let img;
			img ||= post.video?.cover?.url_list.at(-1) || post.video?.origin_cover?.url_list.at(-1);
			img &&= resolveUrl(img);
			const desc = post.desc?.replaceAll("\n", "<br>");
			let media = (embed && videoList ? templates.embed : templates.cover)({
				img,
				videoList,
				duration
			});
			media = embed && videoList && iframe ? templates.iframe({ content: media }) : media;
			const description = templates.desc({
				desc,
				media
			});
			const stats = post.statistics ?? {};
			const statsHtml = `<div data-douyin-stats="` + [
				`aweme_id=${post.aweme_id}`,
				`create_time=${post.create_time}`,
				`duration=${duration || ""}`,
				`play_count=${stats.play_count ?? 0}`,
				`digg_count=${stats.digg_count ?? 0}`,
				`comment_count=${stats.comment_count ?? 0}`,
				`share_count=${stats.share_count ?? 0}`,
				`collect_count=${stats.collect_count ?? 0}`
			].join("&") + "\" style=\"display:none\"></div>";
			return {
				title: post.desc.split("\n", 1)[0],
				description: description + statsHtml,
				link: `https://www.douyin.com/video/${post.aweme_id}`,
				pubDate: parseDate(post.create_time * 1e3),
				category: post.video_tag.map((t) => t.tag_name)
			};
		})
	};
}
//#endregion
export { route };
