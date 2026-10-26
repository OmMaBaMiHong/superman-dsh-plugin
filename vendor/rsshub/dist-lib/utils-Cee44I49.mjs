import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/zsxq/utils.ts
async function customFetch(path, retryCount = 0) {
	const { succeeded, code, resp_data } = (await got_default("https://api.zsxq.com/v2" + path, { headers: { cookie: `zsxq_access_token=${config.zsxq.accessToken};` } })).data;
	if (succeeded) return resp_data;
	if (code === 1059 && retryCount < 3) return customFetch(path, retryCount + 1);
	throw new Error("something wrong");
}
function parseTopicContent(text = "", images = []) {
	let result = text.replaceAll("\n", "<br>");
	result = result.replaceAll(/<e type="web" href="(.*?)" title="(.*?)" style="(.*?)" \/>/g, (_, p1, p2) => `<a href=${decodeURIComponent(p1)}>${decodeURIComponent(p2)}</a>`);
	result = result.replaceAll(/<e type="hashtag".*?title="(.*?)" \/>/g, (_, p1) => {
		return `<span>${decodeURIComponent(p1)}</span>`;
	});
	result += images.map((image) => `<img src="${image.original?.url ?? image.large?.url ?? image.thumbnail?.url}">`).join("<br>");
	return result;
}
function generateTopicDataItem(topics) {
	return topics.map((topic) => {
		let description;
		let title = "";
		const url = `https://wx.zsxq.com/topic/${topic.topic_id}`;
		switch (topic.type) {
			case "talk":
				title = topic.talk?.text?.split("\n", 1)[0] ?? "文章";
				description = parseTopicContent(topic.talk?.text, topic.talk?.images);
				break;
			case "q&a":
				title = topic.question?.text?.split("\n", 1)[0] ?? "问答";
				description = parseTopicContent(topic.question?.text, topic.question?.images);
				description = `<blockquote>${String(topic.question?.owner?.name ?? "匿名用户")} 提问：${description}</blockquote>`;
				if (topic.answered) {
					description += "<br>" + topic.answer?.owner.name + " 回答：<br><br>";
					description += parseTopicContent(topic.answer?.text, topic.answer?.images);
				}
				break;
			case "task":
				title = topic.task?.text?.split("\n", 1)[0] ?? "作业";
				description = parseTopicContent(topic.task?.text, topic.task?.images);
				break;
			case "solution":
				title = topic.solution?.text?.split("\n", 1)[0] ?? "写作业";
				description = parseTopicContent(topic.solution?.text, topic.solution?.images);
				break;
			default:
		}
		return {
			title: topic.title ?? title,
			description,
			pubDate: parseDate(topic.create_time),
			link: url
		};
	});
}
//#endregion
export { generateTopicDataItem as n, customFetch as t };
