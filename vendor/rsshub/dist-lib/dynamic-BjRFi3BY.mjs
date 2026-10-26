import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as parseDuration } from "./helpers-5QIj7EjI.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { n as getVideoUrl, r as utils_default, t as getLiveUrl } from "./utils-BLUZ3MUn.mjs";
import { t as cache_default$1 } from "./cache-DzpZriu0.mjs";
import { t as CaptchaError } from "./captcha-BP6deQBe.mjs";
import JSONbig from "json-bigint";
//#region lib/routes/bilibili/dynamic.ts
const route = {
	path: "/user/dynamic/:uid/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/bilibili/user/dynamic/2267573",
	parameters: {
		uid: "用户 id, 可在 UP 主主页中找到",
		routeParams: `
| 键         | 含义                              | 接受的值       | 默认值 |
| ---------- | --------------------------------- | -------------- | ------ |
| showEmoji  | 显示或隐藏表情图片                | 0/1/true/false | false  |
| embed      | 默认开启内嵌视频                  | 0/1/true/false |  true  |
| useAvid    | 视频链接使用 AV 号 (默认为 BV 号) | 0/1/true/false | false  |
| directLink | 使用内容直链                      | 0/1/true/false | false  |
| hideGoods  | 隐藏带货动态                      | 0/1/true/false | false  |
| offset     | 偏移状态                         | string         | ""  |

用例：\`/bilibili/user/dynamic/2267573/showEmoji=1&embed=0&useAvid=1\``
	},
	features: {
		requireConfig: [{
			name: "BILIBILI_COOKIE_*",
			optional: true,
			description: `如果没有此配置，那么必须开启 Playwright 支持；BILIBILI_COOKIE_{uid}: 用于用户关注动态系列路由，对应 uid 的 b 站用户登录后的 Cookie 值，\`{uid}\` 替换为 uid，如 \`BILIBILI_COOKIE_2267573\`，获取方式：
1.  打开 [https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8](https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=0&type=8)
2.  打开控制台，切换到 Network 面板，刷新
3.  点击 dynamic_new 请求，找到 Cookie
4.  视频和专栏，UP 主粉丝及关注只要求 \`SESSDATA\` 字段，动态需复制整段 Cookie`
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["space.bilibili.com/:uid"],
		target: "/user/dynamic/:uid"
	}],
	name: "UP 主动态",
	maintainers: [
		"DIYgod",
		"zytomorrow",
		"CaoMeiYouRen",
		"JimenezLi"
	],
	handler
};
const getTitle = (data) => {
	const major = data.module_dynamic?.major;
	if (!major) return "";
	if (major.none) return major.none.tips;
	if (major.courses) return `${major.courses?.title} - ${major.courses?.sub_title}`;
	if (major.live_rcmd?.content) return JSON.parse(major.live_rcmd.content)?.live_play_info?.title;
	return major[major.type.replace("MAJOR_TYPE_", "").toLowerCase()]?.title;
};
const getDes = (data) => {
	let desc = "";
	if (data.module_dynamic?.desc?.text) desc += data.module_dynamic.desc.text;
	const major = data.module_dynamic?.major;
	if (!major) return desc;
	if (major?.common?.desc) {
		desc += desc ? `<br>//转发自: ${major.common.desc}` : major.common.desc;
		return desc;
	}
	if (major?.live) return `${major.live?.desc_first}<br>${major.live?.desc_second}`;
	if (major.live_rcmd?.content) {
		const live_play_info = JSON.parse(major.live_rcmd.content)?.live_play_info;
		return `${live_play_info?.area_name}·${live_play_info?.watched_show?.text_large}`;
	}
	if (major?.opus) return major?.opus?.summary?.text;
	return major[major.type.replace("MAJOR_TYPE_", "").toLowerCase()]?.desc;
};
const getOriginTitle = (data) => data && getTitle(data);
const getOriginDes = (data) => data && getDes(data);
const getOriginName = (data) => data?.module_author?.name;
const getIframe = (data, embed = true) => {
	if (!embed) return "";
	const aid = data?.module_dynamic?.major?.archive?.aid;
	const bvid = data?.module_dynamic?.major?.archive?.bvid;
	if (aid === void 0 && bvid === void 0) return "";
	return utils_default.renderUGCDescription(embed, "", "", aid, void 0, bvid);
};
const getImgs = (data) => {
	const imgUrls = [];
	const major = data?.module_dynamic?.major;
	if (!major) return "";
	if (major.opus?.pics?.length) imgUrls.push(...major.opus.pics.map((e) => ({
		url: e.url,
		width: e.width,
		height: e.height
	})));
	if (major.article?.covers?.length) imgUrls.push(...major.article.covers.map((e) => ({ url: e })));
	if (major.draw?.items?.length) imgUrls.push(...major.draw.items.map((e) => ({
		url: e.src,
		width: e.width,
		height: e.height
	})));
	if (major.live_rcmd?.content) imgUrls.push({ url: JSON.parse(major.live_rcmd.content)?.live_play_info?.cover });
	const type = major.type.replace("MAJOR_TYPE_", "").toLowerCase();
	if (major[type]?.cover) imgUrls.push({ url: major[type]?.cover });
	return imgUrls.filter(Boolean).map((img) => `<img src="${img.url}" ${img.width ? `width="${img.width}"` : ""} ${img.height ? `height="${img.height}"` : ""}>`).join("");
};
const getUrl = (item, useAvid = false) => {
	const data = item?.modules;
	if (!data) return null;
	let url = "";
	let text = "";
	let videoPageUrl;
	const major = data.module_dynamic?.major;
	if (!major) return null;
	switch (major?.type) {
		case "MAJOR_TYPE_UGC_SEASON":
			url = major?.ugc_season?.jump_url || "";
			text = `合集地址：<a href=${url}>${url}</a>`;
			break;
		case "MAJOR_TYPE_ARTICLE":
			url = `https://www.bilibili.com/read/cv${major?.article?.id}`;
			text = `专栏地址：<a href=${url}>${url}</a>`;
			break;
		case "MAJOR_TYPE_ARCHIVE": {
			const archive = major?.archive;
			url = `https://www.bilibili.com/video/${useAvid ? `av${archive?.aid}` : archive?.bvid}`;
			text = `视频地址：<a href=${url}>${url}</a>`;
			videoPageUrl = getVideoUrl(archive?.bvid);
			break;
		}
		case "MAJOR_TYPE_COMMON":
			url = major?.common?.jump_url || "";
			text = `地址：<a href=${url}>${url}</a>`;
			break;
		case "MAJOR_TYPE_OPUS":
			if (item?.type === "DYNAMIC_TYPE_ARTICLE") {
				url = `https:${major?.opus?.jump_url}`;
				text = `专栏地址：<a href=${url}>${url}</a>`;
			} else if (item?.type === "DYNAMIC_TYPE_DRAW") {
				url = `https:${major?.opus?.jump_url}`;
				text = `图文地址：<a href=${url}>${url}</a>`;
			}
			break;
		case "MAJOR_TYPE_PGC": {
			const pgc = major?.pgc;
			url = `https://www.bilibili.com/bangumi/play/ep${pgc?.epid}&season_id=${pgc?.season_id}`;
			text = `剧集地址：<a href=${url}>${url}</a>`;
			break;
		}
		case "MAJOR_TYPE_COURSES":
			url = `https://www.bilibili.com/cheese/play/ss${major?.courses?.id}`;
			text = `课程地址：<a href=${url}>${url}</a>`;
			break;
		case "MAJOR_TYPE_MUSIC":
			url = `https://www.bilibili.com/audio/au${major?.music?.id}`;
			text = `音频地址：<a href=${url}>${url}</a>`;
			break;
		case "MAJOR_TYPE_LIVE":
			url = `https://live.bilibili.com/${major?.live?.id}`;
			text = `直播间地址：<a href=${url}>${url}</a>`;
			break;
		case "MAJOR_TYPE_LIVE_RCMD": {
			const live_play_info = JSON.parse(major.live_rcmd?.content || "{}")?.live_play_info;
			url = `https://live.bilibili.com/${live_play_info?.room_id}`;
			videoPageUrl = getLiveUrl(live_play_info?.room_id);
			text = `直播间地址：<a href=${url}>${url}</a>`;
			break;
		}
		default: return null;
	}
	return {
		url,
		text,
		videoPageUrl
	};
};
async function handler(ctx) {
	const isJsonFeed = ctx.req.query("format") === "json";
	const uid = ctx.req.param("uid");
	const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param("routeParams")));
	const showEmoji = fallback(void 0, queryToBoolean(routeParams.showEmoji), false);
	const embed = fallback(void 0, queryToBoolean(routeParams.embed), false);
	const displayArticle = ctx.req.query("mode") === "fulltext";
	const offset = fallback(void 0, routeParams.offset, "");
	const useAvid = fallback(void 0, queryToBoolean(routeParams.useAvid), false);
	const directLink = fallback(void 0, queryToBoolean(routeParams.directLink), false);
	const hideGoods = fallback(void 0, queryToBoolean(routeParams.hideGoods), false);
	const getDynamic = async (cookie) => {
		const response = await got_default(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?${utils_default.addDmVerifyInfo(`offset=${offset}&host_mid=${uid}&platform=web&features=itemOpusStyle,listOnlyfans,opusBigCover,onlyfansVote`, utils_default.getDmImgList())}`, { headers: {
			Referer: `https://space.bilibili.com/${uid}/`,
			Cookie: cookie
		} });
		return JSONbig.parse(response.body);
	};
	let body;
	body = await getDynamic(await cache_default$1.getCookie());
	if (body?.code === -352) {
		body = await getDynamic(await cache_default$1.getCookie(true));
		if (body?.code === -352) {
			cache_default.set("bili-cookie", "");
			throw new CaptchaError("遇到源站风控校验，请稍后再试");
		}
	}
	const items = body?.data?.items;
	let author = items[0]?.modules?.module_author?.name;
	let face = items[0]?.modules?.module_author?.face;
	if (!face || !author) {
		const usernameAndFace = await cache_default$1.getUsernameAndFaceFromUID(uid);
		author = usernameAndFace[0] || items[0]?.modules?.module_author?.name;
		face = usernameAndFace[1] || items[0]?.modules?.module_author?.face;
	} else {
		cache_default.set(`bili-username-from-uid-${uid}`, author);
		cache_default.set(`bili-userface-from-uid-${uid}`, face);
	}
	const rssItems = await Promise.all(items.filter((item) => {
		if (hideGoods) return item.modules.module_dynamic?.additional?.type !== "ADDITIONAL_TYPE_GOODS";
		return true;
	}).map(async (item) => {
		const data = item.modules;
		const origin = item?.orig?.modules;
		const bvid = data?.module_dynamic?.major?.archive?.bvid;
		let link = "";
		if (item.id_str) link = `https://t.bilibili.com/${item.id_str}`;
		const originalDescription = getDes(data) || "";
		let description = originalDescription;
		const title = getTitle(data);
		const category = [];
		if (data.module_dynamic?.desc?.rich_text_nodes?.length) {
			const nodes = data.module_dynamic.desc.rich_text_nodes;
			for (const node of nodes) {
				if (showEmoji && node?.emoji) {
					const emoji = node.emoji;
					description = description.replaceAll(emoji.text, () => `<img alt="${emoji.text}" src="${emoji.icon_url}" style="margin: -1px 1px 0px; display: inline-block; width: 20px; height: 20px; vertical-align: text-bottom;" title="" referrerpolicy="no-referrer">`);
				}
				if (node?.pics?.length) {
					const { pics, text } = node;
					description = description.replaceAll(text, () => pics.map((pic) => `<img alt="${text}" src="${pic.src}" style="margin: 0px 0px 0px; display: inline-block; width: ${pic.width}px; height: ${pic.height}px; vertical-align: text-bottom;" title="" referrerpolicy="no-referrer">`).join("<br>"));
				}
				if (node?.type === "RICH_TEXT_NODE_TYPE_TOPIC") category.push(node.text.match(/#(\S+)#/)?.[1] || "");
			}
		}
		if (data.module_dynamic?.major?.opus?.summary?.rich_text_nodes?.length) {
			const nodes = data.module_dynamic.major.opus.summary.rich_text_nodes;
			for (const node of nodes) if (node?.type === "RICH_TEXT_NODE_TYPE_TOPIC") category.push(node.text.match(/#(\S+)#/)?.[1] || "");
		}
		if (data.module_dynamic?.topic?.name) category.push(data.module_dynamic.topic.name);
		if (item.type === "DYNAMIC_TYPE_ARTICLE" && displayArticle) {
			const cvid = data.module_dynamic?.major?.opus?.jump_url?.match?.(/cv(\d+)/)?.[0];
			if (cvid) description = (await cache_default$1.getArticleDataFromCvid(cvid, uid)).description || "";
		}
		const urlResult = getUrl(item, useAvid);
		const urlText = urlResult?.text;
		if (urlResult && directLink) link = urlResult.url;
		const originUrlResult = getUrl(item?.orig, useAvid);
		const originUrlText = originUrlResult?.text;
		if (originUrlResult && directLink) link = originUrlResult.url;
		let originDescription = "";
		const originName = getOriginName(origin);
		const originTitle = getOriginTitle(origin);
		const originDes = getOriginDes(origin);
		if (originName) originDescription += `//转发自: @${getOriginName(origin)}: `;
		if (originTitle) originDescription += originTitle;
		if (originDes) originDescription += `<br>${originDes}`;
		description = description.replaceAll("\r\n", "<br>").replaceAll("\n", "<br>");
		originDescription = originDescription.replaceAll("\r\n", "<br>").replaceAll("\n", "<br>");
		const descriptions = [
			title,
			description,
			getIframe(data, embed),
			getImgs(data),
			urlText,
			originDescription,
			getIframe(origin, embed),
			getImgs(origin),
			originUrlText
		].map((e) => e?.trim()).filter(Boolean).join("<br>");
		const subtitles = isJsonFeed && !config.bilibili.excludeSubtitles && bvid ? await cache_default$1.getVideoSubtitleAttachment(bvid) : [];
		return {
			title: title || originalDescription,
			description: descriptions,
			pubDate: data.module_author?.pub_ts ? parseDate(data.module_author.pub_ts, "X") : void 0,
			link,
			author,
			category: category.length ? [...new Set(category)] : void 0,
			attachments: urlResult?.videoPageUrl || originUrlResult?.videoPageUrl ? [{
				url: urlResult?.videoPageUrl || originUrlResult?.videoPageUrl,
				mime_type: "text/html",
				duration_in_seconds: data.module_dynamic?.major?.archive?.duration_text ? parseDuration(data.module_dynamic.major.archive.duration_text) : void 0
			}, ...subtitles] : void 0
		};
	}));
	return {
		title: `${author} 的 bilibili 动态`,
		link: `https://space.bilibili.com/${uid}/dynamic`,
		description: `${author} 的 bilibili 动态`,
		image: face,
		logo: face,
		icon: face,
		item: rssItems
	};
}
//#endregion
export { route };
