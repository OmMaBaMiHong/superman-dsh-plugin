import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/jike/utils.ts
const videoAPI = "https://api.ruguoapp.com/1.0/mediaMeta/play?type=ORIGINAL_POST";
const topicDataHanding = (data, ctx) => data.posts.map((item) => {
	let audioName, videoName, linkName;
	let content, link;
	switch (item.type) {
		case "ORIGINAL_POST":
			content = item.content;
			link = `https://m.okjike.com/originalPosts/${item.id}`;
			break;
		default:
			content = "未知类型，请前往GitHub提交issue";
			link = "https://github.com/DIYgod/RSSHub/issues";
	}
	let description = "";
	let author = "";
	if (item.user) {
		author = item.user.screenName;
		if (ctx.req.param("showUid")) description += `<span>用户昵称：${author} <br> Username：${item.user.username}</span><br>`;
	}
	if (item.linkInfo) {
		const linkUrl = item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl;
		if (new URL(linkUrl).host === "mp.weixin.qq.com") link = linkUrl;
		const audioObject = item.linkInfo.audio || item.audio;
		if (audioObject) {
			const audioImage = audioObject.image.picUrl || audioObject.image.thumbnailUrl;
			const audioLink = linkUrl;
			audioName = `${audioObject.title} - ${audioObject.author}`;
			description += `
            <img src="${audioImage}">
            <a href="${audioLink}">${audioName}</a>
        `;
		}
		const videoObject = item.linkInfo.video || item.video;
		if (videoObject) {
			const videoImage = videoObject.image.picUrl || videoObject.image.thumbnailUrl;
			const videoLink = linkUrl;
			const videoDuration = Math.floor(videoObject.duration / 6e4);
			videoName = item.linkInfo.title;
			description += `
            <img src="${videoImage}">
            <a href="${videoLink}">${videoName || "观看视频"} - 约${videoDuration}分钟</a>
        `;
		}
		if (!audioObject && !videoObject && linkUrl) {
			linkName = item.linkInfo.title;
			const linkTitle = linkName || "访问原文";
			const linkImage = item.linkInfo.pictureUrl;
			const imageTag = `<img src="${linkImage}">`;
			description += `
            ${linkImage ? imageTag : ""}
            <a href="${linkUrl}">${linkTitle}</a>
        `;
		}
	}
	description += description ? `<br>${content}` : content;
	if (item.pictures) for (const pic of item.pictures) if (pic.format === "gif") description += `<img src="${pic.picUrl.split("?imageMogr2/", 1)[0]}">`;
	else {
		const imgUrl = /\.[\da-z]+\?imageMogr2/.test(pic.picUrl) ? pic.picUrl.split("?imageMogr2/", 1)[0] : pic.picUrl.replace(/thumbnail\/.+/, "");
		description += `<br><img src="${imgUrl}">`;
	}
	if (item.video) description += `<br><video src="${item.video.url}" controls></video>`;
	return {
		title: audioName || videoName || content || linkName || "无题",
		description: description.trim().replaceAll("\n", "<br>"),
		pubDate: parseDate(item.createdAt),
		author,
		link
	};
});
const constructTopicEntry = async (ctx, url) => {
	const data = await cache_default.tryGet(url, async () => {
		const html = (await got_default(url)).data;
		const raw = load(html)("[type = \"application/json\"]").html();
		const data = JSON.parse(raw).props.pageProps;
		data.posts = await Promise.all(data.posts.map(async (item) => {
			if (!item.video) return item;
			item.video = (await got_default(`${videoAPI}&id=${item.id}`)).data;
			return item;
		}));
		return data;
	}, false, config.cache.routeExpire);
	if (data.length === 0) return { title: "主题 ID 不存在，或该主题暂无内容" };
	const topic = data.topic;
	data.result = {
		title: `${topic.content} - 即刻圈子`,
		link: url,
		description: topic.briefIntro,
		image: topic.squarePicture.picUrl || topic.squarePicture.middlePicUrl || topic.squarePicture.thumbnailUrl
	};
	return data;
};
//#endregion
export { topicDataHanding as n, constructTopicEntry as t };
