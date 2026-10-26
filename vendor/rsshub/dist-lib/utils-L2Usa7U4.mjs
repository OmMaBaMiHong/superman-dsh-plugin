import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as queryToInteger, n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { t as getCookies } from "./playwright-utils-S-7KcaVy.mjs";
import { load } from "cheerio";
import querystring from "node:querystring";
//#region lib/routes/weibo/utils.ts
var RenewWeiboCookiesError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "RenewWeiboCookiesError";
	}
};
const getDescriptionRenderParams = (routeParams, params = {}) => ({
	showEmojiInDescription: fallback(params.showEmojiInDescription, queryToInteger(routeParams.showEmojiInDescription), false),
	showLinkIconInDescription: fallback(params.showLinkIconInDescription, queryToInteger(routeParams.showLinkIconInDescription), true)
});
const formatDescriptionText = (html, { showEmojiInDescription, showLinkIconInDescription }) => {
	let formattedHtml = html;
	if (!showEmojiInDescription) formattedHtml = formattedHtml.replaceAll(/<span class=["']?url-icon["']?><img\s[^>]*?alt=["']?([^>\s"']+)["']?\s[^>]*?\/><\/span>/g, "$1");
	if (!showLinkIconInDescription) formattedHtml = formattedHtml.replaceAll(/(<a\s[^>]*>)<span class=["']?url-icon["']?><img\s[^>]*><\/span>[^<>]*<span class=["']?surl-text["']?>([^<>]*)<\/span><\/a>/g, "$1$2</a>");
	return formattedHtml;
};
const weiboUtils = {
	apiHeaders: {
		"MWeibo-Pwa": 1,
		"X-Requested-With": "XMLHttpRequest",
		"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
	},
	RenewWeiboCookiesError,
	getCookies: (() => {
		const url = "https://m.weibo.cn/";
		const coolingDownMessage = `Cooling down before new visitor Cookies from ${url} may be fetched`;
		let coolingDown = false;
		let visitorCookiesPromise;
		return async (renew = false) => {
			if (config.weibo.cookies) {
				if (renew) throw new Error("Cookies expired. Please update WEIBO_COOKIES");
				return config.weibo.cookies;
			}
			const cacheKey = "weibo:visitor-cookies";
			if (renew) cache_default.set(cacheKey, "", 1);
			return await cache_default.tryGet(cacheKey, async () => {
				if (visitorCookiesPromise) return await visitorCookiesPromise;
				if (coolingDown) {
					if (renew?.message) {
						logger.warn(coolingDownMessage);
						throw renew;
					}
					throw new Error(coolingDownMessage);
				}
				coolingDown = true;
				setTimeout(() => {
					coolingDown = false;
				}, config.cache.routeExpire * 1e3);
				if (renew) logger.warn(`Renewing visitor Cookies from ${url}`);
				else logger.info(`Fetching visitor Cookies from ${url}`);
				visitorCookiesPromise = (async () => {
					let times = 0;
					const { page, destroy } = await getPlaywrightPage(url, {
						onBeforeLoad: async (page) => {
							const expectResourceTypes = /* @__PURE__ */ new Set([
								"document",
								"script",
								"xhr",
								"fetch"
							]);
							await page.setExtraHTTPHeaders({ "User-Agent": weiboUtils.apiHeaders["User-Agent"] });
							await page.route("**/*", (route) => {
								const request = route.request();
								if (!expectResourceTypes.has(request.resourceType()) || times >= 2) {
									route.abort();
									return;
								}
								if (request.url().startsWith(url)) times++;
								route.continue();
							});
						},
						gotoConfig: { waitUntil: "networkidle" }
					});
					const cookies = await getCookies(page, "weibo.cn");
					await destroy();
					if (times < 2 || !cookies) throw new Error(`Unable to fetch visitor cookies. Please set WEIBO_COOKIES. Redirection: ${times}, last URL: ${page.url()}`);
					return cookies;
				})();
				try {
					return await visitorCookiesPromise;
				} finally {
					visitorCookiesPromise = void 0;
				}
			});
		};
	})(),
	tryWithCookies: (() => {
		let errors = 0;
		const verifier = (resp) => {
			if (resp?.data?.ok === -100) throw new RenewWeiboCookiesError(`Cookies expired. Msg: ${resp?.data?.msg || ""} ${resp?.data?.url || ""}`);
		};
		return async (callback) => {
			try {
				return await callback(await weiboUtils.getCookies(false), verifier);
			} catch (error) {
				if (error.message?.includes("WEIBO_COOKIES")) throw error;
				if (errors > 10) {
					logger.warn(`Too many errors while fetching data from weibo API, renewing Cookies: ${error.message}`);
					logger.info("Please open an issue on GitHub if renewing Cookies fixes the error");
				} else if ((error.name === "HTTPError" || error.name === "FetchError") && error.status === 432) {} else if (error.name === "RenewWeiboCookiesError") {} else {
					errors++;
					throw error;
				}
				errors = 0;
				return await callback(await weiboUtils.getCookies(error), verifier);
			}
		};
	})(),
	formatTitle: (html) => html.replaceAll(/<span class=["']url-icon["']><img\s[^>]*?alt=["']?([^>\s"']+)["']?\s[^>]*?\/?><\/span>/g, "$1").replaceAll(/<span class=["']url-icon["']>(<img\s[^>]*>)<\/span>/g, "").replaceAll(/<img\s[^<]*>/g, "[图片]").replaceAll(/<[^<]*>/g, "").replaceAll("\n", " ").trim(),
	formatExtended: (ctx, status, uid, params = {}, picsPrefixes = []) => {
		const routeParams = querystring.parse(ctx.req.param("routeParams"));
		const descriptionRenderParams = getDescriptionRenderParams(routeParams, params);
		params = {
			readable: fallback(params.readable, queryToBoolean(routeParams.readable), false),
			authorNameBold: fallback(params.authorNameBold, queryToBoolean(routeParams.authorNameBold), false),
			showAuthorInTitle: fallback(params.showAuthorInTitle, queryToBoolean(routeParams.showAuthorInTitle), false),
			showAuthorInDesc: fallback(params.showAuthorInDesc, queryToBoolean(routeParams.showAuthorInDesc), false),
			showAuthorAvatarInDesc: fallback(params.showAuthorAvatarInDesc, queryToBoolean(routeParams.showAuthorAvatarInDesc), false),
			showAtBeforeAuthor: fallback(params.showAtBeforeAuthor, null, false),
			showEmojiForRetweet: fallback(params.showEmojiForRetweet, queryToBoolean(routeParams.showEmojiForRetweet), false),
			showRetweetTextInTitle: fallback(params.showRetweetTextInTitle, queryToBoolean(routeParams.showRetweetTextInTitle), true),
			addLinkForPics: fallback(params.addLinkForPics, queryToBoolean(routeParams.addLinkForPics), false),
			showTimestampInDescription: fallback(params.showTimestampInDescription, queryToBoolean(routeParams.showTimestampInDescription), false),
			widthOfPics: fallback(params.widthOfPics, queryToInteger(routeParams.widthOfPics), -1),
			heightOfPics: fallback(params.heightOfPics, queryToInteger(routeParams.heightOfPics), -1),
			sizeOfAuthorAvatar: fallback(params.sizeOfAuthorAvatar, queryToInteger(routeParams.sizeOfAuthorAvatar), 48),
			showEmojiInDescription: descriptionRenderParams.showEmojiInDescription,
			showLinkIconInDescription: descriptionRenderParams.showLinkIconInDescription,
			preferMobileLink: fallback(params.preferMobileLink, queryToBoolean(routeParams.preferMobileLink), false)
		};
		const { readable, authorNameBold, showAuthorInTitle, showAuthorInDesc, showAuthorAvatarInDesc, showAtBeforeAuthor, showEmojiForRetweet, showRetweetTextInTitle, addLinkForPics, showTimestampInDescription, widthOfPics, heightOfPics, sizeOfAuthorAvatar, preferMobileLink } = params;
		let retweeted = "";
		let htmlNewlineUnreplaced = status.longText && status.longText.longTextContent || status.text || "";
		htmlNewlineUnreplaced = formatDescriptionText(htmlNewlineUnreplaced, descriptionRenderParams);
		const category = htmlNewlineUnreplaced.match(/<span class=["']?surl-text["']?>#([^<>]*?)#<\/span>/g)?.map((e) => e?.match(/#([^#]+)#/)?.[1]);
		htmlNewlineUnreplaced = htmlNewlineUnreplaced.replaceAll("全文<br>", "<br>");
		htmlNewlineUnreplaced = htmlNewlineUnreplaced.replaceAll(/<a href="(.*?)">全文<\/a>/g, "");
		htmlNewlineUnreplaced = htmlNewlineUnreplaced.replaceAll(/"https:\/\/weibo\.cn\/sinaurl.*?[&?]u=(http.*?)"/g, (match, p1) => `"${decodeURIComponent(p1)}"`);
		htmlNewlineUnreplaced = htmlNewlineUnreplaced.replaceAll(/<a\s+href="https?:\/\/[^"]+\.(jpg|png|gif)"/g, (match) => `${match} data-rsshub-image="href"`);
		let html = htmlNewlineUnreplaced.replaceAll("\n", "<br>");
		if (showAuthorInDesc) {
			let usernameAndAvatar = `<a href="https://weibo.com/${status.user.id}" target="_blank">`;
			if (showAuthorAvatarInDesc) usernameAndAvatar += `<img width="${sizeOfAuthorAvatar}" height="${sizeOfAuthorAvatar}" src="${status.user.profile_image_url}" ${readable ? "hspace=\"8\" vspace=\"8\" align=\"left\"" : ""} />`;
			let name = status.user.screen_name;
			if (showAtBeforeAuthor) name = "@" + name;
			usernameAndAvatar += authorNameBold ? `<strong>${name}</strong></a>:&ensp;` : `${name}</a>:&ensp;`;
			html = usernameAndAvatar + html;
		}
		if (status.pics && !Array.isArray(status.pics) && typeof status.pics === "object") status.pics = Object.values(status.pics);
		if (status.page_info && status.page_info.type === "article" && status.page_info.page_pic && status.page_info.page_pic.url) {
			const pagePic = { large: { url: status.page_info.page_pic.url } };
			if (status.pics) status.pics.push(pagePic);
			else status.pics = [pagePic];
		}
		const livePhotoCount = status.pics ? status.pics.filter((pic) => pic.type === "livephoto").length : 0;
		const pics = status.pics && status.pics.filter((pic) => pic.type !== "livephoto");
		if (pics) {
			if (readable) html += "<br clear=\"both\" /><div style=\"clear: both\"></div>";
			let picsPrefix = "";
			for (const item of pics) picsPrefix += `<img width="0" height="0" hidden="true" src="${item.large.url}">`;
			picsPrefixes.push(picsPrefix);
			for (const item of pics) {
				if (addLinkForPics) html += "<a href=\"" + item.large.url + "\">";
				let style = "";
				html += "<img ";
				html += readable ? "vspace=\"8\" hspace=\"4\"" : "";
				if (item.large) {
					const { geo, url } = item.large;
					if (geo?.width || widthOfPics >= 0) {
						const width = geo?.width || widthOfPics;
						html += ` width="${width}"`;
						style += `width: ${width}px;`;
					}
					if (geo?.height || heightOfPics >= 0) {
						const height = geo?.height || heightOfPics;
						html += ` height="${height}"`;
						style += `height: ${height}px;`;
					}
					html += ` style="${style}" src="${url}">`;
				}
				if (addLinkForPics) html += "</a>";
				htmlNewlineUnreplaced += "<img src=\"\" />";
			}
		}
		if (status.retweeted_status) {
			html += readable ? "<br clear=\"both\" /><div style=\"clear: both\"></div><blockquote style=\"background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;\">" : "<br><blockquote> - 转发 ";
			if (!status.retweeted_status.user) status.retweeted_status.user = {
				profile_image_url: "",
				screen_name: "[原微博不可访问]",
				id: "sorry"
			};
			const retweetedParams = Object.assign({}, params);
			retweetedParams.showAuthorInDesc = true;
			retweetedParams.showAuthorAvatarInDesc = false;
			retweetedParams.showAtBeforeAuthor = true;
			retweeted += weiboUtils.formatExtended(ctx, status.retweeted_status, void 0, retweetedParams, picsPrefixes).description;
			html += retweeted;
			if (readable) html += `<br><small>原博：<a href="https://weibo.com/${status.retweeted_status.user.id}/${status.retweeted_status.bid}" target="_blank" rel="noopener noreferrer">https://weibo.com/${status.retweeted_status.user.id}/${status.retweeted_status.bid}</a></small>`;
			if (showTimestampInDescription) html += "<br><small>" + new Date(status.retweeted_status.created_at).toLocaleString() + "</small>";
			if (readable) html += "<br clear=\"both\" /><div style=\"clear: both\"></div>";
			html += "</blockquote>";
		}
		if (showAuthorInDesc && showAuthorAvatarInDesc) html = picsPrefixes.join("") + html;
		let title = "";
		if (showAuthorInTitle) title += status.user.screen_name + ": ";
		if (!status.retweeted_status || showRetweetTextInTitle) title += weiboUtils.formatTitle(htmlNewlineUnreplaced);
		if (status.retweeted_status) {
			title += showEmojiForRetweet ? "🔁 " : " - 转发 ";
			title += weiboUtils.formatTitle(retweeted);
		}
		if (livePhotoCount > 0) {
			title += " ";
			title += Array.from({ length: livePhotoCount + 1 }).join("[Live Photo]");
		}
		if (status.page_info && status.page_info === "video") title += " [视频]";
		uid ||= status.user?.id;
		const bid = status.bid || status.id;
		const guid = uid ? `https://weibo.com/${uid}/${bid}` : `https://m.weibo.cn/status/${bid}`;
		const link = preferMobileLink ? `https://m.weibo.cn/status/${bid}` : guid;
		const author = [{
			name: status.user?.screen_name,
			url: `https://weibo.com/${uid}`,
			avatar: status.user?.avatar_hd
		}];
		const pubDate = status.created_at;
		return {
			description: html,
			title,
			link,
			guid,
			author,
			pubDate,
			category
		};
	},
	getShowData: async (uid, bid) => {
		const link = `https://m.weibo.cn/statuses/show?id=${bid}`;
		return (await got_default.get(link, { headers: {
			Referer: `https://m.weibo.cn/u/${uid}`,
			...weiboUtils.apiHeaders
		} })).data.data;
	},
	formatVideo: (itemDesc, status) => {
		const pageInfo = status.page_info;
		const livePhotos = status.pics && status.pics.filter((pic) => pic.type === "livephoto" && pic.videoSrc);
		let video = "<br clear=\"both\" /><div style=\"clear: both\"></div>";
		let anyVideo = false;
		if (livePhotos) for (const livePhoto of livePhotos) {
			video += `<video controls="controls" poster="${livePhoto.large && livePhoto.large.url || livePhoto.url}" src="${livePhoto.videoSrc}" style="width: 100%"></video>`;
			anyVideo = true;
		}
		if (pageInfo && pageInfo.type === "video") {
			const pagePic = pageInfo.page_pic;
			const posterUrl = pagePic ? pagePic.url : "";
			const pageUrl = pageInfo.page_url;
			const mediaInfo = pageInfo.media_info || {};
			const urls = pageInfo.urls || {};
			const video720p = urls.mp4_720p_mp4 || mediaInfo.mp4_720p_mp4 || "";
			const videoHd = urls.mp4_hd_mp4 || mediaInfo.mp4_hd_url || mediaInfo.stream_url_hd || "";
			const videoHdHevc = urls.hevc_mp4_hd || "";
			const videoLd = urls.mp4_ld_mp4 || mediaInfo.mp4_sd_url || mediaInfo.stream_url || "";
			if (video720p || videoHd || videoHdHevc || videoLd) {
				video += `<video controls="controls" poster="${posterUrl}" style="width: 100%">`;
				if (video720p) video += `<source src="${video720p}">`;
				if (videoHd) video += `<source src="${videoHd}">`;
				if (videoHdHevc) video += `<source src="${videoHdHevc}">`;
				if (videoLd) video += `<source src="${videoLd}">`;
				if (pageUrl) video += `<p>视频无法显示，请前往<a href="${pageUrl}" target="_blank" rel="noopener noreferrer">微博视频</a>观看。</p>`;
				video += "</video>";
				anyVideo = true;
			}
		}
		if (anyVideo) itemDesc += video;
		return itemDesc;
	},
	formatArticle: async (ctx, itemDesc, status) => {
		const pageInfo = status.page_info;
		if (pageInfo && pageInfo.type === "article" && pageInfo.page_url) {
			const articleIdMatch = pageInfo.page_url.match(/id=(\d+)/);
			if (!articleIdMatch) return itemDesc;
			const articleId = articleIdMatch[1];
			const link = `https://card.weibo.com/article/m/aj/detail?id=${articleId}`;
			const article = (await cache_default.tryGet(link, async () => {
				return (await got_default.get(link, { headers: {
					Referer: `https://card.weibo.com/article/m/show/id/${articleId}`,
					...weiboUtils.apiHeaders
				} })).data;
			})).data;
			if (article && article.title && article.content) {
				const title = article.title;
				const content = article.content;
				const summary = article.summary;
				const createAt = article.create_at;
				const readCount = article.read_count;
				const isOriginal = article.is_original;
				const isArticleNonFree = article.is_article_free;
				let html = "<br clear=\"both\" /><br clear=\"both\" />";
				html += "<div style=\"clear: both\"></div><div style=\"background: #fff;border:5px solid #80808030;margin:0;padding:3% 5%;overflow-wrap: break-word\">";
				html += `<h1 style="font-size: 1.5rem;line-height: 1.25;color: #333;">${title}</h1>`;
				const iconStyle = "display: inline-block;margin-inline: 0.25rem;width: 2.25rem; height: 1.125rem; background: #eee; border-radius: 2px; box-sizing: border-box; text-align: center; line-height: 1.0625rem; font-size: 0.75rem; color: #aaa;";
				let articleMeta = "<p style=\"line-height: 1.66; color: #999;margin: 0 0 0.75rem;font-size: 0.75rem;padding: 0\">";
				if (isArticleNonFree) articleMeta += `<span style="${iconStyle}">试读</span> `;
				if (isOriginal) articleMeta += `<span style="${iconStyle}">原创</span> `;
				articleMeta += `<span style="margin-inline: 0.25rem;">发布时间: ${createAt}</span> `;
				articleMeta += `<span style="margin-inline: 0.25rem;">阅读量: ${readCount}</span> `;
				articleMeta += "</p>";
				html += articleMeta;
				if (summary) html += `<p style="color: #999;line-height: 1.5rem;padding: 0.0625rem 0 0.875rem;margin: 0">${summary}</p>`;
				html += "<div style=\"height: 0;border-bottom: 1px dashed #999;margin-bottom: 0.75rem;\"></div>";
				const $ = load(content);
				$("p").each((_, elem) => {
					elem = $(elem);
					let style = elem.attr("style") || "";
					style = "margin: 0;padding: 0;border: 0;" + style;
					elem.attr("style", style);
				});
				$(".image").each((_, elem) => {
					elem = $(elem);
					let style = elem.attr("style") || "";
					style = "display: table;text-align: center;margin-left: auto;margin-right: auto;clear: both;min-width: 50px;" + style;
					elem.attr("style", style);
				});
				$("img").each((_, elem) => {
					elem = $(elem);
					let style = elem.attr("style") || "";
					style = "display: block;max-width: 100%;margin-left: auto;margin-right: auto;min-width: 50px;" + style;
					elem.attr("style", style);
				});
				const contentHtml = $.html();
				html += `<div style="line-height: 1.59;text-align: justify;font-size: 1.0625rem;color: #333;">${contentHtml}</div>`;
				html += "</div>";
				itemDesc += html;
			}
		}
		return itemDesc;
	},
	formatComments: async (ctx, itemDesc, status, showBloggerIcons) => {
		const routeParams = querystring.parse(ctx.req.param("routeParams"));
		const descriptionRenderParams = getDescriptionRenderParams(routeParams);
		if (status && status.comments_count && status.id && status.mid) {
			const id = status.id;
			const link = `https://m.weibo.cn/comments/hotflow?id=${id}&mid=${status.mid}&max_id_type=0`;
			const response = await cache_default.tryGet(link, async () => {
				return (await got_default.get(link, { headers: {
					Referer: `https://m.weibo.cn/detail/${id}`,
					...weiboUtils.apiHeaders
				} })).data;
			});
			if (response.data && response.data.data) {
				const comments = response.data.data;
				itemDesc += "<br clear=\"both\" /><div style=\"clear: both\"></div><div style=\"background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;\">";
				itemDesc += "<h3>热门评论</h3>";
				for (const comment of comments) {
					itemDesc += "<p style=\"margin-bottom: 0.5em;margin-top: 0.5em\">";
					let name = comment.user.screen_name;
					if (showBloggerIcons === "1" && comment.blogger_icons) name += comment.blogger_icons[0].name;
					const commentText = formatDescriptionText(comment.text, descriptionRenderParams);
					itemDesc += `<a href="https://weibo.com/${comment.user.id}" target="_blank">${name}</a>: ${commentText}`;
					if ("pic" in comment) itemDesc += `<br><img src="${comment.pic.url}">`;
					if (comment.comments) {
						itemDesc += "<blockquote style=\"border-left:0.2em solid #80808080; margin-left: 0.3em; padding-left: 0.5em; margin-bottom: 0.5em; margin-top: 0.25em\">";
						for (const com of comment.comments) {
							const pattern = /<a\s+href="https:\/\/weibo\.cn\/sinaurl\?u=([^"]+)"[^>]*><span class='url-icon'><img[^>]*><\/span><span class="surl-text">(查看图片|评论配图|查看动图)<\/span><\/a>/g;
							let replyText = com.text;
							const matches = replyText.match(pattern);
							if (matches) for (const match of matches) {
								const hrefMatch = match.match(/href="https:\/\/weibo\.cn\/sinaurl\?u=([^"]+)"/);
								if (hrefMatch) {
									const imgTag = `<img src="${decodeURIComponent(hrefMatch[1])}" style="width: 1rem; height: 1rem;">`;
									replyText = replyText.replaceAll(match, () => imgTag);
								}
							}
							replyText = formatDescriptionText(replyText, descriptionRenderParams);
							itemDesc += "<div style=\"font-size: 0.9em\">";
							let name = com.user.screen_name;
							if (showBloggerIcons === "1" && com.blogger_icons) name += com.blogger_icons[0].name;
							itemDesc += `<a href="https://weibo.com/${com.user.id}" target="_blank">${name}</a>: ${replyText}`;
							itemDesc += "</div>";
						}
						itemDesc += "</blockquote>";
					}
					itemDesc += "</p>";
				}
				itemDesc += "</div>";
			}
		}
		return itemDesc;
	},
	sinaimgTvax: (() => {
		const regex = /(?<=\/\/)wx(?=[1-4]\.sinaimg\.cn\/)/gi;
		const replace = (html) => html.replaceAll(regex, "tvax");
		const replaceKV = (obj, keys) => {
			for (const key of keys) {
				const value = obj[key];
				if (value) obj[key] = replace(value);
			}
		};
		const dataKeys = ["description", "image"];
		const itemKeys = ["description"];
		return (data) => {
			if (data) {
				replaceKV(data, dataKeys);
				if (data.item) for (const item of data.item) replaceKV(item, itemKeys);
			}
			return data;
		};
	})()
};
//#endregion
export { weiboUtils as t };
