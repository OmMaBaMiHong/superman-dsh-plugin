import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { i as maskHeader, n as getToken, r as pixivGot, t as utils_default } from "./utils-DCw-yt542.mjs";
import { n as getNSFWNovelContent, r as convertPixivProtocolExtended, t as getSFWNovelContent } from "./sfw-C8kdZTQ9.mjs";
import queryString from "query-string";
//#region lib/routes/pixiv/novel-api/user-novels/nsfw.ts
function getNovels(user_id, token) {
	return pixivGot("https://app-api.pixiv.net/v1/user/novels", {
		headers: {
			...maskHeader,
			Authorization: "Bearer " + token
		},
		searchParams: queryString.stringify({
			user_id,
			filter: "for_ios"
		})
	});
}
async function getNSFWUserNovels(id, fullContent = false, limit = 100) {
	if (!config.pixiv || !config.pixiv.refreshToken) throw new ConfigNotFoundError("This user is an R18 creator, PIXIV_REFRESHTOKEN is required.\npixiv RSS is disabled due to the lack of relevant config.\n該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。");
	const token = await getToken();
	if (!token) throw new ConfigNotFoundError("pixiv not login");
	const response = await getNovels(id, token);
	const novels = limit ? response.data.novels.slice(0, limit) : response.data.novels;
	if (novels.length === 0) throw new InvalidParameterError(`${id} is not a valid user ID, or the user has no novels.\n${id} 不是有效的用戶 ID，或者該用戶沒有小說作品。`);
	const username = novels[0].user.name;
	const items = await Promise.all(novels.map(async (novel) => {
		const baseItem = {
			title: novel.series?.title ? `${novel.series.title} - ${novel.title}` : novel.title,
			description: `
                    <img src="${utils_default.getProxiedImageUrl(novel.image_urls.large)}" />
                    <div>
                    <p>${convertPixivProtocolExtended(novel.caption)}</p>
                    </div>`,
			author: novel.user.name,
			pubDate: parseDate(novel.create_date),
			link: `https://www.pixiv.net/novel/show.php?id=${novel.id}`,
			category: novel.tags.map((t) => t.name)
		};
		if (!fullContent) return baseItem;
		const { content } = await getNSFWNovelContent(novel.id, token);
		return {
			...baseItem,
			description: `${baseItem.description}<hr>${content}`
		};
	}));
	return {
		title: `${username}'s novels - pixiv`,
		description: `${username} 的 pixiv 最新小说`,
		image: utils_default.getProxiedImageUrl(novels[0].user.profile_image_urls.medium),
		link: `https://www.pixiv.net/users/${id}/novels`,
		item: items
	};
}
//#endregion
//#region lib/routes/pixiv/novel-api/user-novels/sfw.ts
const baseUrl = "https://www.pixiv.net";
async function getSFWUserNovels(id, fullContent = false, limit = 100) {
	const url = `${baseUrl}/users/${id}/novels`;
	const { data: allData } = await got_default(`${baseUrl}/ajax/user/${id}/profile/all`, { headers: { referer: url } });
	const novels = Object.keys(allData.body.novels).toSorted((a, b) => Number(b) - Number(a)).slice(0, Number(String(limit)));
	if (novels.length === 0) throw new Error("No novels found for this user, or is an R18 creator, fallback to ConfigNotFoundError");
	const searchParams = new URLSearchParams();
	for (const novel of novels) searchParams.append("ids[]", novel);
	const { data } = await got_default(`${baseUrl}/ajax/user/${id}/profile/novels`, {
		headers: { referer: url },
		searchParams
	});
	const items = await Promise.all(Object.values(data.body.works).map(async (item) => {
		const baseItem = {
			title: item.title,
			description: `
                    <img src=${utils_default.getProxiedImageUrl(item.url)} />
                    <div>
                    <p>${item.description}</p>
                    </div>
                `,
			link: `${baseUrl}/novel/show.php?id=${item.id}`,
			author: item.userName,
			pubDate: parseDate(item.createDate),
			updated: parseDate(item.updateDate),
			category: item.tags
		};
		if (!fullContent) return baseItem;
		const { content } = await getSFWNovelContent(item.id);
		return {
			...baseItem,
			description: `${baseItem.description}<hr>${content}`
		};
	}));
	return {
		title: data.body.extraData.meta.title,
		description: data.body.extraData.meta.ogp.description,
		image: utils_default.getProxiedImageUrl(Object.values(data.body.works)[0].profileImageUrl),
		link: url,
		item: items
	};
}
//#endregion
//#region lib/routes/pixiv/novels.ts
const route = {
	path: "/user/novels/:id/:full_content?",
	categories: ["social-media"],
	view: 0,
	example: "/pixiv/user/novels/27104704",
	parameters: {
		id: "User id, available in user's homepage URL",
		full_content: {
			description: "Enable or disable the display of full content. ",
			options: [{
				value: "true",
				label: "true"
			}, {
				value: "false",
				label: "false"
			}],
			default: "false"
		}
	},
	features: {
		requireConfig: [{
			name: "PIXIV_REFRESHTOKEN",
			optional: true,
			description: `
Pixiv 登錄後的 refresh_token，用於獲取 R18 小說
refresh_token after Pixiv login, required for accessing R18 novels
[https://docs.rsshub.app/deploy/config#pixiv](https://docs.rsshub.app/deploy/config#pixiv)`
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		title: "User Novels (簡介 Basic info)",
		source: [
			"www.pixiv.net/users/:id/novels",
			"www.pixiv.net/users/:id",
			"www.pixiv.net/en/users/:id/novels",
			"www.pixiv.net/en/users/:id"
		],
		target: "/user/novels/:id"
	}, {
		title: "User Novels (全文 Full text)",
		source: [
			"www.pixiv.net/users/:id/novels",
			"www.pixiv.net/users/:id",
			"www.pixiv.net/en/users/:id/novels",
			"www.pixiv.net/en/users/:id"
		],
		target: "/user/novels/:id/true"
	}],
	name: "User Novels",
	maintainers: ["TonyRL", "SnowAgar25"],
	handler,
	description: `| 小說類型 Novel Type | full\\_content | PIXIV\\_REFRESHTOKEN | 返回內容 Content |
| ------------------- | ------------- | ------------------- | ---------------- |
| Non R18             | false         | 不需要 Not Required | 簡介 Basic info  |
| Non R18             | true          | 不需要 Not Required | 全文 Full text   |
| R18                 | false         | 需要 Required       | 簡介 Basic info  |
| R18                 | true          | 需要 Required       | 全文 Full text   |

Default value for \`full_content\` is \`false\` if not specified.

Example:

- \`/pixiv/user/novels/79603797\` → 簡介 Basic info
- \`/pixiv/user/novels/79603797/true\` → 全文 Full text`
};
const hasPixivAuth = () => Boolean(config.pixiv && config.pixiv.refreshToken);
async function handler(ctx) {
	const id = ctx.req.param("id");
	const fullContent = fallback(void 0, queryToBoolean(ctx.req.param("full_content")), false);
	const { limit } = ctx.req.query();
	if (hasPixivAuth()) return await getNSFWUserNovels(id, fullContent, limit);
	let nonR18Result;
	try {
		nonR18Result = await getSFWUserNovels(id, fullContent, limit);
	} catch (error) {
		if (error.name !== "Error") throw error;
		nonR18Result = null;
	}
	if (nonR18Result) return nonR18Result;
	throw new ConfigNotFoundError("This user may not have any novel works, or is an R18 creator, PIXIV_REFRESHTOKEN is required.\npixiv RSS is disabled due to the lack of relevant config.\n該用戶可能沒有小說作品，或者該用戶爲 R18 創作者，需要 PIXIV_REFRESHTOKEN。");
}
//#endregion
export { route };
