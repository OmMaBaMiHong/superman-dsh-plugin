import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/jandan/utils.ts
/**
* Extract page ID from script tags in HTML
*/
const extractPageId = async (url, referer) => {
	const $ = load(await rofetch(url, { headers: {
		Referer: referer,
		Accept: "application/json, text/plain, */*"
	} }));
	let pageId = "";
	$("script").each((_, script) => {
		const match = ($(script).html() || "").match(/PAGE\s*=\s*\{\s*id\s*:\s*(\d+)\s*\}/);
		if (match) pageId = match[1];
	});
	return pageId;
};
/**
* Handle the top section (热榜)
*/
const handleTopSection = async (rootUrl, type) => {
	const response = await rofetch(`${rootUrl}/api/top/${type}`, { headers: {
		Referer: rootUrl,
		Accept: "application/json, text/plain, */*"
	} });
	let title = "热榜";
	switch (type) {
		case "pic3days":
			title += " - 3天内无聊图";
			break;
		case "pic7days":
			title += " - 7天内无聊图";
			break;
		default:
			title += " - 4小时热门";
			break;
	}
	if (response.code === 0 && response.data && Array.isArray(response.data)) {
		const items = response.data.map((item) => {
			const content = item.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, () => src.replace(/^https?:\/\/(\w+)\.moyu\.im/, "https://$1.sinaimg.cn")));
			return {
				author: item.author,
				title: `${item.author}: ${content.replaceAll(/<[^>]+>/g, "")}`,
				description: content,
				pubDate: parseDate(item.date),
				link: `${rootUrl}/t/${item.id}`
			};
		});
		return {
			title,
			items
		};
	}
	return {
		title,
		items: [{
			title: `获取失败: ${title}`,
			description: "未能获取热榜数据",
			link: `${rootUrl}/top`,
			pubDate: /* @__PURE__ */ new Date()
		}]
	};
};
/**
* Handle the forum/bbs section (鱼塘)
*/
const handleForumSection = async (rootUrl) => {
	const title = "煎蛋 - 鱼塘";
	const currentUrl = `${rootUrl}/bbs`;
	try {
		const forumId = await extractPageId(currentUrl, rootUrl);
		if (!forumId) return {
			title,
			items: [{
				title: `获取失败: ${title}`,
				description: "无法获取论坛ID",
				link: currentUrl,
				pubDate: /* @__PURE__ */ new Date()
			}]
		};
		const forumData = await rofetch(`${rootUrl}/api/forum/posts/${forumId}?page=1`, { headers: {
			Referer: currentUrl,
			Accept: "application/json, text/plain, */*"
		} });
		if (forumData.code === 0 && forumData.data && forumData.data.list && Array.isArray(forumData.data.list)) return {
			title,
			items: forumData.data.list.map((post) => {
				const content = post.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, () => src.replace(/^https?:\/\/(\w+)\.moyu\.im/, "https://$1.sinaimg.cn")));
				return {
					author: post.author_name,
					title: post.title || `${post.author_name}发表了新主题`,
					description: content,
					pubDate: parseDate(post.update_time || post.create_time),
					link: `${rootUrl}/bbs#/topic/${post.post_id}`,
					category: post.reply_count > 0 ? [`${post.reply_count}条回复`] : void 0
				};
			})
		};
		return {
			title,
			items: [{
				title: `获取失败: ${title}`,
				description: "未能获取鱼塘数据",
				link: currentUrl,
				pubDate: /* @__PURE__ */ new Date()
			}]
		};
	} catch (error) {
		return {
			title,
			items: [{
				title: "解析错误: 鱼塘",
				description: `解析鱼塘页面时出错: ${error instanceof Error ? error.message : String(error)}`,
				link: currentUrl,
				pubDate: /* @__PURE__ */ new Date()
			}]
		};
	}
};
/**
* Handle other sections (问答, 树洞, 随手拍, 无聊图)
*/
const handleCommentSection = async (rootUrl, category) => {
	const currentUrl = `${rootUrl}/${category}`;
	try {
		const pageId = await extractPageId(currentUrl, rootUrl);
		const $ = load(await rofetch(currentUrl, { headers: {
			Referer: rootUrl,
			Accept: "application/json, text/plain, */*"
		} }));
		const title = String($("title").text().trim()) || `煎蛋 - ${category}`;
		if (!pageId) return {
			title,
			items: [{
				title: `无法解析: ${title}`,
				description: "无法从页面中获取到帖子ID，可能网站结构已变更",
				link: currentUrl,
				pubDate: /* @__PURE__ */ new Date()
			}]
		};
		const commentsData = await rofetch(`${rootUrl}/api/comment/post/${pageId}?order=desc&page=1`, { headers: {
			Referer: currentUrl,
			Accept: "application/json, text/plain, */*"
		} });
		if (commentsData.code === 0 && commentsData.data && commentsData.data.list && Array.isArray(commentsData.data.list)) return {
			title,
			items: commentsData.data.list.map((comment) => {
				const content = comment.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, () => src.replace(/^https?:\/\/(\w+)\.moyu\.im/, "https://$1.sinaimg.cn")));
				return {
					author: comment.author,
					title: `${comment.author}: ${content.replaceAll(/<[^>]+>/g, "")}`,
					description: content,
					pubDate: parseDate(comment.date_gmt || comment.date),
					link: `${rootUrl}/t/${comment.id}`
				};
			})
		};
		return {
			title,
			items: [{
				title: `暂无内容: ${title || category}`,
				description: "没有获取到内容，可能需要更新解析规则",
				link: currentUrl,
				pubDate: /* @__PURE__ */ new Date()
			}]
		};
	} catch {
		return {
			title: `煎蛋 - ${category}`,
			items: [{
				title: `解析错误: ${category}`,
				description: "解析页面时出错",
				link: currentUrl,
				pubDate: /* @__PURE__ */ new Date()
			}]
		};
	}
};
//#endregion
//#region lib/routes/jandan/section.ts
const route = {
	path: "/:category/:type?",
	example: "/jandan/top",
	name: "Section",
	maintainers: ["nczitzk", "pseudoyu"],
	parameters: {
		category: {
			description: "板块",
			options: [
				{
					label: "热榜",
					value: "top"
				},
				{
					label: "问答",
					value: "qa"
				},
				{
					label: "树洞",
					value: "treehole"
				},
				{
					label: "随手拍",
					value: "ooxx"
				},
				{
					label: "无聊图",
					value: "pic"
				},
				{
					label: "鱼塘",
					value: "bbs"
				}
			]
		},
		type: {
			description: "热榜类型，仅当 category 选择 `top` 时有效",
			default: "4hr",
			options: [
				{
					label: "4小时热门",
					value: "4hr"
				},
				{
					label: "3天内无聊图",
					value: "pic3days"
				},
				{
					label: "7天内无聊图",
					value: "pic7days"
				}
			]
		}
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
		source: ["i.jandan.net/:category"],
		target: "/jandan/:category?"
	}],
	handler
};
async function handler(ctx) {
	let category = ctx.req.param("category") ?? "top";
	category = category.replace(/#.*$/, "");
	const type = ctx.req.param("type") ?? "4hr";
	const rootUrl = "http://i.jandan.net";
	const currentUrl = `${rootUrl}/${category}`;
	let result;
	try {
		if (category === "top") result = await handleTopSection(rootUrl, type);
		else if (category === "bbs") result = await handleForumSection(rootUrl);
		else result = await handleCommentSection(rootUrl, category);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		result = {
			title: `煎蛋 - ${category}`,
			items: [{
				title: `抓取出错: ${category}`,
				description: `抓取 ${category} 分区时出现错误: ${errorMessage}`,
				link: currentUrl,
				pubDate: /* @__PURE__ */ new Date()
			}]
		};
	}
	return {
		title: result.title,
		link: currentUrl,
		item: result.items
	};
}
//#endregion
export { route };
