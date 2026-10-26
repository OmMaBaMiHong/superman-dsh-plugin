import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { renderItemActionToHTML } from "@rss3/sdk";
//#region lib/utils/camelcase-keys.ts
const isObject = (obj) => obj && typeof obj === "object";
const isPlainObject = (obj) => isObject(obj) && Object.prototype.toString.call(obj) === "[object Object]" && Object.getPrototypeOf(obj) === Object.prototype;
/**
* A simple camelCase function that only handles strings, but not handling symbol, date, or other complex case.
* If you need to handle more complex cases, please use camelcase-keys package.
*/
const camelcaseKeys = (obj) => {
	if (Array.isArray(obj)) return obj.map((x) => camelcaseKeys(x));
	if (isPlainObject(obj)) {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			const nextKey = isMongoId(key) ? key : camelcase(key);
			result[nextKey] = camelcaseKeys(value);
		}
		return result;
	}
	return obj;
};
function camelcase(str) {
	return str.replace(/^_+/, "").replaceAll(/([_-][a-z])/gi, ($1) => $1.toUpperCase().replace("-", "").replace("_", ""));
}
const isMongoId = (id) => id.length === 24 && /^[\dA-F]{24}$/i.test(id);
//#endregion
//#region lib/routes/rss3/index.ts
const route = {
	path: "/:account/:network?/:tag?",
	categories: ["social-media"],
	example: "/rss3/vitalik.eth",
	name: "Account Activities",
	maintainers: ["DIYgod", "pseudoyu"],
	url: "docs.rss3.io/api-reference#tag/decentralized/GET/decentralized/%7Baccount%7D",
	handler,
	description: "Retrieve the activities associated with a specified account in the decentralized system.",
	parameters: {
		account: { description: "Retrieve activities from the specified account. This account is a unique identifier within the decentralized system." },
		network: {
			description: "Retrieve activities from the specified network.",
			default: "all",
			options: [
				{
					value: "all",
					label: "All"
				},
				{
					value: "arbitrum",
					label: "Arbitrum"
				},
				{
					value: "arweave",
					label: "Arweave"
				},
				{
					value: "avax",
					label: "Avax"
				},
				{
					value: "base",
					label: "Base"
				},
				{
					value: "binance-smart-chain",
					label: "Binance Smart Chain"
				},
				{
					value: "crossbell",
					label: "Crossbell"
				},
				{
					value: "ethereum",
					label: "Ethereum"
				},
				{
					value: "farcaster",
					label: "Farcaster"
				},
				{
					value: "gnosis",
					label: "Gnosis"
				},
				{
					value: "linea",
					label: "Linea"
				},
				{
					value: "optimism",
					label: "Optimism"
				},
				{
					value: "polygon",
					label: "Polygon"
				},
				{
					value: "vsl",
					label: "VSL"
				}
			]
		},
		tag: {
			description: "Retrieve activities from the specified tag.",
			default: "all",
			options: [
				{
					value: "all",
					label: "All"
				},
				{
					value: "collectible",
					label: "collectible"
				},
				{
					value: "exchange",
					label: "exchange"
				},
				{
					value: "metaverse",
					label: "metaverse"
				},
				{
					value: "rss",
					label: "rss"
				},
				{
					value: "social",
					label: "social"
				},
				{
					value: "transaction",
					label: "transaction"
				},
				{
					value: "unknown",
					label: "unknown"
				}
			]
		}
	}
};
async function handler(ctx) {
	const { account, network, tag } = ctx.req.param();
	if (account.includes("://") || account.includes("/")) throw new Error("Account should not contain \"://\" or path components");
	const { data } = await rofetch(`https://gi.rss3.io/decentralized/${account}?${new URLSearchParams({
		limit: "20",
		...network && network !== "all" && { network },
		...tag && tag !== "all" && { tag }
	})}`);
	return {
		title: `${account} activities`,
		link: "https://rss3.io",
		item: data.map((item) => {
			const content = renderItemActionToHTML(camelcaseKeys(item.actions));
			const description = `New ${item.tag} ${item.type} action on ${item.network}<br /><br />From: ${item.from}<br/>To: ${item.to}`;
			return {
				title: `New ${item.tag} ${item.type} action on ${item.network}`,
				description: content ?? description,
				link: item.actions?.[0]?.related_urls?.[0],
				guid: item.id,
				author: [{
					name: item.owner,
					avatar: `https://cdn.stamp.fyi/avatar/eth:${item.owner}`
				}],
				_extra: { raw: item }
			};
		})
	};
}
//#endregion
export { route };
