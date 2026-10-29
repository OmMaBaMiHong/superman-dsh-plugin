/**
 * 腾讯视频·电视剧热搜榜（getCard 接口 rank_name=HotSearch）。
 * 移植自 newsnow（MIT，Copyright 2024 ourongxing）sources/qqvideo.ts
 */
import type { HotboardReader, ReaderItem } from '../../types.js';
import { fetchJson, text } from '../../http.js';

interface QqVideoCard {
  id?: string;
  params?: {
    title?: string;
    sub_title?: string;
    second_title?: string;
  };
}

interface QqVideoResponse {
  ret?: number;
  data?: {
    card?: {
      children_list?: {
        list?: {
          cards?: QqVideoCard[];
        };
      };
    };
  };
}

const ENDPOINT =
  'https://pbaccess.video.qq.com/trpc.vector_layout.page_view.PageService/getCard?video_appid=3000010&vversion_platform=2';

const REQUEST_BODY = {
  page_params: {
    rank_channel_id: '100113',
    rank_name: 'HotSearch',
    rank_page_size: '30',
    tab_mvl_sub_mod_id: '792ac_19e77Sub_1b2',
    tab_name: '热搜榜',
    tab_type: 'hot_rank',
    tab_vl_data_src: 'f5200deb4596bbf3',
    page_id: 'scms_shake',
    page_type: 'scms_shake',
    source_key: '',
    tag_id: '',
    tag_type: '',
    new_mark_label_enabled: '1',
  },
  page_context: {
    page_index: '1',
  },
  flip_info: {
    page_strategy_id: '',
    page_module_id: '792ac_19e77',
    module_strategy_id: {},
    sub_module_id: '20251106065177',
    flip_params: {
      folding_screen_show_num: '',
      is_mvl: '1',
      mvl_strategy_info:
        '{"default_strategy_id":"06755800b45b49238582a6fa1ad0f5c5","default_version":"3836","hit_page_uuid":"b5080d97dc694a5fb50eb9e7c99326ac","hit_tab_info":null,"gray_status_info":null,"bypass_to_un_exp_id":""}',
      mvl_sub_mod_id: '20251106065177',
      pad_post_show_num: '',
      pad_pro_post_show_num: '',
      pad_pro_small_hor_pic_display_num: '',
      pad_small_hor_pic_display_num: '',
      page_id: 'scms_shake',
      page_num: '0',
      page_type: 'scms_shake',
      post_show_num: '',
      shake_size: '',
      small_hor_pic_display_num: '',
      source_key: '100113',
      un_policy_id: '06755800b45b49238582a6fa1ad0f5c5',
      un_strategy_id: '06755800b45b49238582a6fa1ad0f5c5',
    },
    relace_children_key: [],
  },
};

export const qqvideoHotSearch: HotboardReader = {
  id: 'qqvideo',
  name: '腾讯视频热搜',
  homeUrl: 'https://v.qq.com/',
  category: 'entertainment',
  async read() {
    const json = await fetchJson<QqVideoResponse>(ENDPOINT, {
      method: 'POST',
      headers: {
        referer: 'https://v.qq.com/',
        'content-type': 'application/json',
      },
      body: JSON.stringify(REQUEST_BODY),
    });
    const cards = json.data?.card?.children_list?.list?.cards ?? [];
    return cards
      .map((card): ReaderItem | null => {
        const title = text(card.params?.title);
        if (!title) return null;
        const id = text(card.id);
        return {
          title,
          url: id ? `https://v.qq.com/x/cover/${id}.html` : 'https://v.qq.com/',
          heatLabel: null,
          summary: text(card.params?.second_title) || text(card.params?.sub_title) || null,
        } satisfies ReaderItem;
      })
      .filter((item): item is ReaderItem => item !== null);
  },
};
