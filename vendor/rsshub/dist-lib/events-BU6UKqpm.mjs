import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/link3/events.ts
const route = {
	path: "/events",
	name: "Link3 Events",
	url: "link3.to",
	maintainers: ["cxheng315"],
	example: "/link3/events",
	categories: ["other"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["link3.to/events"],
		target: "/events"
	}],
	handler
};
async function handler() {
	return {
		title: "Link3 Events",
		link: "https://link3.to/events",
		description: "Link3 is a Web3 native social platform built on CyberConnect protocol.",
		image: "https://link3.to/logo.svg",
		logo: "https://link3.to/logo.svg",
		author: "Link3",
		item: (await rofetch("https://api.cyberconnect.dev/profile/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: {
				variables: { order: "START_TIME_ASC" },
				query: `
                query getTrendingEvents($first: Int, $after: String, $order: TrendingEventsRequest_EventOrder, $filter: TrendingEventsRequest_EventFilter) {
                    trendingEvents(first: $first, after: $after, order: $order, filter: $filter) {
                        list {
                            id
                            info
                            title
                            posterUrl
                            startTimestamp
                            endTimestamp
                            organizer {
                                lightInfo {
                                    displayName
                                    profilePicture
                                    profileHandle
                                }
                            }
                        }
                    }
                }
            `
			}
		})).data.trendingEvents.list.map((event) => ({
			title: event.title,
			link: `https://link3.to/e/${event.id}`,
			description: event.info ?? "",
			author: event.organizer.lightInfo.displayName,
			guid: event.id,
			pubDate: parseDate(event.startTimestamp * 1e3),
			itunes_item_image: event.posterUrl,
			itunes_duration: event.endTimestamp - event.startTimestamp
		}))
	};
}
//#endregion
export { route };
