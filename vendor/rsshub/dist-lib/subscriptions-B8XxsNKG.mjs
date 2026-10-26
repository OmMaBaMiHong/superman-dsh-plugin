import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getPlaywrightPage } from "./playwright-DGfbX7qN.mjs";
import { a as rootUrl, n as apiqRootUrl, r as imageRootUrl } from "./utils-CKGISivV2.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import markdownit from "markdown-it";
import { renderToString } from "hono/jsx/dom/server";
import pMap from "p-map";
//#region lib/routes/iwara/templates/subscriptions.tsx
const renderSubscriptionImages = (images) => {
	return renderToString(/* @__PURE__ */ jsx(Fragment, { children: images.filter(Boolean).map((image) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] })) }));
};
//#endregion
//#region lib/routes/iwara/subscriptions.ts
const md = markdownit({ html: true });
const apiHeaders = {
	"Content-Type": "application/json",
	"X-Site": "www.iwara.tv",
	Origin: rootUrl,
	Referer: `${rootUrl}/`,
	Accept: "application/json",
	"User-Agent": config.trueUA
};
const route = {
	path: "/subscriptions",
	categories: ["anime"],
	example: "/iwara/subscriptions",
	parameters: {},
	features: {
		requireConfig: [{
			name: "IWARA_USERNAME",
			description: ""
		}, {
			name: "IWARA_PASSWORD",
			description: ""
		}],
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["www.iwara.tv/subscriptions/videos", "www.iwara.tv/subscriptions/images"] }],
	name: "User Subscriptions",
	maintainers: ["FeCCC"],
	handler,
	url: "www.iwara.tv/",
	description: `::: warning
This route requires username and password, therefore it's only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/deploy/config#route-specific-configurations) for route-specific configurations.
:::`
};
async function handler() {
	if (!config.iwara || !config.iwara.username || !config.iwara.password) throw new ConfigNotFoundError("Iwara subscription RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const username = config.iwara.username;
	const password = config.iwara.password;
	const { page, destroy } = await getPlaywrightPage(rootUrl, { gotoConfig: { waitUntil: "domcontentloaded" } });
	try {
		const fetchApi = (url, options) => page.evaluate(async (args) => {
			const res = await fetch(args.url, {
				method: args.options.method || "GET",
				headers: args.options.headers,
				body: args.options.body ? JSON.stringify(args.options.body) : void 0
			});
			if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
			return res.json();
		}, {
			url,
			options
		});
		const refreshHeaders = await cache_default.tryGet("iwara:token", async () => {
			return { authorization: "Bearer " + (await fetchApi(`${apiqRootUrl}/user/login`, {
				method: "POST",
				headers: apiHeaders,
				body: {
					email: username,
					password
				}
			})).token };
		}, 720 * 60 * 60, false);
		const authHeaders = await cache_default.tryGet("iwara:authToken", async () => {
			return { authorization: "Bearer " + (await fetchApi(`${apiqRootUrl}/user/token`, {
				method: "POST",
				headers: {
					...apiHeaders,
					Authorization: refreshHeaders.authorization
				}
			})).accessToken };
		}, 3600, false);
		const authedHeaders = {
			...apiHeaders,
			Authorization: authHeaders.authorization
		};
		const [videoResponse, imageResponse] = await Promise.all([fetchApi(`${apiqRootUrl}/videos?rating=all&page=0&limit=24&subscribed=true`, { headers: authedHeaders }), fetchApi(`${apiqRootUrl}/images?rating=all&page=0&limit=24&subscribed=true`, { headers: authedHeaders })]);
		const videoList = videoResponse.results.map((item) => {
			const imageUrl = item.file ? `${imageRootUrl}/image/original/${item.file.id}/thumbnail-${item.thumbnail.toString().padStart(2, "0")}.jpg` : "";
			return {
				title: item.title,
				author: item.user.name,
				link: `${rootUrl}/video/${item.id}`,
				category: ["Video", ...item.tags ? item.tags.map((i) => i.id) : []],
				imageUrl,
				pubDate: parseDate(item.createdAt),
				private: item.private
			};
		});
		const imageList = imageResponse.results.map((item) => {
			const imageUrl = item.thumbnail ? `${imageRootUrl}/image/original/${item.thumbnail.id}/${item.thumbnail.name}` : "";
			return {
				title: item.title,
				author: item.user.name,
				link: `${rootUrl}/image/${item.id}`,
				category: ["Image", ...item.tags ? item.tags.map((i) => i.id) : []],
				imageUrl,
				pubDate: parseDate(item.createdAt)
			};
		});
		return {
			title: "Iwara Subscription",
			link: rootUrl,
			item: await pMap([...videoList, ...imageList], (item) => cache_default.tryGet(item.link, async () => {
				let description = renderSubscriptionImages([item.imageUrl]);
				if (item.private === true) {
					description += "private";
					return {
						title: item.title,
						author: item.author,
						link: item.link,
						category: item.category,
						pubDate: item.pubDate,
						description
					};
				}
				const apiUrl = item.link.replace("www.iwara.tv", "apiq.iwara.tv");
				const response = await fetchApi(apiUrl, { headers: authedHeaders });
				description = renderSubscriptionImages(response.files ? response.files.filter((f) => f.type === "image").map((f) => `${imageRootUrl}/image/original/${f.id}/${f.name}`) : [item.imageUrl]);
				const body = response.body ? md.render(response.body) : "";
				description += body;
				return {
					title: item.title,
					author: item.author,
					link: item.link,
					category: item.category,
					pubDate: item.pubDate,
					description
				};
			}), { concurrency: 5 })
		};
	} finally {
		await destroy();
	}
}
//#endregion
export { route };
