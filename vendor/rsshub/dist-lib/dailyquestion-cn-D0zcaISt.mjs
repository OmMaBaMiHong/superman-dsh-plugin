import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderQuestionDescription } from "./question-description-uz33Xg5S.mjs";
//#region lib/routes/leetcode/dailyquestion-cn.ts
const route = {
	path: "/dailyquestion/cn",
	radar: [{ source: ["leetcode.cn/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "leetcode.cn/"
};
async function handler() {
	const question = {
		date: "",
		link: "",
		titleSlug: "",
		content: "",
		frontedId: "",
		difficulty: "",
		tags: ""
	};
	const url = "https://leetcode.cn/graphql";
	const data = (await got_default({
		method: "post",
		url,
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			query: `
            query questionOfToday {
                todayRecord {
                    date
                    question {
                        frontendQuestionId: questionFrontendId
                        titleSlug
                    }
                }
            }
        `,
			variables: {}
		})
	})).data.data.todayRecord[0];
	question.date = data.date;
	question.titleSlug = data.question.titleSlug;
	question.link = "https://leetcode.cn/problems/" + question.titleSlug;
	const detailsPayload = {
		operationName: "questionData",
		query: `
            query questionData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    questionId
                    questionFrontendId
                    title
                    titleSlug
                    content
                    translatedTitle
                    translatedContent
                    difficulty
                    topicTags {
                        name
                        slug
                        translatedName
                        __typename
                    }
                    __typename
                }
            }
        `,
		variables: { titleSlug: question.titleSlug }
	};
	const detailsResponse = await got_default({
		method: "post",
		url,
		headers: { "content-type": "application/json" },
		body: JSON.stringify(detailsPayload)
	});
	const emoji = {
		Medium: "🟡",
		Easy: "🟢",
		Hard: "🔴"
	};
	const details = detailsResponse.data.data.question;
	question.content = details.translatedContent;
	question.frontedId = details.questionFrontendId;
	question.difficulty = emoji[details.difficulty];
	let topicTags = details.topicTags;
	topicTags = topicTags.map((item) => {
		let slug = "#" + item.slug;
		slug = slug.replaceAll("-", "_");
		return slug;
	});
	question.tags = topicTags.join(" ");
	const rssData = {
		title: question.frontedId + "." + question.titleSlug,
		description: renderQuestionDescription({ question }),
		link: question.link
	};
	return {
		title: "LeetCode 每日一题",
		link: "https://leetcode.cn",
		description: "Leetcode 每日一题",
		item: [{
			title: rssData.title,
			description: rssData.description + question.content,
			link: rssData.link
		}]
	};
}
//#endregion
export { route };
