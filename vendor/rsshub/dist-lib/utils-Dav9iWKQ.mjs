import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/ainvest/utils.ts
const contentStreamUrl = "https://news.ainvest.com/news-w-ds-hxcmp-content-stream/content_stream/api/stream_item/v1/query_content_stream";
const contentPageUrl = "https://news.ainvest.com/content-page/v1/page";
const normalizeItem = (item) => ({
	title: item.title,
	link: item.h5_url,
	pubDate: parseDate(item.ctime, "X"),
	category: item.content_tags.map((tag) => tag.name),
	author: item.author_name,
	image: item.cover_image,
	seoKey: item.seo_key
});
const fetchContentStream = (streamId, limit) => cache_default.tryGet(`ainvest:news:${streamId}:${limit}`, async () => {
	return (await rofetch(contentStreamUrl, { query: {
		lang: "en",
		pageSize: limit,
		stream_id: streamId,
		page: 1
	} })).data.list;
}, config.cache.routeExpire, false);
const fetchContentItems = async (streamIds, limit) => {
	const list = (await Promise.all(streamIds.map((streamId) => fetchContentStream(streamId, limit)))).flat().map((item) => normalizeItem(item));
	return Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await rofetch(`${contentPageUrl}/${item.seoKey}`);
		item.description = data.pageInfo.structuredContent.map((c) => c.content).join("");
		item.image = data.contentInfo.coverImage;
		return item;
	})));
};
//#endregion
export { fetchContentItems as t };
