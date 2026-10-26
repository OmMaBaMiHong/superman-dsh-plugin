import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/jike/user.ts
const route = {
	path: "/user/:id",
	categories: ["social-media"],
	view: 1,
	example: "/jike/user/3EE02BC9-C5B3-4209-8750-4ED1EE0F67BB",
	parameters: { id: "用户 id, 可在即刻分享出来的单条动态页点击用户头像进入个人主页，然后在个人主页的 URL 中找到，或者在单条动态页使用 RSSHub Radar 插件" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["web.okjike.com/u/:uid"],
		target: "/user/:uid"
	}, {
		source: ["m.okjike.com/users/:uid"],
		target: "/user/:uid"
	}],
	name: "用户动态",
	maintainers: ["DIYgod", "prnake"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const html = (await got_default({
		method: "get",
		url: `https://m.okjike.com/users/${id}`,
		headers: { Referer: `https://m.okjike.com/users/${id}` }
	})).data;
	const raw = load(html)("[type = \"application/json\"]").html();
	const data = JSON.parse(raw).props.pageProps;
	const getLink = (id, type) => {
		switch (type) {
			case "REPOST": return `https://m.okjike.com/reposts/${id}`;
			case "MEDIUM": return `https://www.okjike.com/medium/${id}`;
			default: return `https://m.okjike.com/originalPosts/${id}`;
		}
	};
	const items = await Promise.all(data.posts.map(async (item) => {
		const typeMap = {
			ORIGINAL_POST: "发布",
			REPOST: "转发",
			ANSWER: "回答",
			QUESTION: "提问",
			PERSONAL_UPDATE: "创建新主题"
		};
		let linkTemplate = "";
		if (item.linkInfo && item.linkInfo.linkUrl) linkTemplate = `<a href="${item.linkInfo.linkUrl}">${item.linkInfo.title}</a><br>`;
		let imgTemplate = "";
		if (item.pictures) for (const picture of item.pictures) imgTemplate += `<br><img src="${picture.picUrl}">`;
		let content = item.content || item.linkInfo && item.linkInfo.title || item.question && item.question.title || item.title || "";
		content = content.replaceAll(/\r\n|\n|\r/g, "<br>");
		let shortenTitle = "一条动态";
		if (content) {
			shortenTitle = content.replaceAll(/(<br>)+/g, " ");
			content += "<br><br>";
		}
		let repostContent;
		if (item.type === "REPOST") {
			const screenNameTemplate = item.target.user ? `<a href="https://m.okjike.com/users/${item.target.user.username}" target="_blank">@${item.target.user.screenName}</a>` : "";
			let repostImgTemplate = "";
			if (item.target.pictures) for (const picture of item.target.pictures) repostImgTemplate += `<br><img src="${picture.thumbnailUrl}">`;
			repostContent = `<div class="rsshub-quote">转发 ${screenNameTemplate}: ${item.target.content}${repostImgTemplate}</div>`.replaceAll(/\r\n|\n|\r/g, "<br>");
			content += repostContent;
		}
		const single = {
			title: `${typeMap[item.type]}了: ${shortenTitle}`,
			description: `${content}${linkTemplate}${imgTemplate}`.replace(/(?:<br>|\s)+$/, ""),
			pubDate: parseDate(item.createdAt),
			link: getLink(item.id, item.type),
			_extra: repostContent && { links: [{
				url: getLink(item.target.id, item.target.type),
				type: "quote"
			}] }
		};
		if (id === "wenhao1996" && item.topic.id === "553870e8e4b0cafb0a1bef68") {
			single.link = item.urlsInText[0].url;
			const { data } = await got_default({
				method: "get",
				url: single.link,
				headers: { Referer: `https://m.okjike.com/users/${id}` }
			});
			const $$ = load(data);
			$$("span.num,span.arrow").remove();
			single.title = `一觉醒来世界发生了什么 ${$$("title").text()}`;
			single.description = $$("div.container").find("li.item").toArray().map((j) => `<a href="${$$(j).find("a").attr("href")}">${$$(j).find("a").text()}</a><br>`).join("");
		}
		return single;
	}));
	return {
		title: `${data.user.screenName}的即刻动态`,
		description: data.user.bio,
		link: `https://m.okjike.com/users/${id}`,
		image: data.user.avatarImage.picUrl,
		item: items
	};
}
//#endregion
export { route };
