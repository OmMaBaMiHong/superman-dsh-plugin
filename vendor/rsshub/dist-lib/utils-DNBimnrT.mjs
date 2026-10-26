import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Category, MixiClient } from "mixi2";
//#region lib/routes/mixi2/utils.ts
function getClient() {
	const { authToken, authKey } = config.mixi2;
	if (!authToken || !authKey) throw new ConfigNotFoundError("MIXI2_AUTH_TOKEN and MIXI2_AUTH_KEY are required");
	return new MixiClient(`auth_token=${authToken}`, authKey, { httpAdapter: rofetch });
}
function parsePost(post) {
	let description = post.text ? `<p>${post.text}</p>` : "";
	const medias = post.medias ?? [];
	for (const media of medias) if (media.category === Category.CATEGORY_POST_IMAGE) description += `<img src="${media.postImage?.largeImageUrl ?? media.postImage?.smallImageUrl}"${media.description ? `alt="${media.description}"` : ""} />`;
	else if (media.category === Category.CATEGORY_POST_VIDEO) description += `<img src="${media.postVideo?.previewImageUrl}" alt="${media.description}" />`;
	return description;
}
function generatePostDataItem(post, personas) {
	const author = personas.find((persona) => persona.personaId === post.personaId);
	return {
		description: parsePost(post),
		pubDate: parseDate(post.createdAt.seconds * 1e3),
		guid: post.postId,
		author: author?.name,
		link: `https://mixi.social/@${author?.name}/posts/${post.postId}`
	};
}
const CONFIG_OPTIONS = [{
	name: "MIXI2_AUTH_TOKEN",
	description: "mixi2ログイン後の情報。ブラウザのコンソールでクッキーから `auth_token` の値を取得してください"
}, {
	name: "MIXI2_AUTH_KEY",
	description: "mixi2ログイン後の情報。ブラウザのコンソールでリクエストヘッダーから `x-auth-key` の値を取得してください"
}];
function postFilter(post) {
	return !post.isDeleted && post.personaId;
}
//#endregion
export { postFilter as a, parsePost as i, generatePostDataItem as n, getClient as r, CONFIG_OPTIONS as t };
