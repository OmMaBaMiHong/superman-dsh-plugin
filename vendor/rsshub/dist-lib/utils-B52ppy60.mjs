import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/skebetter/utils.ts
const processItems = (data, type) => data.map((item) => {
	const baseAuthorUrl = `https://skebetter.com/author/${item.user_id}`;
	const description = `
            <p>❤${item.fav}    🔁${item.retweet}</p>
            ${item.media_urls.map((media) => `<img src="${media.media_uri}" />`).join("")}
        `;
	if (type === "manga") return {
		title: item.text,
		description,
		author: item.user_name,
		link: `https://skebetter.com/series/${item.series_id}`
	};
	if (type === "illust") return {
		title: item.text,
		description,
		author: item.user_name,
		link: `${baseAuthorUrl}/illust/${item.id}`
	};
	return {
		title: item.text,
		description,
		author: item.user_name,
		link: item.series_id ? `https://skebetter.com/series/${item.series_id}` : `${baseAuthorUrl}/manga/${item.id}`
	};
});
const fetchData = async (url, isManga = false) => {
	const response = await rofetch(url);
	return isManga ? response : response.tweet;
};
//#endregion
export { processItems as n, fetchData as t };
