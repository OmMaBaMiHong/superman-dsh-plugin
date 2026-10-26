import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import crypto from "node:crypto";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/behance/queries.ts
const getProfileProjectsAndSelectionsQuery = `
    query GetProfileProjectsAndSections($username: String, $after: String) {
        user(username: $username) {
            hasPortfolio
            profileSections {
                ...profileSectionFields
            }
            profileProjects(first: 12, after: $after) {
                pageInfo {
                    endCursor
                    hasNextPage
                }
                nodes {
                    __typename
                    adminFlags {
                        mature_lock
                        privacy_lock
                        dmca_lock
                        flagged_lock
                        privacy_violation_lock
                        trademark_lock
                        spam_lock
                        eu_ip_lock
                    }
                    canBeBoosted
                    colors {
                        r
                        g
                        b
                    }
                    covers {
                        size_202 {
                            url
                        }
                        size_404 {
                            url
                        }
                        size_808 {
                            url
                        }
                    }
                    features {
                        url
                        name
                        featuredOn
                        ribbon {
                            image
                            image2x
                            image3x
                        }
                    }
                    fields {
                        id
                        label
                        slug
                        url
                    }
                    hasMatureContent
                    id
                    isBoosted
                    isFeatured
                    isHiddenFromWorkTab
                    isMatureReviewSubmitted
                    isMonaReported
                    isOwner
                    isFounder
                    isPinnedToSubscriptionOverview
                    isPrivate
                    sourceFiles {
                        ...sourceFileWithCoverFields
                    }
                    matureAccess
                    modifiedOn
                    name
                    owners {
                        ...OwnerFields
                        images {
                            size_50 {
                                url
                            }
                        }
                    }
                    premium
                    publishedOn
                    privacyLevel
                    profileSectionId
                    stats {
                        appreciations {
                            all
                        }
                        views {
                            all
                        }
                        comments {
                            all
                        }
                    }
                    slug
                    url
                }
            }
        }
        viewer {
            flags {
                hasClickedOnAddProfileSectionButton
                hasSeenProfilePortfolioUpsellModal
                hasSeenCreatorProIntroModal
                lastSeenMarketingPopupTimestamp
                onboardedAsHirer
            }
        }
    }

    fragment sourceFileWithCoverFields on SourceFile {
        __typename
        sourceFileId
        projectId
        userId
        title
        assetId
        renditionUrl
        mimeType
        size
        category
        licenseType
        unitAmount
        currency
        tier
        hidden
        extension
        hasUserPurchased
        description
        cover {
            coverUrl
            coverX
            coverY
            coverScale
        }
    }

    fragment OwnerFields on User {
        displayName
        hasPremiumAccess
        id
        isFollowing
        isProfileOwner
        location
        locationUrl
        url
        username
        isMessageButtonVisible
        availabilityInfo {
            availabilityTimeline
            isAvailableFullTime
            isAvailableFreelance
            hiringTimeline {
                key
                label
            }
        }
        creatorPro {
            isActive
            initialSubscriptionDate
        }
    }

    fragment profileSectionFields on ProfileSection {
        id
        isDefault
        name
        order
        projectCount
        userId
    }
`;
const getAppreciatedQuery = `
    query GetAppreciatedProjects($username: String, $after: String) {
        user(username: $username) {
            appreciatedProjects(first: 24, after: $after) {
                nodes {
                    __typename
                    colors {
                        r
                        g
                        b
                    }
                    covers {
                        size_202 {
                            url
                        }
                        size_404 {
                            url
                        }
                        size_808 {
                            url
                        }
                    }
                    slug
                    id
                    name
                    url
                    owners {
                        ...OwnerFields
                        images {
                            size_50 {
                                url
                            }
                        }
                    }
                    stats {
                        appreciations {
                            all
                        }
                        views {
                            all
                        }
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }
    fragment OwnerFields on User {
        displayName
        hasPremiumAccess
        id
        isFollowing
        isProfileOwner
        location
        locationUrl
        url
        username
        isMessageButtonVisible
        availabilityInfo {
            availabilityTimeline
            isAvailableFullTime
            isAvailableFreelance
            hiringTimeline {
                key
                label
            }
        }
        creatorPro {
            isActive
            initialSubscriptionDate
        }
    }
`;
const getProjectPageQuery = `
    query ProjectPage($projectId: ProjectId!, $projectPassword: String) {
        viewer {
            ...Project_Viewer
        }
        project(id: $projectId) {
            id
            slug
            premium
            isPrivate
            isOwner
            canvasWidth
            embedTag
            url
            stylesInline
            ...Project_Project
            ...EmbedShareModal_Project
            creator {
                hasPremiumAccess
            }
            owners {
                id
                username
                displayName
            }
            allModules(projectPassword: $projectPassword) {
                __typename
            }
        }
    }
    fragment Avatar_UserImageSizes on UserImageSizes {
        ...AvatarImage_UserImageSizes
    }
    fragment Avatar_User on User {
        id
        url
        images {
            ...Avatar_UserImageSizes
        }
        creatorPro {
            isActive
        }
        ...CreatorProBadge_User
    }
    fragment AvatarImage_UserImageSizes on UserImageSizes {
        allAvailable {
            url
            width
            type
        }
    }
    fragment CreatorProBadge_User on User {
        creatorPro {
            initialSubscriptionDate
        }
    }
    fragment EmbedShareModal_Project on Project {
        ...EmbedShareProjectCover_Project
    }
    fragment Feature_ProjectFeature on ProjectFeature {
        url
        name
        featuredOn
        ribbon {
            image
            image2x
        }
    }
    fragment HireOverlay_User on User {
        id
        firstName
        isResponsiveToHiring
        isMessageButtonVisible
        ...Avatar_User
        ...WideMessageButton_User
        availabilityInfo {
            hiringTimeline {
                key
            }
        }
    }
    fragment ProjectInfoBox_User on User {
        id
        displayName
        url
        isFollowing
        ...MultipleOwners_User
    }
    fragment ProjectInfoBox_Project on Project {
        id
        name
        url
        isOwner
        covers {
            allAvailable {
                url
                width
                type
            }
        }
        owners {
            ...ProjectInfoBox_User
        }
    }
    fragment SourceAssetsPane_SourceFile on SourceFile {
        ...SourceFileRowsContainer_SourceFile
    }
    fragment SourceFileRowsContainer_SourceFile on SourceFile {
        tier
        hasUserPurchased
        ...SourceFileRow_SourceFile
    }
    fragment UserInfo_User on User {
        displayName
        id
        location
        locationUrl
        url
        country
        isProfileOwner
        city
        state
        creatorPro {
            isActive
        }
        ...Avatar_User
    }
    fragment UsersTooltip_User on User {
        displayName
        id
        isFollowing
        isProfileOwner
        availabilityInfo {
            isAvailableFullTime
            isAvailableFreelance
        }
        ...UserInfo_User
    }
    fragment DominantColor_Colors on Colors {
        r
        g
        b
    }
    fragment Tools_Tool on Tool {
        id
        title
        url
        backgroundImage {
            size_original {
                url
            }
        }
        backgroundColor
        synonym {
            tagId
            name
            title
            downloadUrl
            iconUrl
        }
    }
    fragment HireMeForm_UserAvailabilityInfo on UserAvailabilityInfo {
        isAvailableFreelance
        isAvailableFullTime
        budgetMin
        currency
        compensationMin
        hiringTimeline {
            key
        }
    }
    fragment MessageDialogManager_User on User {
        id
        displayName
        username
        images {
            ...AvatarImage_UserImageSizes
        }
        creatorPro {
            isActive
        }
        ...SendRegularMessagePane_User
        ...ServicesPane_User
    }
    fragment SendRegularMessagePane_User on User {
        displayName
        availabilityInfo {
            ...HireMeForm_UserAvailabilityInfo
        }
    }
    fragment ServicesPane_User on User {
        id
        displayName
        ...InquireServiceModal_User
        ...ViewServiceInfoModal_User
    }
    fragment MessageManager_User on User {
        id
        isMessageButtonVisible
        displayName
        username
        ...MessageDialogManager_User
        availabilityInfo {
            availabilityTimeline
            isAvailableFullTime
            isAvailableFreelance
            hiringTimeline {
                key
            }
        }
    }
    fragment WideMessageButton_User on User {
        firstName
        ...MessageManager_User
    }
    fragment AppreciationNotification_Viewer on Viewer {
        url
    }
    fragment Avatar_Project_User on User {
        id
        ...Avatar_User
    }
    fragment ImageElement_ImageModule on ImageModule {
        id
        altText
        height
        width
        fullBleed
        imageSizes {
            allAvailable(type: [JPG, WEBP]) {
                url
                width
                height
                type
            }
            size_max_158 {
                url
            }
        }
    }
    fragment Module_ProjectModule on ProjectModule {
        ...Embed_ProjectModule
        ... on AudioModule {
            id
            caption
            captionAlignment
        }
        ... on VideoModule {
            id
            caption
            captionAlignment
        }
        ... on EmbedModule {
            id
            caption
            captionAlignment
        }
        ... on ImageModule {
            id
            ...ThreeD_ImageModule
            ...SingleImage_ImageModule
            ...Image_ImageModule
        }
        ... on MediaCollectionModule {
            id
            caption: captionPlain
            captionAlignment
            components {
                ...Actions_MediaCollectionComponent
                filename
                flexHeight
                flexWidth
                height
                width
                id
                imageSizes {
                    allAvailable(type: [JPG, WEBP]) {
                        url
                        width
                        height
                        type
                    }
                }
            }
            fullBleed
        }
        ... on TextModule {
            id
            text
            alignment
        }
    }
    fragment MultipleOwners_User on User {
        ...UsersTooltip_User
    }
    fragment MultipleOwners_Project on Project {
        id
        name
    }
    fragment Project_Owners_User on User {
        id
        displayName
        username
        firstName
        url
        isFollowing
        isMessageButtonVisible
        isCreatorPro
        creatorPro {
            isActive
        }
        ...UsersTooltip_User
        ...MultipleOwners_User
        ...Avatar_Project_User
        ...Avatar_User
        ...HireOverlay_User
    }
    fragment Project_Creator_User on User {
        id
        isProfileOwner
        isFollowing
        hasPremiumAccess
        hasAllowEmbeds
        url
        ...PaneHeader_User
    }
    fragment Project_ProjectCoverImageSizes on ProjectCoverImageSizes {
        allAvailable {
            url
            width
            type
        }
    }
    fragment Project_Tool on Tool {
        ...Tools_Tool
    }
    fragment Project_SourceFile on SourceFile {
        ...SourceFileRowsContainer_SourceFile
        ...SourceFilesProjectOverlay_SourceFile
        ...ProjectExtras_SourceFile
    }
    fragment Project_ProjectFeature on ProjectFeature {
        ...Feature_ProjectFeature
    }
    fragment Project_Project on Project {
        id
        slug
        name
        url
        description
        tags {
            id
            title
        }
        privacyLevel
        matureAccess
        canvasWidth
        isOwner
        hasMatureContent
        isPrivate
        publishedOn
        canBeAddedToMoodboard
        isMonaReported
        isAppreciated
        projectCTA {
            ctaType
            link {
                description
                url
                title
            }
            isDefaultCTA
        }
        ...MultipleOwners_Project
        ...ProjectInfoBox_Project
        ...ProjectLightbox_Project
        ...ProjectExtras_Project
        covers {
            ...Project_ProjectCoverImageSizes
        }
        sourceFiles {
            ...Project_SourceFile
        }
        creator {
            ...Project_Creator_User
        }
        owners {
            ...Project_Owners_User
        }
        tools {
            ...Project_Tool
        }
        allModules(projectPassword: $projectPassword) {
            ... on AudioModule {
                id
                fullBleed
                caption
            }
            ... on EmbedModule {
                id
                caption
            }
            ... on ImageModule {
                id
                fullBleed
                caption
                imageSizes {
                    size_disp {
                        url
                    }
                    size_disp_still {
                        url
                    }
                }
                ...Actions_ImageModule
            }
            ... on MediaCollectionModule {
                id
                fullBleed
                caption: captionPlain
                components {
                    id
                    imageSizes {
                        size_disp {
                            url
                        }
                        size_disp_still {
                            url
                        }
                    }
                    ...Actions_MediaCollectionComponent
                }
            }
            ... on TextModule {
                id
                fullBleed
            }
            ... on VideoModule {
                id
                fullBleed
                caption
            }
            ...Module_ProjectModule
        }
        aeroData {
            externalUrl
        }
        adminNotices {
            title
            body
            isReviewable
        }
        license {
            license
        }
        features {
            ...Project_ProjectFeature
        }
        stats {
            appreciations {
                all
            }
            views {
                all
            }
        }
        styles {
            spacing {
                projectTopMargin
            }
        }
        colors {
            r
            g
            b
        }
    }
    fragment Project_Viewer on Viewer {
        stats {
            appreciations
        }
        pulsePoints {
            displayFollow
            displayAppreciate
        }
        flags {
            hasSeenCreatorProIntroModal
            onboardedAsHirer
        }
        creatorPro {
            isActive
        }
        createdOn
        ...AppreciationNotification_Viewer
        ...ProjectExtras_Viewer
    }
    fragment ProjectComments_Viewer on Viewer {
        ...ProjectCommentInput_Viewer
        id
    }
    fragment ProjectCommentInput_Viewer on Viewer {
        url
        images {
            size_50 {
                url
            }
        }
    }
    fragment ProjectExtras_SourceFile on SourceFile {
        ...ProjectInfo_SourceFile
    }
    fragment ProjectExtras_Project on Project {
        isCommentingAllowed
    }
    fragment ProjectExtras_Viewer on Viewer {
        ...ProjectInfo_Viewer
    }
    fragment ProjectInfo_SourceFile on SourceFile {
        ...SourceAssetsPane_SourceFile
    }
    fragment ProjectInfo_Viewer on Viewer {
        id
        ...ProjectComments_Viewer
    }
    fragment ProjectLightbox_Project on Project {
        id
        slug
        isOwner
        ...ProjectInfoBox_Project
    }
    fragment SourceFilesProjectOverlay_SourceFile on SourceFile {
        hasUserPurchased
        ...SourceFileRow_SourceFile
    }
    fragment Video_VideoDisplay on VideoModule {
        captionPlain
        embed
        height
        id
        width
    }
    fragment Actions_ImageModule on ImageModule {
        id
        hasCaiData
        projectId
        src
        width
        projectId
        exifData {
            lens {
                ...Actions_exifDataValue
            }
            software {
                ...Actions_exifDataValue
            }
            makeAndModel {
                ...Actions_exifDataValue
            }
            focalLength {
                ...Actions_exifDataValue
            }
            iso {
                ...Actions_exifDataValue
            }
            location {
                ...Actions_exifDataValue
            }
            flash {
                ...Actions_exifDataValue
            }
            exposureMode {
                ...Actions_exifDataValue
            }
            shutterSpeed {
                ...Actions_exifDataValue
            }
            aperture {
                ...Actions_exifDataValue
            }
        }
    }
    fragment Actions_exifDataValue on exifDataValue {
        id
        searchValue
        label
        value
    }
    fragment Actions_MediaCollectionComponent on MediaCollectionComponent {
        id
    }
    fragment Audio_AudioModule on AudioModule {
        captionPlain
        embed
        fullBleed
        id
    }
    fragment Embed_ProjectModule on ProjectModule {
        ... on EmbedModule {
            ...ExternalEmbed_EmbedModule
        }
        ... on AudioModule {
            isDoneProcessing
            ...Audio_AudioModule
        }
        ... on VideoModule {
            isDoneProcessing
            ...Video_VideoModule
        }
    }
    fragment ExternalEmbed_EmbedModule on EmbedModule {
        captionPlain
        fluidEmbed
        embedModuleFullBleed: fullBleed
        height
        id
        originalEmbed
        originalHeight
        originalWidth
        width
        widthUnit
    }
    fragment Image_ImageModule on ImageModule {
        id
        caption
        captionAlignment
        fullBleed
        height
        width
        altText
        ...Actions_ImageModule
        ...ImageElement_ImageModule
    }
    fragment SingleImage_ImageModule on ImageModule {
        id
        caption
        captionAlignment
        fullBleed
        height
        width
        ...Actions_ImageModule
        ...ImageElement_ImageModule
    }
    fragment ThreeD_ImageModule on ImageModule {
        id
        altText
        threeDData {
            iframeUrl
        }
    }
    fragment Video_VideoModule on VideoModule {
        fullBleed
        id
        ...Video_VideoDisplay
    }
    fragment Avatar_EmbedFragment on User {
        id
        images {
            allAvailable {
                url
                width
            }
        }
        displayName
    }
    fragment EmbedShareProjectCover_SourceFile on SourceFile {
        ...PaidAndFreeAssetsCountBadge_Embed_SourceFile
    }
    fragment EmbedShareProjectCover_User on User {
        ...Avatar_EmbedFragment
    }
    fragment EmbedShareProjectCover_Project on Project {
        id
        isPrivate
        isPublished
        hasMatureContent
        creator {
            hasAllowEmbeds
        }
        colors {
            ...DominantColor_Colors
        }
        sourceFiles {
            ...EmbedShareProjectCover_SourceFile
        }
        name
        url
        covers {
            allAvailable {
                url
                width
                type
            }
            size_original_webp {
                url
                width
                type
            }
        }
        owners {
            url
            ...EmbedShareProjectCover_User
        }
    }
    fragment PaidAndFreeAssetsCountBadge_Embed_SourceFile on SourceFile {
        unitAmount
        tier
        hidden
    }
    fragment ViewServiceInfoModal_User on User {
        id
        displayName
        url
        images {
            size_50 {
                url
            }
        }
        creatorPro {
            isActive
        }
        ...CreatorProBadge_User
    }
    fragment InquireServiceModal_User on User {
        id
        displayName
        images {
            size_50 {
                url
            }
        }
        availabilityInfo {
            hiringTimeline {
                key
            }
        }
    }
    fragment SourceFileRow_SourceFile on SourceFile {
        assetId
        cover {
            coverUrl
        }
        title
        extension
        currency
        unitAmount
        renditionUrl
        hasUserPurchased
        tier
        sourceFileId
        projectId
        mimeType
        category
        licenseType
        size
    }
    fragment PaneHeader_User on User {
        id
        url
        displayName
        images {
            allAvailable {
                width
                url
                type
            }
        }
    }
`;
//#endregion
//#region lib/routes/behance/user.tsx
const route = {
	path: "/:user/:type?",
	categories: ["design"],
	view: 2,
	example: "/behance/mishapetrick",
	parameters: {
		user: "username",
		type: {
			description: "type",
			options: [{
				value: "projects",
				label: "projects"
			}, {
				value: "appreciated",
				label: "appreciated"
			}],
			default: "projects"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Works",
	maintainers: ["MisteryMonster"],
	handler,
	description: `Behance user's profile URL, like <https://www.behance.net/mishapetrick> the username will be \`mishapetrick\`。`
};
const getUserProfile = async (nodes, user) => await cache_default.tryGet(`behance:profile:${user}`, () => {
	const profile = nodes.flatMap((item) => item.owners).find((owner) => owner.username === user);
	return Promise.resolve({
		displayName: profile.displayName,
		id: profile.id,
		link: profile.url,
		image: profile.images.size_50.url.replace("/user/50/", "/user/source/")
	});
});
const renderDescription = (description, modules) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [description?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [description, /* @__PURE__ */ jsx("br", {})] }) : null, modules?.map((module) => {
	if (module.__typename === "ImageModule") return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: module.imageSizes?.allAvailable?.[0]?.url,
		alt: module.altText ?? void 0
	}), module.caption?.length ? /* @__PURE__ */ jsx("figcaption", { children: module.caption }) : null] }), /* @__PURE__ */ jsx("br", {})] });
	if (module.__typename === "TextModule") return /* @__PURE__ */ jsxs(Fragment, { children: [module.text ? raw(module.text) : null, /* @__PURE__ */ jsx("br", {})] });
	if (module.__typename === "MediaCollectionModule") return /* @__PURE__ */ jsxs(Fragment, { children: [module.components?.map((comp) => /* @__PURE__ */ jsx("img", {
		src: `https://mir-s3-cdn-cf.behance.net/project_modules/source/${comp.filename}`,
		alt: ""
	})), /* @__PURE__ */ jsx("br", {})] });
	if (module.__typename === "EmbedModule") {
		const embed = module.fluidEmbed || module.originalEmbed;
		return /* @__PURE__ */ jsxs(Fragment, { children: [embed ? raw(embed) : null, /* @__PURE__ */ jsx("br", {})] });
	}
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		"UNHANDLED MODULE: ",
		module.__typename,
		/* @__PURE__ */ jsx("br", {})
	] });
})] }));
async function handler(ctx) {
	const { user, type = "projects" } = ctx.req.param();
	const uuid = crypto.randomUUID();
	const headers = {
		Cookie: `gk_suid=${Math.random().toString().slice(2, 10)}, gki=; originalReferrer=; bcp=${uuid}`,
		"X-BCP": uuid,
		"X-Requested-With": "XMLHttpRequest"
	};
	const response = await rofetch("https://www.behance.net/v3/graphql", {
		method: "POST",
		headers,
		body: {
			query: type === "projects" ? getProfileProjectsAndSelectionsQuery : getAppreciatedQuery,
			variables: {
				username: user,
				after: ""
			}
		}
	});
	const nodes = type === "projects" ? response.data.user.profileProjects.nodes : response.data.user.appreciatedProjects.nodes;
	const list = nodes.map((item) => ({
		title: item.name,
		link: item.url,
		author: item.owners.map((owner) => owner.displayName).join(", "),
		image: item.covers.size_202.url.replace("/202/", "/source/"),
		pubDate: item.publishedOn ? parseDate(item.publishedOn, "X") : void 0,
		category: item.fields?.map((field) => field.label.toLowerCase()),
		projectId: item.id
	}));
	const profile = await getUserProfile(nodes, user);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const project = (await rofetch("https://www.behance.net/v3/graphql", {
			method: "POST",
			headers,
			body: {
				query: getProjectPageQuery,
				variables: { projectId: item.projectId }
			}
		})).data.project;
		item.description = renderDescription(project.description, project.allModules);
		item.category = [.../* @__PURE__ */ new Set([...item.category || [], ...project.tags?.map((tag) => tag.title.toLowerCase()) || []])];
		item.pubDate ||= project.publishedOn ? parseDate(project.publishedOn, "X") : void 0;
		return item;
	})));
	return {
		title: `${profile.displayName}'s ${type}`,
		link: `https://www.behance.net/${user}/${type}`,
		image: profile.image,
		item: items
	};
}
//#endregion
export { route };
