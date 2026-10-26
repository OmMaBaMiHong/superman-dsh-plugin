import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { i as toTitleCase } from "./common-utils-xJr7JYuG.mjs";
import { load } from "cheerio";
//#region lib/routes/eventbrite/events.ts
const route = {
	path: "/:region/:eventType?/:includePromoted?",
	categories: ["other"],
	example: "/eventbrite/canada--toronto/all-events",
	parameters: {
		eventType: "category of events for filtering",
		region: "Region or scope of events"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["eventbrite.com/d/:region/:eventType"],
		target: "/:region/:eventType"
	}, {
		source: ["eventbrite.ca/d/:region/:eventType"],
		target: "/:region/:eventType"
	}],
	name: "Events",
	maintainers: ["elibroftw"],
	handler: async (ctx) => {
		const params = ctx.req.param();
		const { region, includePromoted = "false" } = params;
		let eventType = params.eventType || "all-events";
		if (eventType === "events") eventType = "all-events";
		const link = `https://www.eventbrite.com/d/${region}/${eventType}/`;
		const $ = load(await rofetch(link));
		const eventsApiUrl = new URL("https://www.eventbrite.com/api/v3/destination/events");
		const includePromotedBool = includePromoted !== "false";
		const eventListEl = $("div.search-results-panel-content section>ul>li").toArray().filter((item) => includePromotedBool || !$(item).text().includes("Promoted"));
		const eventIds = eventListEl.map((item) => $(item).find("a.event-card-link").first().attr("data-event-id"));
		eventsApiUrl.searchParams.append("event_ids", eventIds.join(","));
		eventsApiUrl.searchParams.append("page_size", eventIds.length.toString());
		eventsApiUrl.searchParams.append("expand", "image,primary_venue,ticket_availability,primary_organizer");
		const eventsData = (await rofetch(eventsApiUrl.href)).events;
		const items = eventListEl.map((item, index) => {
			const el = $(item);
			const a = el.find(".event-card-details a.event-card-link").first();
			const fallbackTitle = a.attr("aria-label") || a.text() || a.html();
			const eventData = eventsData[index];
			if (eventData === void 0) {
				const pElements = el.find("p");
				return {
					title: fallbackTitle,
					author: pElements.length > 1 ? $(pElements[1]).text() : void 0
				};
			}
			return {
				title: el.text().includes("Promoted") ? `${eventData.name} (Promoted)` : eventData.name,
				link: eventData.url,
				pubDate: parseDate(eventData.published),
				author: eventData.primary_organizer === void 0 ? JSON.stringify(eventData) : eventData.primary_organizer.name,
				category: eventData.tags.map((tag) => tag.display_name),
				image: eventData.image.original.url,
				description: eventData.summary,
				id: eventData.eventbrite_event_id,
				content: {
					html: `${eventDate(eventData)}<br>${getAuthor(eventData)}<br>${getTicketPriceRange(eventData)}`,
					text: ""
				}
			};
		});
		return {
			title: `${toTitleCase(eventType.replaceAll("-", " "))} in ${toTitleCase(region.replaceAll("-", " "))}`,
			link,
			item: items
		};
	}
};
function getAuthor(event) {
	return `<a href="${event.primary_organizer.url}">${event.primary_organizer.name}</a>`;
}
function getTicketPriceRange(event) {
	const minPrice = event.ticket_availability.minimum_ticket_price.display;
	const maxPrice = event.ticket_availability.maximum_ticket_price.display;
	if (minPrice === maxPrice) return minPrice;
	return `${minPrice} - ${maxPrice}`;
}
function eventDate(event) {
	const endDate = event.end_date;
	const startDate = event.start_date;
	const startTime = event.start_time;
	const endTime = event.end_time;
	if (startDate === endDate) return `${startDate} ${startTime} - ${endTime}`;
	return `${startDate} ${startTime} - ${endDate} ${endTime}`;
}
//#endregion
export { route };
