import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/telegram/stickerpack.ts
const route = {
	path: "/stickerpack/:name",
	categories: ["social-media"],
	view: 2,
	example: "/telegram/stickerpack/DIYgod",
	parameters: { name: "Sticker Pack name, available in the sharing URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Sticker Pack",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	if (!config.telegram || !config.telegram.token) throw new ConfigNotFoundError("Telegram Sticker Pack RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const name = ctx.req.param("name");
	const token = config.telegram.token;
	const response = await rofetch(`https://api.telegram.org/bot${token}/getStickerSet?name=${name}`);
	const list = response.result.stickers.map((item) => ({
		title: item.emoji,
		description: item.file_id,
		guid: item.file_id
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(`telegram:stickerpack:${item.guid}`, async () => {
		const response = await rofetch(`https://api.telegram.org/bot${token}/getFile?file_id=${item.guid}`);
		item.description = `<img src="https://api.telegram.org/file/bot${token}/${response.result.file_path}" />`;
		return item;
	})));
	return {
		title: `${response.result.title} - Telegram Sticker Pack`,
		link: `https://t.me/addstickers/${name}`,
		item: items
	};
}
//#endregion
export { route };
