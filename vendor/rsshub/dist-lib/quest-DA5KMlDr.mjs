import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as baseUrl, o as getQuests } from "./discord-api-CpkJyTNw.mjs";
//#region lib/routes/discord/quest.ts
const route = {
	path: "/quests",
	categories: ["social-media"],
	example: "/discord/quests",
	features: {
		requireConfig: [{
			name: "DISCORD_AUTHORIZATION",
			description: "Discord authorization header"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["discord.com/quest-home"] }],
	name: "Quests",
	maintainers: ["TonyRL"],
	handler
};
async function handler() {
	const { authorization } = config.discord || {};
	if (!authorization) throw new ConfigNotFoundError("Discord RSS is disabled due to the lack of authorization config");
	const items = (await getQuests(authorization)).quests.map((quest) => {
		const tasks = Object.values(quest.config.task_config.tasks).map((task) => task.event_name);
		return {
			title: `${quest.config.messages.quest_name} - Claim ${quest.config.rewards_config.rewards[0].messages.name}`,
			description: tasks.join(", "),
			author: quest.config.messages.game_publisher,
			pubDate: parseDate(quest.config.starts_at),
			category: tasks,
			link: quest.config.application.link.split("?", 1)[0],
			guid: quest.id
		};
	});
	return {
		title: "Available Quests - Discord",
		link: `${baseUrl}/quest-home`,
		item: items
	};
}
//#endregion
export { route };
