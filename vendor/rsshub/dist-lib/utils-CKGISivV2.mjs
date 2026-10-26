//#region lib/routes/iwara/utils.ts
const rootUrl = "https://www.iwara.tv";
const apiRootUrl = "https://api.iwara.tv";
const apiqRootUrl = "https://apiq.iwara.tv";
const imageRootUrl = "https://i.iwara.tv";
const typeMap = {
	video: "Videos",
	image: "Images"
};
const parseThumbnail = (type, item) => {
	if (type === "image") {
		const thumbnail = item.thumbnail || item.file;
		return thumbnail ? `<img src="${imageRootUrl}/image/original/${thumbnail.id}/${thumbnail.name}">` : "";
	}
	if (item.embedUrl === null) return item.file ? `<img src="${imageRootUrl}/image/original/${item.file.id}/thumbnail-${String(item.thumbnail).padStart(2, "0")}.jpg">` : "";
	const match = /https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]*)(?:&(?:amp;)?[\w=?]*)?/.exec(item.embedUrl);
	if (match) return `<img src="${imageRootUrl}/image/embed/original/youtube/${match[1]}">`;
	return "";
};
//#endregion
export { rootUrl as a, parseThumbnail as i, apiqRootUrl as n, typeMap as o, imageRootUrl as r, apiRootUrl as t };
