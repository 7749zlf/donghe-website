export const designCases = [
  {
    id: 101,
    name: 'Crafted Quality Living',
    list: [
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg'
    ]
  },
  {
    id: 102,
    name: 'Office Experience Rebuild',
    list: [
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg'
    ]
  },
  {
    id: 103,
    name: 'Ideal Home Creation',
    list: [
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg'
    ]
  },
  {
    id: 104,
    name: 'Industrial Theme Restaurant',
    list: [
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846231245012992.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
    ]
  },
  {
    id: 105,
    name: 'Japanese Style Apartment',
    list: [
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046846251532861440.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg'
    ]
  },
  {
    id: 106,
    name: 'Loft Co-working Office',
    list: [
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2040007040967471104.jpg',
      'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg'
    ]
  }
]

export function getDesignCaseById(id) {
  return designCases.find((item) => String(item.id) === String(id))
}

export const aboutImage =
  'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2031359355234365440.jpg'

export const awards = [
  { title: '2023年度设计大奖', desc: '中国室内设计协会颁发', year: '2023年12月' },
  { title: '最佳商业空间设计', desc: '亚洲设计奖组委会颁发', year: '2022年9月' },
  { title: '年度优秀设计机构', desc: '国际设计联盟颁发', year: '2021年11月' },
  { title: '居住空间设计金奖', desc: '全国设计大赛组委会颁发', year: '2020年7月' }
]

export const tags = ['全部', '商业空间', '办公空间', '居住空间']

export const projects = [
  {
    id: 101,
    name: '轻奢风商业展厅',
    category: '商业空间',
    type: '商业空间 / 上海',
    year: '2023年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849218981969920.jpg'
  },
  {
    id: 102,
    name: '极简风办公楼',
    category: '办公空间',
    type: '办公空间 / 北京',
    year: '2022年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849235197149184.jpg'
  },
  {
    id: 103,
    name: '北欧风别墅',
    category: '居住空间',
    type: '居住空间 / 深圳',
    year: '2023年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849245921984512.jpg'
  },
  {
    id: 104,
    name: '工业风主题餐厅',
    category: '商业空间',
    type: '商业空间 / 广州',
    year: '2021年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849257572986880.jpg'
  },
  {
    id: 105,
    name: '日式风公寓',
    category: '居住空间',
    type: '居住空间 / 杭州',
    year: '2022年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849270546743296.jpg'
  },
  {
    id: 106,
    name: 'Loft风联合办公',
    category: '办公空间',
    type: '办公空间 / 成都',
    year: '2023年',
    image: 'https://prototype-prod-1254106194.cos.ap-beijing.myqcloud.com/calicat/file/ai/canvas/image/2046849281611317248.jpg'
  }
]
