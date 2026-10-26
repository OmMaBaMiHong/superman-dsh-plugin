import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/thepaper/utils.tsx
const defaultRssItem = (item) => ({
	title: item.name,
	link: item.link,
	description: item.name,
	pubDate: parseDate(item.pubTimeLong),
	media: { content: { url: item.pic } }
});
var utils_default = {
	ProcessItem: (item, ctx) => {
		const useOldMode = ctx.req.query("old") === "yes";
		if (item.link) return defaultRssItem(item);
		const itemUrl = `https://m.thepaper.cn/${item.cornerLabelDesc && item.cornerLabelDesc === "短剧" ? "series" : "detail"}/${item.contId}`;
		return cache_default.tryGet(`${itemUrl}${useOldMode ? ":old" : ""}`, async () => {
			const nextData = load(await rofetch(itemUrl))("#__NEXT_DATA__").text();
			const detailData = JSON.parse(nextData).props.pageProps.detailData;
			const contentDetail = detailData.contentDetail || detailData.liveDetail || detailData.specialDetail?.specialInfo;
			if (!contentDetail) return defaultRssItem(item);
			let description = contentDetail.content || contentDetail.summary || contentDetail.desc || "";
			if (contentDetail.videos) description += contentDetail.summary;
			if (useOldMode) {
				if (contentDetail.videos) description = renderToString(/* @__PURE__ */ jsx(ThepaperVideoDetail, { videos: contentDetail.videos })) + description;
				if (contentDetail.images) description = renderToString(/* @__PURE__ */ jsx(ThepaperImageDetail, { images: contentDetail.images })) + description;
			}
			let pubDate = parseDate(item.pubTimeLong || contentDetail.publishTime);
			if (Number.isNaN(pubDate)) pubDate = parseRelativeDate(contentDetail.pubTime);
			const rss_item = {
				title: contentDetail.name || contentDetail.shareName,
				link: itemUrl,
				description,
				category: [...contentDetail.tagList?.map((t) => t.tag) ?? [], contentDetail?.nodeInfo?.name ?? []],
				pubDate,
				author: contentDetail.author || "",
				media: {
					content: { url: item.pic || contentDetail.videos?.coverUrl || contentDetail.bigPic },
					thumbnails: { url: item.sharePic || contentDetail.sharePic }
				}
			};
			if (contentDetail.voiceInfo?.isHaveVoice) {
				rss_item.enclosure_type = "audio/mpeg";
				rss_item.enclosure_url = contentDetail.voiceInfo.voiceSrc;
				rss_item.itunes_item_image = item.pic || contentDetail.videos?.coverUrl;
			}
			return rss_item;
		});
	},
	ChannelIdToName: (nodeId, next_data) => next_data.props.appProps.menu.channelList.find((c) => c.nodeId.toString() === nodeId.toString()).name,
	ListIdToName: (listId, next_data) => next_data.props.appProps.menu.channelList.flatMap((c) => c.childNodeList || []).find((l) => l.nodeId.toString() === listId.toString())?.name,
	ExtractLogo: (response) => "https://m.thepaper.cn" + load(response)("img.imageCover").attr("src")
};
const ThepaperVideoDetail = ({ videos }) => /* @__PURE__ */ jsx("video", {
	src: videos.url,
	controls: true,
	playsinline: "true",
	"webkit-playsinline": "true",
	"x5-playsinline": "true",
	"x5-video-player-type": "h5",
	"x5-video-orientation": "landscape|portrait",
	"x5-video-player-fullscreen": "true",
	"x-webkit-airplay": "allow",
	preload: "metadata",
	poster: videos.coverUrl
});
const ThepaperImageDetail = ({ images }) => /* @__PURE__ */ jsx(Fragment, { children: images.map((image) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("figure", {
	class: "wp-block-image size-full",
	children: /* @__PURE__ */ jsx("img", {
		width: image.width,
		src: image.src
	})
}), /* @__PURE__ */ jsx("p", { children: image.description })] })) });
//#endregion
export { utils_default as t };
