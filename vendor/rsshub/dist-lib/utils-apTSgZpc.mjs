import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/fansly/utils.tsx
const apiBaseUrl = "https://apiv3.fansly.com";
const baseUrl = "https://fansly.com";
const icon = `${baseUrl}/assets/images/icons/apple-touch-icon.png`;
const findAccountById = (accountId, accounts) => {
	const account = accounts.find((account) => account.id === accountId);
	return {
		displayName: account.displayName,
		username: account.username
	};
};
const getAccountByUsername = (username) => cache_default.tryGet(`fansly:account:${username.toLowerCase()}`, async () => {
	const { data: accountResponse } = await got_default(`${apiBaseUrl}/api/v1/account`, { searchParams: {
		usernames: username,
		"ngsw-bypass": true
	} });
	if (!accountResponse.response.length) throw new InvalidParameterError("This profile or page does not exist.");
	return accountResponse.response[0];
});
const getTimelineByAccountId = async (accountId) => {
	const { data: timeline } = await got_default(`${apiBaseUrl}/api/v1/timelinenew/${accountId}`, { searchParams: {
		before: 0,
		after: 0,
		wallId: "",
		contentSearch: "",
		"ngsw-bypass": true
	} });
	return timeline.response;
};
const getTagId = (tag) => cache_default.tryGet(`fansly:tag:${tag.toLowerCase()}`, async () => {
	const { data: tagResponse } = await got_default(`${apiBaseUrl}/api/v1/contentdiscovery/media/tag`, { searchParams: {
		tag,
		"ngsw-bypass": true
	} });
	if (!tagResponse.response.mediaOfferSuggestionTag) throw new Error("Couldn't find this hashtag.");
	return tagResponse.response.mediaOfferSuggestionTag.id;
});
const getTagSuggestion = async (tagId) => {
	const { data: suggestionResponse } = await got_default(`${apiBaseUrl}/api/v1/contentdiscovery/media/suggestionsnew`, { searchParams: {
		before: 0,
		after: 0,
		tagIds: tagId,
		limit: 25,
		offset: 0,
		"ngsw-bypass": true
	} });
	return suggestionResponse.response;
};
const parseDescription = (post, aggregationData) => post.content.replaceAll("\n", "<br>") + "<br>" + parseAttachments(post.attachments, aggregationData);
const parseAttachments = (attachments, aggregationData) => attachments.map((attachment) => {
	switch (attachment.contentType) {
		case 1: return parseMedia(attachment.contentId, aggregationData.accountMedia);
		case 2: {
			let attachments = "";
			const bundle = aggregationData.accountMediaBundles.find((bundle) => bundle.id === attachment.contentId);
			for (const mediaId of bundle.accountMediaIds) attachments += parseMedia(mediaId, aggregationData.accountMedia);
			return attachments;
		}
		case 8: {
			let attachments = "<br><br>";
			const repost = aggregationData.aggregatedPosts.find((post) => post.id === attachment.contentId) || aggregationData.posts.find((post) => post.id === attachment.contentId);
			attachments += parseDescription(repost, aggregationData);
			return attachments;
		}
		case 7100: return renderTipGoal(attachment.contentId, aggregationData.tipGoals);
		case 32001: return "";
		case 42001: return renderPoll(attachment.contentId, aggregationData.polls);
		default: throw new Error(`Unhandled attachment type: ${attachment.contentType} for post ${attachment.postId}`);
	}
}).join("");
const parseMedia = (contentId, accountMedia) => {
	const media = accountMedia.find((media) => media.id === contentId);
	if (!media) return "";
	return renderMedia(media.preview ?? media.media);
};
const renderMedia = (media) => {
	switch (media.mimetype) {
		case "image/gif":
		case "image/jpeg":
		case "image/png":
		case "video/mp4":
		case "audio/mp4": return renderToString(/* @__PURE__ */ jsx(FanslyMedia, {
			poster: media.mimetype === "video/mp4" ? media.variants[0].locations[0] : null,
			src: media.locations[0]
		}));
		default: throw new Error(`Unhandled media type: ${media.mimetype}`);
	}
};
const renderPoll = (pollId, polls) => {
	const poll = polls.find((poll) => poll.id === pollId);
	return renderToString(/* @__PURE__ */ jsx(FanslyPoll, {
		title: poll.question,
		options: poll.options,
		version: poll.version
	}));
};
const renderTipGoal = (tipGoalId, tipGoals) => {
	const goal = tipGoals.find((goal) => goal.id === tipGoalId);
	return renderToString(/* @__PURE__ */ jsx(FanslyTipGoal, {
		label: goal.label,
		currentPercentage: goal.currentPercentage,
		currentAmount: goal.currentAmount,
		goalAmount: goal.goalAmount
	}));
};
const FanslyMedia = ({ poster, src }) => /* @__PURE__ */ jsxs(Fragment, { children: [poster && src ? /* @__PURE__ */ jsx("video", {
	controls: true,
	preload: "metadata",
	poster: poster.location,
	children: /* @__PURE__ */ jsx("source", {
		src: src.location,
		type: "video/mp4"
	})
}) : src ? /* @__PURE__ */ jsx("img", { src: src.location }) : null, /* @__PURE__ */ jsx("br", {})] });
const FanslyPoll = ({ title, options, version }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("b", { children: title }),
	/* @__PURE__ */ jsx("br", {}),
	options.map((option) => /* @__PURE__ */ jsxs(Fragment, { children: [
		option.voteCount,
		"/",
		version,
		" ",
		option.title,
		/* @__PURE__ */ jsx("br", {})
	] }))
] });
const FanslyTipGoal = ({ label, currentPercentage, currentAmount, goalAmount }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	label,
	/* @__PURE__ */ jsx("br", {}),
	currentPercentage,
	"% $",
	currentAmount / 1e3,
	" / $",
	goalAmount / 1e3
] });
//#endregion
export { getTagSuggestion as a, parseDescription as c, getTagId as i, findAccountById as n, getTimelineByAccountId as o, getAccountByUsername as r, icon as s, baseUrl as t };
