import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { parse } from "tldts";
//#region lib/routes/follow/profile.ts
const route = {
	name: "User subscriptions",
	categories: ["social-media"],
	path: "/profile/:uid",
	example: "/follow/profile/41279032429549568",
	parameters: { uid: "User ID or user handle" },
	radar: [{
		source: ["app.follow.is/profile/:uid"],
		target: "/profile/:uid"
	}],
	handler,
	maintainers: [
		"KarasuShin",
		"DIYgod",
		"DFobain"
	],
	features: { supportRadar: true },
	view: 5
};
const isList = (subscription) => "lists" in subscription;
const isInbox = (subscription) => "inboxId" in subscription;
const isFeed = (subscription) => "feeds" in subscription;
async function handler(ctx) {
	const handleOrId = ctx.req.param("uid");
	const host = "https://api.follow.is";
	const handle = isBizId(handleOrId || "") ? handleOrId : handleOrId.startsWith("@") ? handleOrId.slice(1) : handleOrId;
	const searchParams = new URLSearchParams({ handle });
	if (isBizId(handle || "")) searchParams.append("id", handle);
	const profile = await rofetch(`${host}/profiles?${searchParams.toString()}`);
	const subscriptions = await rofetch(`${host}/subscriptions?userId=${profile.data.id}`);
	return {
		title: `${profile.data.name}'s subscriptions`,
		item: subscriptions.data.filter((i) => !isInbox(i) && (!isFeed(i) || !i.feeds.errorAt)).map((subscription) => {
			if (isList(subscription)) return {
				title: subscription.lists.title,
				description: subscription.lists.description,
				link: `https://app.follow.is/list/${subscription.listId}`,
				image: subscription.lists.image
			};
			return {
				title: subscription.feeds.title,
				description: subscription.feeds.description,
				link: `https://app.follow.is/feed/${subscription.feedId}`,
				image: getUrlIcon(subscription.feeds.siteUrl).src,
				category: subscription.category ? [subscription.category] : void 0
			};
		}),
		link: `https://app.follow.is/share/users/${handleOrId}`,
		image: profile.data.image
	};
}
const getUrlIcon = (url, fallback) => {
	let src;
	let fallbackUrl = "";
	try {
		const { host } = new URL(url);
		const pureDomain = parse(host).domainWithoutSuffix;
		fallbackUrl = `https://avatar.vercel.sh/${pureDomain}.svg?text=${pureDomain?.slice(0, 2).toUpperCase()}`;
		src = `https://unavatar.follow.is/${host}?fallback=${fallback || false}`;
	} catch {
		const pureDomain = parse(url).domainWithoutSuffix;
		src = `https://avatar.vercel.sh/${pureDomain}.svg?text=${pureDomain?.slice(0, 2).toUpperCase()}`;
	}
	return {
		src,
		fallbackUrl
	};
};
const EPOCH = 1712546615000n;
const MAX_TIMESTAMP_BITS = 41n;
const isBizId = (id) => {
	if (!id || !/^\d{13,19}$/.test(id)) return false;
	const snowflake = BigInt(id);
	const timestamp = (snowflake >> 63n - MAX_TIMESTAMP_BITS) + EPOCH;
	const date = new Date(Number(timestamp));
	if (date.getFullYear() >= 2024 && date.getFullYear() <= 2050) {
		if (snowflake <= (1n << 63n) - 1n) return true;
	}
	return false;
};
//#endregion
export { isBizId, route };
