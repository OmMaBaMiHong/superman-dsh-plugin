import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/twitch/live.ts
const TWITCH_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const route = {
	path: "/live/:login",
	categories: ["live"],
	view: 5,
	example: "/twitch/live/riotgames",
	parameters: { login: "Twitch username" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Live",
	maintainers: ["hoilc"],
	handler
};
async function handler(ctx) {
	const login = ctx.req.param("login");
	const response = await got_default({
		method: "post",
		url: "https://gql.twitch.tv/gql",
		headers: {
			Referer: "https://player.twitch.tv",
			"Client-ID": TWITCH_CLIENT_ID
		},
		json: [
			{
				operationName: "ChannelShell",
				extensions: { persistedQuery: {
					version: 1,
					sha256Hash: "fea4573a7bf2644f5b3f2cbbdcbee0d17312e48d2e55f080589d053aad353f11"
				} },
				variables: {
					login,
					lcpVideosEnabled: false
				}
			},
			{
				operationName: "StreamMetadata",
				extensions: { persistedQuery: {
					version: 1,
					sha256Hash: "b57f9b910f8cd1a4659d894fe7550ccc81ec9052c01e438b290fd66a040b9b93"
				} },
				variables: {
					channelLogin: login,
					includeIsDJ: true
				}
			},
			{
				operationName: "RealtimeStreamTagList",
				extensions: { persistedQuery: {
					version: 1,
					sha256Hash: "a4747cac9d8e8bf6cf80969f6da6363ca1bdbd80fe136797e71504eb404313fd"
				} },
				variables: { channelLogin: login }
			},
			{
				operationName: "ChannelRoot_AboutPanel",
				variables: {
					channelLogin: login,
					skipSchedule: true,
					includeIsDJ: true
				},
				extensions: { persistedQuery: {
					version: 1,
					sha256Hash: "0df42c4d26990ec1216d0b815c92cc4a4a806e25b352b66ac1dd91d5a1d59b80"
				} }
			}
		]
	});
	const channelShellData = response.data[0].data;
	const streamMetadataData = response.data[1].data;
	const realtimeStreamTagListData = response.data[2].data;
	const channelRootAboutPanelData = response.data[3].data;
	const { userOrError } = channelShellData;
	const { user } = channelRootAboutPanelData;
	if (!userOrError.id) throw new Error(userOrError.__typename);
	const displayName = userOrError.displayName;
	const liveItem = [];
	if (streamMetadataData.user.stream) liveItem.push({
		title: streamMetadataData.user.lastBroadcast.title,
		author: displayName,
		category: realtimeStreamTagListData.user.stream.freeformTags.map((item) => item.name),
		description: `<img style="max-width: 100%;" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_${login}.jpg">`,
		pubDate: parseDate(streamMetadataData.user.stream.createdAt),
		guid: streamMetadataData.user.stream.id,
		link: `https://www.twitch.tv/${login}`
	});
	return {
		title: `Twitch - ${displayName} - Live`,
		description: user.description,
		link: `https://www.twitch.tv/${login}`,
		image: user.profileImageURL,
		item: liveItem,
		allowEmpty: true
	};
}
//#endregion
export { route };
