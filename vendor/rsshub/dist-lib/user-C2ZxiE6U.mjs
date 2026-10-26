import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/artstation/templates/description.tsx
const ArtstationDescription = ({ description, image, assets }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	description ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(description), /* @__PURE__ */ jsx("br", {})] }) : null,
	image ? /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.title
	}) : null,
	assets?.map((asset) => {
		if ((asset.asset_type === "video" || asset.asset_type === "video_clip") && asset.player_embedded) return /* @__PURE__ */ jsxs(Fragment, { children: [raw(asset.player_embedded), /* @__PURE__ */ jsx("br", {})] });
		if (asset.asset_type === "image" || asset.asset_type === "cover") return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: asset.image_url }), /* @__PURE__ */ jsx("br", {})] });
		return null;
	})
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(ArtstationDescription, { ...data }));
//#endregion
//#region lib/routes/artstation/user.ts
const route = {
	path: "/:handle",
	categories: ["picture"],
	example: "/artstation/wlop",
	parameters: { handle: "Artist handle, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.artstation.com/:handle"] }],
	name: "Artist Profolio",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const handle = ctx.req.param("handle");
	const headers = {
		accept: "application/json, text/plain, */*",
		"accept-language": "en-US,en;q=0.9",
		"content-type": "application/json",
		"user-agent": config.trueUA
	};
	const csrfToken = await cache_default.tryGet("artstation:csrfToken", async () => {
		return (await rofetch.raw("https://www.artstation.com/api/v2/csrf_protection/token.json", {
			method: "POST",
			headers
		})).headers.getSetCookie()[0].split(";", 1)[0].split("=", 2)[1];
	});
	const { data: userData } = await got_default(`https://www.artstation.com/users/${handle}/quick.json`, { headers: {
		...headers,
		cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`
	} });
	const { data: projects } = await got_default(`https://www.artstation.com/users/${handle}/projects.json`, {
		headers: {
			...headers,
			cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`
		},
		searchParams: {
			user_id: userData.id,
			page: 1
		}
	});
	const resolveImageUrl = (url) => url.replace(/\/\d{14}\/small_square\//, "/large/");
	const list = projects.data.map((item) => ({
		title: item.title,
		description: renderDescription({
			description: item.description,
			image: {
				src: resolveImageUrl(item.cover.small_square_url),
				title: item.title
			}
		}),
		pubDate: parseDate(item.published_at),
		updated: parseDate(item.updated_at),
		link: item.permalink,
		author: userData.full_name,
		assetsCount: item.assets_count,
		hashId: item.hash_id,
		icons: item.icons
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.assetsCount > 1 || !item.icons.image) {
			const { data } = await got_default(`https://www.artstation.com/projects/${item.hashId}.json`, { headers: {
				...headers,
				cookie: `PRIVATE-CSRF-TOKEN=${csrfToken}`
			} });
			item.description = renderDescription({
				description: data.description,
				assets: data.assets
			});
			for (const a of data.assets) if (a.asset_type !== "video" && a.asset_type !== "image" && a.asset_type !== "video_clip" && a.asset_type !== "cover") throw new Error(`Unhandle asset type: ${a.asset_type}`);
		}
		return item;
	})));
	return {
		title: `${userData.full_name} - ArtStation`,
		description: userData.headline,
		link: userData.permalink,
		logo: userData.large_avatar_url,
		icon: userData.large_avatar_url,
		image: userData.default_cover_url,
		item: items
	};
}
//#endregion
export { route };
