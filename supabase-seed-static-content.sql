-- Seed the previous local fallback content into Supabase.
-- Run this after supabase-design-cases.sql. It is safe to run more than once.

insert into public.design_cases
  (id, name, category, type, year, url, images, image, note, hidden, created_at)
values
  (
    '101',
    '和锦园',
    '商业空间',
    '商业空间 / 上海',
    '2023年',
    'https://vr.justeasy.cn/view/177046cy3630q394-1776687415.html',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
    '以光影层次重塑动线秩序，强调空间叙事感。',
    false,
    '2026-01-01 00:00:15+00'
  ),
  (
    '102',
    '极简办公总部',
    '办公空间',
    '平层 / 北京',
    '2022年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg',
    '通过材质碰撞塑造理性与温度并存的场域。',
    false,
    '2026-01-01 00:00:14+00'
  ),
  (
    '103',
    '北欧住宅样板间',
    '居住空间',
    '别墅 / 深圳',
    '2023年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
    '在比例与留白中，营造可呼吸的生活美学。',
    false,
    '2026-01-01 00:00:13+00'
  ),
  (
    '104',
    '中庭艺术展馆',
    '商业空间',
    '商业空间 / 苏州',
    '2024年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
    '将结构力量与细节工艺融合为沉浸式体验。',
    false,
    '2026-01-01 00:00:12+00'
  ),
  (
    '105',
    '工业风餐饮空间',
    '商业空间',
    '商业空间 / 广州',
    '2021年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg',
    '借自然肌理与柔和色阶构成安静的情绪场。',
    false,
    '2026-01-01 00:00:11+00'
  ),
  (
    '106',
    '日式静谧公寓',
    '居住空间',
    '别墅 / 杭州',
    '2022年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg',
    '让开放协作与独立专注在同一空间达成平衡。',
    false,
    '2026-01-01 00:00:10+00'
  ),
  (
    '107',
    'Loft联合办公中心',
    '办公空间',
    '平层 / 成都',
    '2023年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg',
    '以光影层次重塑动线秩序，强调空间叙事感。',
    false,
    '2026-01-01 00:00:09+00'
  ),
  (
    '108',
    '山景度假酒店大堂',
    '商业空间',
    '商业空间 / 丽江',
    '2024年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
    '通过材质碰撞塑造理性与温度并存的场域。',
    false,
    '2026-01-01 00:00:08+00'
  ),
  (
    '109',
    '书香住宅空间',
    '居住空间',
    '别墅 / 南京',
    '2025年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
    '在比例与留白中，营造可呼吸的生活美学。',
    false,
    '2026-01-01 00:00:07+00'
  ),
  (
    '110',
    '海岸咖啡馆室内',
    '商业空间',
    '商业空间 / 厦门',
    '2025年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg',
    '将结构力量与细节工艺融合为沉浸式体验。',
    false,
    '2026-01-01 00:00:06+00'
  ),
  (
    '111',
    '科技企业会客厅',
    '办公空间',
    '平层 / 深圳',
    '2025年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg',
    '借自然肌理与柔和色阶构成安静的情绪场。',
    false,
    '2026-01-01 00:00:05+00'
  ),
  (
    '112',
    '光影美术馆',
    '商业空间',
    '商业空间 / 北京',
    '2026年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
    '让开放协作与独立专注在同一空间达成平衡。',
    false,
    '2026-01-01 00:00:04+00'
  ),
  (
    '113',
    '私享温泉会所',
    '居住空间',
    '别墅 / 大理',
    '2024年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
    '以光影层次重塑动线秩序，强调空间叙事感。',
    false,
    '2026-01-01 00:00:03+00'
  ),
  (
    '114',
    '城市天际公寓',
    '居住空间',
    '别墅 / 上海',
    '2026年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
    '通过材质碰撞塑造理性与温度并存的场域。',
    false,
    '2026-01-01 00:00:02+00'
  ),
  (
    '115',
    '私宴餐叙会馆',
    '商业空间',
    '商业空间 / 成都',
    '2026年',
    'https://www.baidu.com',
    array[
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
    ],
    'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg',
    '在比例与留白中，营造可呼吸的生活美学。',
    false,
    '2026-01-01 00:00:01+00'
  )
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  type = excluded.type,
  year = excluded.year,
  url = excluded.url,
  images = excluded.images,
  image = excluded.image,
  note = excluded.note,
  hidden = excluded.hidden,
  created_at = excluded.created_at;

insert into public.design_awards
  (id, title, "desc", year, image, image_alt, hidden, created_at)
values
  (
    'annual-design-award-2023',
    '2023 Annual Design Award',
    'Presented by Interior Design Association',
    'Dec 2023',
    'https://raw.githubusercontent.com/7749zlf/donghe-website/master/src/assets/awards/award-certificate-trophy.jpg',
    '年度设计奖证书与奖杯',
    false,
    '2026-01-02 00:00:04+00'
  ),
  (
    'best-commercial-space-2022',
    'Best Commercial Space',
    'Presented by Asia Design Awards',
    'Sep 2022',
    'https://raw.githubusercontent.com/7749zlf/donghe-website/master/src/assets/awards/award-commercial-certificate.jpg',
    '商业空间设计奖证书',
    false,
    '2026-01-02 00:00:03+00'
  ),
  (
    'top-design-studio-2021',
    'Top Design Studio',
    'Presented by International Design Alliance',
    'Nov 2021',
    'https://raw.githubusercontent.com/7749zlf/donghe-website/master/src/assets/awards/award-architecture-trophy.jpg',
    '建筑空间设计奖杯',
    false,
    '2026-01-02 00:00:02+00'
  ),
  (
    'residential-gold-award-2020',
    'Residential Gold Award',
    'Presented by National Design Competition',
    'Jul 2020',
    'https://raw.githubusercontent.com/7749zlf/donghe-website/master/src/assets/awards/award-residential-medal.jpg',
    '住宅设计金奖奖章',
    false,
    '2026-01-02 00:00:01+00'
  )
on conflict (id) do update
set
  title = excluded.title,
  "desc" = excluded."desc",
  year = excluded.year,
  image = excluded.image,
  image_alt = excluded.image_alt,
  hidden = excluded.hidden,
  created_at = excluded.created_at;
