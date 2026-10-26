import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
//#region lib/routes/qq/pd/utils.ts
const patternTypeMap = {
	1: "text",
	2: "emoji",
	5: "link",
	6: "image",
	9: "newline"
};
const textAlignmentMap = {
	0: "left",
	1: "center",
	2: "right"
};
function parseText(text, props) {
	if (props === void 0) return text;
	let style = "";
	if (props.fontWeight === 700) style += "font-weight: bold;";
	if (props.italic) style += "font-style: italic;";
	if (props.underline) style += "text-decoration: underline;";
	if (style === "") return text;
	return `<span style="${style}">${text}</span>`;
}
function parseDataItem(item, texts, images) {
	let imageId;
	switch (patternTypeMap[item.type] || void 0) {
		case "text": return parseText(texts.shift() ?? "", item.props);
		case "newline":
			texts.shift();
			return "<br />";
		case "link": return `<a href="${item.href ?? "#"}" target="_blank">${item.desc ?? ""}</a>`;
		case "image":
			imageId = item.fileId || item.taskId || "";
			return `<img src="${images[imageId].picUrl}" style="max-width: 100%; width: ${images[imageId].width}px;"><br />`;
		default: return "";
	}
}
function parseArticle(feed, texts, images) {
	let result = "";
	if ([
		void 0,
		null,
		""
	].includes(feed.patternInfo)) feed.patternInfo = "[]";
	const patterns = JSON.parse(feed.patternInfo);
	for (const pattern of patterns) {
		if (pattern.props === void 0) continue;
		const textAlign = pattern.props.textAlignment || 0;
		result += "<p style=\"text-align: " + textAlignmentMap[textAlign] + ";\">";
		for (const item of pattern.data) result += parseDataItem(item, texts, images);
		result += "</p>";
	}
	return result;
}
function parsePost(feed, texts, images) {
	for (const content of feed.contents.contents) if (content.text_content) texts.push(content.text_content.text);
	let result = "";
	for (const text of texts) result += text;
	for (const image of Object.values(images)) {
		result += "<p style=\"text-align: center\">";
		result += `<img src="${image.picUrl}" style="max-width: 100%; width: ${image.width}px;">`;
		result += "</p>";
	}
	return result;
}
function parseFeed(feed) {
	const texts = [];
	const images = {};
	for (const content of feed.contents.contents) if (content.text_content) texts.push(content.text_content.text);
	for (const image of feed.images) images[image.picId] = {
		picId: image.picId,
		picUrl: image.picUrl,
		width: image.width,
		height: image.height
	};
	if (feed.feed_type === 1) return parsePost(feed, texts, images);
	if (feed.feed_type === 2) return parseArticle(feed, texts, images);
	return "";
}
//#endregion
//#region lib/routes/qq/pd/guild.ts
const baseUrl = "https://pd.qq.com/g/";
const getGuildFeedsUrl = "https://pd.qq.com/qunng/guild/gotrpc/noauth/trpc.qchannel.commreader.ComReader/GetGuildFeeds";
const getChannelTimelineFeedsUrl = "https://pd.qq.com/qunng/guild/gotrpc/noauth/trpc.qchannel.commreader.ComReader/GetChannelTimelineFeeds";
const getFeedDetailUrl = "https://pd.qq.com/qunng/guild/gotrpc/noauth/trpc.qchannel.commreader.ComReader/GetFeedDetail";
const sortMap = {
	hot: 0,
	created: 1,
	replied: 2
};
const route = {
	path: "/pd/guild/:id/:sub?/:sort?",
	categories: ["bbs"],
	example: "/qq/pd/guild/qrp4pkq01d/650967831/created",
	parameters: {
		id: "频道号",
		sub: "子频道 ID，网页端 URL `subc` 参数的值，默认为 `hot`（全部）",
		sort: "排序方式，`hot`（热门），`created`（最新发布），`replied`（最新回复），默认为 `created`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["pd.qq.com/"] }],
	name: "腾讯频道",
	maintainers: ["mobyw"],
	handler,
	url: "pd.qq.com/"
};
async function handler(ctx) {
	const { id, sub = "hot", sort = "created" } = ctx.req.param();
	if (!Object.hasOwn(sortMap, sort)) throw new InvalidParameterError("invalid sort parameter, should be `hot`, `created`, or `replied`");
	const sortType = sortMap[sort];
	let url;
	let body = {};
	let headers = {};
	if (sub === "hot") {
		url = getGuildFeedsUrl;
		body = {
			count: 20,
			from: 7,
			guild_number: id,
			get_type: 1,
			feedAttchInfo: "",
			sortOption: sortType,
			need_channel_list: false,
			need_top_info: false
		};
		headers = {
			cookie: "p_uin=o09000002",
			"x-oidb": "{\"uint32_service_type\":12}",
			"x-qq-client-appid": "537246381"
		};
	} else {
		url = getChannelTimelineFeedsUrl;
		body = {
			count: 20,
			from: 7,
			guild_number: id,
			channelSign: { channel_id: sub },
			feedAttchInfo: "",
			sortOption: sortType,
			need_top_info: false
		};
		headers = {
			cookie: "p_uin=o09000002",
			"x-oidb": "{\"uint32_service_type\":11}",
			"x-qq-client-appid": "537246381"
		};
	}
	const feeds = (await rofetch(url, {
		method: "POST",
		body,
		headers
	})).data?.vecFeed || [];
	const items = feeds.map(async (feed) => {
		let subId = sub;
		if (sub === "hot") subId = feed.channelInfo?.sign?.channel_id || "";
		const feedLink = baseUrl + id + "/post/" + feed.id;
		return await cache_default.tryGet(feedLink, async () => {
			body = {
				feedId: feed.id,
				userId: feed.poster?.id,
				createTime: feed.createTime,
				from: 2,
				detail_type: 1,
				channelSign: {
					guild_number: id,
					channel_id: subId
				},
				extInfo: { mapInfo: [{
					key: "qc-tabid",
					value: "ark"
				}, {
					key: "qc-pageid",
					value: "pc"
				}] }
			};
			headers = {
				cookie: "p_uin=o09000002",
				referer: feedLink,
				"x-oidb": "{\"uint32_service_type\":5}",
				"x-qq-client-appid": "537246381"
			};
			const feedContent = (await rofetch(getFeedDetailUrl, {
				method: "POST",
				body,
				headers
			})).data?.feed || {};
			return {
				title: feed.title?.contents[0]?.text_content?.text || feed.channelInfo?.guild_name || "",
				link: feedLink,
				description: parseFeed(feedContent),
				pubDate: /* @__PURE__ */ new Date(Number(feed.createTime) * 1e3),
				author: feed.poster?.nick
			};
		});
	});
	const feedItems = await Promise.all(items);
	let guildName = "";
	if (feeds.length > 0 && feeds[0].channelInfo?.guild_name) {
		guildName = feeds[0].channelInfo?.guild_name;
		if (sub !== "hot" && feeds[0].channelInfo?.name) guildName += " (" + feeds[0].channelInfo?.name + ")";
		guildName += " - 腾讯频道";
	}
	return {
		title: guildName,
		link: baseUrl + id,
		description: guildName,
		item: feedItems
	};
}
//#endregion
export { route };
