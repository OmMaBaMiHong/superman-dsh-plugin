import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/remnote/changelog.ts
const FQDN = "feedback.remnote.com";
const apiGateway = "https://gateway.hellonext.co";
const route = {
	path: "/changelog",
	categories: ["program-update"],
	example: "/remnote/changelog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["remnote.com/changelog", "remnote.com/"] }],
	name: "Changelog",
	maintainers: ["TonyRL", "amakerlife"],
	handler,
	url: "remnote.com/changelog"
};
async function handler() {
	const { data } = await got_default(`${apiGateway}/api/v2/changelogs`, {
		headers: { "x-organization": FQDN },
		searchParams: {
			page: 1,
			status: "published"
		}
	});
	const items = data.map((item) => ({
		title: item.title,
		description: item.description_html,
		link: `https://${FQDN}/changelog/${item.slug}`,
		pubDate: parseDate(item.published_at.timestamp)
	}));
	return {
		title: "Changelog | RemNote",
		description: "Vote or request new RemNote features. Subscribe to get updates about new features from RemNote.",
		link: `https://${FQDN}/changelog`,
		image: "https://vault.hnxt.dev/uploads/organization_customization/favicon/3970/88153ff13b4b03492ddfee6e675228c1.png",
		item: items,
		language: "en-US"
	};
}
//#endregion
export { route };
