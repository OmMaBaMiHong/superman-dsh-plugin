import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
import bbobHTML from "@bbob/html";
import presetHTML5 from "@bbob/preset-html5";
//#region lib/routes/nga/post.ts
const attrValue = (node) => Object.keys(node.attrs ?? {})[0] ?? "";
const childrenOf = (node) => node.content;
const customPreset = presetHTML5.extend((tags) => ({
	...tags,
	dice: (node) => ({
		tag: "b",
		content: ["ROLL : ", ...childrenOf(node)]
	}),
	font: (node) => ({
		tag: "span",
		attrs: { style: `font-family:${attrValue(node)};` },
		content: node.content
	}),
	size: (node) => ({
		tag: "span",
		attrs: { style: `font-size:${attrValue(node)};` },
		content: node.content
	}),
	align: (node) => ({
		tag: "span",
		attrs: { style: `text-align:${attrValue(node)};` },
		content: node.content
	}),
	img: (node, { render }) => {
		const src = render(node.content ?? []);
		return {
			tag: "img",
			attrs: { src: src.startsWith(".") ? "https://img.nga.178.com/attachments" + src.slice(1) : src },
			content: null
		};
	},
	collapse: (node) => ({
		tag: "details",
		content: [{
			tag: "summary",
			content: [attrValue(node)]
		}, ...childrenOf(node)]
	}),
	uid: (node) => ({
		tag: "a",
		attrs: { href: `https://nga.178.com/nuke.php?func=ucp&uid=${attrValue(node)}` },
		content: ["@", ...childrenOf(node)]
	}),
	tid: (node) => ({
		tag: "a",
		attrs: { href: `https://nga.178.com/read.php?tid=${attrValue(node)}` },
		content: node.content
	}),
	pid: (node) => {
		const [pid, tid, page] = attrValue(node).split(",");
		return {
			tag: "a",
			attrs: { href: `https://nga.178.com/read.php?tid=${tid}&page=${page}#pid${pid}Anchor` },
			content: node.content
		};
	},
	h: (node) => ({
		tag: "h4",
		attrs: { style: "font-size:1.17em;font-weight:bold;border-bottom:1px solid #aaa;clear:both;margin:1.33em 0 0.2em 0;" },
		content: node.content
	})
}));
const linkMention = (tree) => tree.walk((node) => {
	if (typeof node === "object" && node !== null && typeof node.tag === "string" && node.tag.startsWith("@")) {
		const username = node.tag.slice(1);
		return {
			tag: "a",
			attrs: { href: `https://nga.178.com/nuke.php?func=ucp&username=${username}` },
			content: [`@${username}`]
		};
	}
	return node;
});
const formatContent = (str) => bbobHTML(str, [customPreset(), linkMention]);
const route = {
	path: "/post/:tid/:authorId?",
	categories: ["bbs"],
	example: "/nga/post/18449558",
	parameters: {
		tid: "帖子 id, 可在帖子 URL 找到",
		authorId: "作者 id"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "帖子",
	maintainers: ["xyqfer", "syrinka"],
	handler
};
async function handler(ctx) {
	const getPageUrl = (tid, authorId, page = 1, hash = "") => `https://nga.178.com/read.php?tid=${tid}&page=${page}${authorId ? `&authorid=${authorId}` : ""}&rand=${Math.random() * 1e3}#${hash}`;
	const getPage = async (tid, authorId, pageId = 1) => {
		const link = getPageUrl(tid, authorId, pageId);
		let cookieString = `guestJs=${Math.floor(Date.now() / 1e3)};`;
		if (config.nga.uid && config.nga.cid) cookieString = `ngaPassportUid=${config.nga.uid}; ngaPassportCid=${config.nga.cid};`;
		const response = await got_default(link, {
			responseType: "buffer",
			headers: { Cookie: cookieString }
		});
		return load(iconv.decode(response.data, "gbk"));
	};
	const getLastPageId = async (tid, authorId) => {
		const match = (await getPage(tid, authorId))("#pagebtop").html().match(/\{0:'\/read\.php\?tid=(\d)[^']*',1:(\d+),[^}]*\}/);
		return match ? match[2] : 1;
	};
	const tid = ctx.req.param("tid");
	const authorId = ctx.req.param("authorId") || void 0;
	const pageId = await getLastPageId(tid, authorId);
	const $ = await getPage(tid, authorId, pageId);
	const title = $("title").text() || "";
	const posterMap = JSON.parse($("script").text().match(/commonui\.userInfo\.setAll\((.*)\)$/m)[1]);
	const authorName = authorId ? posterMap[authorId].username : void 0;
	const items = $("#m_posts_c").children().filter("table").toArray().map((post_) => {
		const post = $(post_);
		const posterId = post.find(".posterinfo a").first().attr("href").match(/&uid=(-?\d+)$/)[1];
		const poster = authorName || posterMap[posterId].username;
		const content = post.find(".postcontent").first();
		const description = formatContent(content.html());
		const postId = content.attr("id");
		const link = getPageUrl(tid, authorId, pageId, postId);
		const pubDate = timezone(parseDate(post.find(".postInfo > span").first().text(), "YYYY-MM-DD HH:mm"), 8);
		return {
			title: load(description).text(),
			author: poster,
			link,
			description,
			pubDate,
			guid: postId
		};
	});
	return {
		title: authorName ? `NGA ${authorName} ${title}` : `NGA ${title}`,
		link: getPageUrl(tid, authorId, pageId),
		item: items
	};
}
//#endregion
export { route };
