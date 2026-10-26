import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import vm from "node:vm";
//#region lib/routes/locals/feed.ts
const contentFilterMap = {
	nonplus: "regular_content",
	plus: "content_plus"
};
const contentTypeMap = {
	article: "article",
	audio: "audio",
	document: "document",
	live: "live_stream",
	live_stream: "live_stream",
	pdf: "document",
	podcast: "audio",
	podcasts: "audio",
	video: "video"
};
const rootUrl = "https://locals.com";
const route = {
	path: "/content/:community/:option1?/:option2?",
	categories: ["social-media"],
	example: "/locals/content/mattfradd/video",
	parameters: {
		community: "Community slug from `locals.com/:community/feed?mode=content`",
		option1: "Filter or content type. Filters: `plus`, `nonplus`. Content types: `video`, `live`, `audio`, `podcast`, `article`, `document`, `pdf`",
		option2: "Content type when `option1` is a filter"
	},
	description: "Fetches the Locals content library with an authenticated session cookie. By default it merges regular content and content+ posts, and it can be filtered by access tier and media type.",
	features: {
		requireConfig: [{
			name: "LOCALS_SESSION",
			description: "The value of the `locals2.v3.session` cookie after logging in to Locals"
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["locals.com/:community/feed"],
		target: "/content/:community"
	}],
	name: "Content Feed",
	maintainers: ["luckycold"],
	handler
};
function getCookieHeader(session) {
	return [
		`locals2.v3.session=${session}`,
		"locals.preferLocals2=false",
		"locals2.v3.locale.actual=en-us%2Cen",
		"locals2.v3.locale.inferred=en"
	].join("; ");
}
function getRequestHeaders(session) {
	return { Cookie: getCookieHeader(session) };
}
function extractAssetUrls(html) {
	return [...new Set(html.matchAll(/\/_build\/assets\/[^"'\s>]+\.js/g).toArray().map((match) => match[0]))];
}
function extractFeedActionId(asset) {
	const symbol = asset.match(/getFeedPosts:([A-Za-z_$][\w$]*)/)?.[1];
	if (!symbol) return;
	const match = asset.match(new RegExp(`${symbol}=s\\(\\(\\)=>\\{\\},"([^"]+)","([^"]+)"\\)`));
	if (!match) return;
	return `${match[1]}#${match[2]}`;
}
function createRequestBody(value) {
	let nextIndex = 0;
	const encode = (input) => {
		if (typeof input === "number") return {
			t: 0,
			s: input
		};
		if (typeof input === "string") return {
			t: 1,
			s: input
		};
		if (Array.isArray(input)) {
			const i = nextIndex++;
			return {
				a: input.map((item) => encode(item)),
				i,
				l: input.length,
				o: 0,
				t: 9
			};
		}
		if (input && typeof input === "object") {
			const i = nextIndex++;
			const entries = Object.entries(input).filter(([, item]) => item !== void 0);
			return {
				i,
				o: 0,
				p: {
					k: entries.map(([key]) => key),
					s: entries.length,
					v: entries.map(([, item]) => encode(item))
				},
				t: 10
			};
		}
		throw new Error("Unsupported Locals request payload.");
	};
	return JSON.stringify({
		f: 31,
		m: [],
		t: encode(value)
	});
}
function parseUnknownResponse(body, instanceId) {
	const sandbox = {
		$R: {},
		self: {}
	};
	sandbox.self.$R = sandbox.$R;
	vm.createContext(sandbox);
	vm.runInContext(body, sandbox, { timeout: 5e3 });
	const value = sandbox.self.$R?.[instanceId]?.[0];
	if (!value) throw new Error("Unable to decode the Locals server response.");
	return value;
}
function extractCommunityInfo(html, community) {
	const markerIndex = html.indexOf(`hashtag:"${community}"`);
	if (markerIndex === -1) throw new Error("Unable to resolve the Locals community metadata.");
	const context = html.slice(Math.max(0, markerIndex - 200), markerIndex + 1200);
	const idMatch = context.match(/id:(\d+)/);
	const titleMatch = context.match(/title:"([^"]+)"/);
	const descriptionMatch = context.match(/description:"([^"]*)"/);
	const imageMatch = context.match(/image:\$R\[\d+\]=\{big:"([^"]*)",thumb:"([^"]*)"/);
	if (!idMatch || !titleMatch) throw new Error("Unable to resolve the Locals community metadata.");
	return {
		description: descriptionMatch?.[1],
		design: { image: {
			big: imageMatch?.[1],
			thumb: imageMatch?.[2]
		} },
		hashtag: community,
		id: Number(idMatch[1]),
		title: titleMatch[1]
	};
}
function fetchContentPage(community, session) {
	return cache_default.tryGet(`locals:content-page:${community}`, () => rofetch(`${rootUrl}/${community}/feed?mode=content`, { headers: getRequestHeaders(session) }));
}
function resolveActionIds(community, session) {
	return cache_default.tryGet(`locals:action-ids:${community}`, async () => {
		const serverApiAsset = extractAssetUrls(await fetchContentPage(community, session)).find((assetUrl) => assetUrl.includes("/serverApi-"));
		if (!serverApiAsset) throw new Error("Unable to locate the current Locals serverApi asset.");
		const serverId = extractFeedActionId(await rofetch(new URL(serverApiAsset, rootUrl).href, { headers: getRequestHeaders(session) }));
		if (!serverId) throw new Error("Unable to discover the current Locals feed action id.");
		return serverId;
	});
}
function getImage(post) {
	return post.photos?.[0]?.sizes?.full?.url || post.photos?.[0]?.sizes?.thumb?.url || post.previews?.[0]?.url || post.previews?.[0]?.first_frame_url || post.videos?.[0]?.preview || post.audios?.[0]?.preview;
}
function getTitle(post) {
	const textFallback = post.text?.replaceAll(/<[^>]+>/g, "\n").split("\n").map((line) => line.trim()).find(Boolean);
	return post.title || post.subtitle || textFallback || post.share_url || "Locals post";
}
function renderDescription(image, description) {
	if (image && description) return `<p><img src="${image}"></p>${description}`;
	if (image) return `<p><img src="${image}"></p>`;
	return description;
}
function mapPostToItem(post) {
	const image = getImage(post);
	const hasBodyContent = Boolean(post.text || image || post.photos?.length || post.videos?.length || post.audios?.length);
	if (!post.share_url || !post.is_content && post.content_type === "no_content" && !hasBodyContent) return null;
	const contentType = post.content_type && post.content_type !== "no_content" ? [post.content_type] : [];
	const accessType = post.content_plus?.enabled ? ["content_plus"] : ["content"];
	return {
		author: post.author_name || post.author_username,
		category: [...accessType, ...contentType],
		description: renderDescription(image, post.text),
		image,
		itunes_item_image: image,
		link: post.share_url,
		pubDate: post.published ? parseDate(post.published) : post.post_date ? parseDate(post.post_date) : void 0,
		title: getTitle(post)
	};
}
function parseOptions(option1, option2) {
	const values = [option1, option2].filter(Boolean);
	const hasFilter = (value) => Object.hasOwn(contentFilterMap, value);
	const hasContentType = (value) => Object.hasOwn(contentTypeMap, value);
	const filter = values.find((value) => hasFilter(value));
	const contentType = values.find((value) => hasContentType(value));
	if (values.find((value) => !hasFilter(value) && !hasContentType(value))) throw new Error("Invalid Locals content route option. Supported filters are `plus` and `nonplus`, and supported content types are `video`, `live`, `audio`, `podcast`, `article`, `document`, and `pdf`.");
	return {
		contentType: contentType ? contentTypeMap[contentType] : void 0,
		filter
	};
}
async function requestServerFunction(session, id, key, args) {
	const response = await rofetch.raw(`${rootUrl}/_server`, {
		body: createRequestBody(args),
		headers: {
			"Content-Type": "application/json",
			...getRequestHeaders(session),
			"X-Server-Id": id,
			"X-Server-Instance": key
		},
		method: "POST",
		responseType: "text"
	});
	if (!response.ok) throw new Error(`Unable to access the Locals server function (${response.status}).`);
	return parseUnknownResponse(response._data, key);
}
function fetchCommunityInfo(community, session) {
	return cache_default.tryGet(`locals:community:${community}`, async () => {
		return extractCommunityInfo(await fetchContentPage(community, session), community);
	});
}
async function fetchFeedData(communityId, community, session, serverId, filter, contentType) {
	const requestFilter = filter ? contentFilterMap[filter] : void 0;
	const filters = requestFilter ? [requestFilter] : Object.values(contentFilterMap);
	const responses = await Promise.all(filters.map((currentFilter) => cache_default.tryGet(`locals:data:${communityId}:${community}:${currentFilter}:${contentType ?? "all"}`, () => requestServerFunction(session, serverId, `server-fn:rsshub-${community}-${currentFilter}-${contentType ?? "all"}`, [{
		communityId,
		contentType,
		filter: currentFilter,
		order: "recent",
		page: 1,
		pageSize: 20
	}]))));
	const items = /* @__PURE__ */ new Map();
	for (const response of responses) for (const post of response.data) {
		const item = mapPostToItem(post);
		if (!item?.link) continue;
		if (!items.has(item.link)) {
			items.set(item.link, item);
			continue;
		}
		const existing = items.get(item.link);
		if (existing) {
			existing.category = [.../* @__PURE__ */ new Set([...existing.category ?? [], ...item.category ?? []])];
			existing.description ||= item.description;
			existing.itunes_item_image ||= item.itunes_item_image;
		}
	}
	return items.values().toArray();
}
async function handler(ctx) {
	const { community, option1, option2 } = ctx.req.param();
	if (!config.locals?.session) throw new ConfigNotFoundError("Locals RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const { contentType, filter } = parseOptions(option1, option2);
	const serverId = await resolveActionIds(community, config.locals.session);
	const communityInfo = await fetchCommunityInfo(community, config.locals.session);
	const items = await fetchFeedData(communityInfo.id, community, config.locals.session, serverId, filter, contentType);
	return {
		description: `Locals content feed for ${communityInfo.title}${filter ? ` (${filter})` : ""}${contentType ? ` (${contentType})` : ""}`,
		image: communityInfo.design?.image?.big || communityInfo.design?.image?.thumb,
		item: items,
		link: `https://locals.com/${community}/feed?mode=content${contentType ? `&content=${contentType}` : ""}`,
		title: `Locals - ${communityInfo.title}`
	};
}
//#endregion
export { route };
