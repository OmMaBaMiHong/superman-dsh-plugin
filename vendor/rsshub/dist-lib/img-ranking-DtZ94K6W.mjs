import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as post2item } from "./utils-V7T3WS8w.mjs";
//#region lib/routes/mihoyo/bbs/static-data.ts
const DATA_MAP = {
	bh2: {
		title: "崩坏学园2",
		gids: 3,
		default_forum: "tongren",
		default_ranking_type: "weekly",
		forums: { tongren: {
			title: "同人",
			forum_id: 40
		} }
	},
	bh3: {
		title: "崩坏3",
		gids: 1,
		default_forum: "tongren",
		forums: { tongren: {
			title: "同人",
			forum_id: 4,
			default_cate: "illustration",
			cates: {
				comic: {
					title: "漫画",
					cate_id: 3
				},
				illustration: {
					title: "插画",
					cate_id: 4
				},
				cos: {
					title: "COS",
					cate_id: 17
				}
			}
		} }
	},
	ys: {
		title: "原神",
		gids: 2,
		default_forum: "tongren",
		forums: {
			tongren: {
				title: "同人",
				forum_id: 29,
				default_cate: "illustration",
				cates: {
					manual: {
						title: "手工",
						cate_id: 1
					},
					qute: {
						title: "Q版",
						cate_id: 2
					},
					comic: {
						title: "漫画",
						cate_id: 3
					},
					illustration: {
						title: "插画",
						cate_id: 4
					}
				}
			},
			cos: {
				title: "COS",
				forum_id: 49
			}
		}
	},
	wd: {
		title: "未定事件簿",
		gids: 4,
		default_forum: "tongren",
		forums: { tongren: {
			title: "同人",
			forum_id: 38
		} }
	},
	sr: {
		title: "崩坏：星穹铁道",
		gids: 6,
		default_forum: "tongren",
		forums: { tongren: {
			title: "同人",
			forum_id: 56
		} }
	},
	zzz: {
		title: "绝区零",
		gids: 8,
		default_forum: "tongren",
		forums: { tongren: {
			title: "同人",
			forum_id: 59
		} }
	},
	dby: {
		title: "大别野",
		gids: 5,
		default_forum: "tongren",
		forums: {
			tongren: {
				title: "同人",
				forum_id: 39
			},
			cos: {
				title: "COS",
				forum_id: 47
			}
		}
	}
};
const RANKING_TYPE_MAP = {
	daily: {
		id: 1,
		title: "日榜"
	},
	weekly: {
		id: 2,
		title: "周榜"
	},
	monthly: {
		id: 3,
		title: "月榜"
	}
};
//#endregion
//#region lib/routes/mihoyo/bbs/img-ranking.ts
const getGameInfo = (game) => ({
	gids: DATA_MAP[game]?.gids,
	title: DATA_MAP[game]?.title
});
const getForumInfo = (game, forum_type) => {
	forum_type ||= DATA_MAP[game]?.default_forum || "tongren";
	const forum = DATA_MAP[game]?.forums?.[forum_type];
	return {
		forum_id: forum?.forum_id,
		title: `${forum?.title}榜`
	};
};
const getCateInfo = (game, forum_type, cate_type) => {
	forum_type ||= DATA_MAP[game]?.default_forum || "tongren";
	const forum = DATA_MAP[game]?.forums?.[forum_type];
	const default_cate = forum?.default_cate;
	if (!default_cate) return {
		title: "",
		cate_id: "0"
	};
	cate_type ||= default_cate;
	return {
		title: `${forum?.cates?.[cate_type]?.title}榜`,
		cate_id: forum?.cates?.[cate_type]?.cate_id
	};
};
const getRankingTypeInfo = (game, ranking_type) => {
	ranking_type ||= DATA_MAP[game]?.default_ranking_type || "daily";
	return {
		id: RANKING_TYPE_MAP[ranking_type]?.id,
		title: RANKING_TYPE_MAP[ranking_type]?.title
	};
};
const route = {
	path: "/bbs/img-ranking/:game/:routeParams?",
	categories: ["game"],
	example: "/mihoyo/bbs/img-ranking/ys/forumType=tongren&cateType=illustration&rankingType=daily",
	parameters: {
		game: "游戏缩写",
		routeParams: "额外参数；请参阅以下说明和表格"
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
		source: ["miyoushe.com/:game/imgRanking/:forum_id/:ranking_id/:cate_id"],
		target: "/bbs/img-ranking/:game"
	}],
	name: "米游社 - 同人榜",
	maintainers: ["CaoMeiYouRen"],
	handler,
	description: `| 键          | 含义                                  | 接受的值                                                             | 默认值       |
| ----------- | ------------------------------------- | -------------------------------------------------------------------- | ------------ |
| forumType   | 主榜类型（仅原神、大别野有 cos 主榜） | tongren/cos                                                          | tongren      |
| cateType    | 子榜类型（仅崩坏三、原神有子榜）      | 崩坏三：illustration/comic/cos；原神：illustration/comic/qute/manual | illustration |
| rankingType | 排行榜类型（崩坏二没有日榜）          | daily/weekly/monthly                                                 | daily        |
| lastId      | 当前页 id（用于分页）                 | 数字                                                                 | 1            |

游戏缩写

| 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 大别野 | 绝区零 |
| ------ | ---- | ------ | ---------- | -------- | ------ | ------ |
| bh3    | ys   | bh2    | wd         | sr       | dby    | zzz    |

主榜类型

| 同人榜  | COS 榜 |
| ------- | ------ |
| tongren | cos    |

子榜类型

崩坏三 子榜

| 插画         | 漫画  | COS |
| ------------ | ----- | --- |
| illustration | comic | cos |

原神 子榜

| 插画         | 漫画  | Q 版 | 手工   |
| ------------ | ----- | ---- | ------ |
| illustration | comic | qute | manual |

排行榜类型

| 日榜  | 周榜   | 月榜    |
| ----- | ------ | ------- |
| daily | weekly | monthly |`
};
async function handler(ctx) {
	const game = ctx.req.param("game");
	const { forumType: forum_type = "tongren", cateType: cate_type, rankingType: ranking_type, lastId: last_id = "" } = Object.fromEntries(new URLSearchParams(ctx.req.param("routeParams")));
	const page_size = ctx.req.query("limit") || "20";
	const { gids, title: game_title } = getGameInfo(game);
	if (!gids) throw new Error("未知的游戏！");
	const { forum_id, title: forum_title } = getForumInfo(game, forum_type);
	if (!forum_id) throw new Error(`${game_title} 的排行榜不存在！`);
	const { cate_id, title: cate_title } = getCateInfo(game, forum_type, cate_type);
	const { id: type, title: type_title } = getRankingTypeInfo(game, ranking_type);
	const url = `https://bbs-api.miyoushe.com/post/wapi/getImagePostList?${new URLSearchParams({
		gids,
		forum_id,
		cate_id,
		type,
		page_size,
		last_id
	}).toString()}`;
	const list = (await got_default({
		method: "get",
		url
	}))?.data?.data?.list;
	if (!list) throw new Error("未获取到数据！");
	return {
		title: `米游社-${game_title}-${forum_title}${cate_title ? `-${cate_title}` : ""}-${type_title}`,
		link: url,
		item: list.map((e) => post2item(e))
	};
}
//#endregion
export { route };
