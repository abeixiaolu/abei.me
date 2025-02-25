import type { Album } from '../theme/types/album'
import { defineLoader } from 'vitepress'

declare const data: Album[]
export { data }

/**
 * 相册数据加载器
 * 可以在这里从外部API或JSON文件加载数据
 */
export default defineLoader({
  // 缓存配置，确保数据不会在每次页面加载时重新获取
  watch: ['albums'],
  async load() {
    // 这里可以替换为从API或数据库获取数据
    // 例如: const response = await fetch('your-api-endpoint')

    // 示例数据
    const albums: Album[] = [
      {
        id: '1',
        title: '城市街景',
        date: '2023-12-15',
        description: '上海街头的冬日午后',
        cover: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb',
        photos: [
          {
            id: '1-1',
            src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
            alt: '城市夜景',
            description: '霓虹闪烁的都市夜晚',
          },
          {
            id: '1-2',
            src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
            alt: '城市建筑',
            description: '现代建筑群',
          },
          {
            id: '1-3',
            src: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9',
            alt: '城市天际线',
            description: '黄昏下的城市轮廓',
          },
          {
            id: '1-4',
            src: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
            alt: '街道场景',
            description: '繁忙的十字路口',
          },
          {
            id: '1-5',
            src: 'https://images.unsplash.com/photo-1517935706615-2717063c2225',
            alt: '城市地标',
            description: '标志性建筑物',
          },
          {
            id: '1-6',
            src: 'https://images.unsplash.com/photo-1495542779398-9fec7dc7986c',
            alt: '城市交通',
            description: '车流如织',
          },
          {
            id: '1-7',
            src: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb',
            alt: '街头艺术',
            description: '涂鸦墙与行人',
          },
          {
            id: '1-8',
            src: 'https://images.unsplash.com/photo-1506816561089-5cc37b3aa9b0',
            alt: '城市广场',
            description: '人群聚集的广场',
          },
          {
            id: '1-9',
            src: 'https://images.unsplash.com/photo-1498036882173-b41c28a8ba34',
            alt: '商业区',
            description: '繁华的商业街区',
          },
          {
            id: '1-10',
            src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
            alt: '现代建筑',
            description: '玻璃幕墙反射阳光',
          },
        ],
      },
      {
        id: '2',
        title: '自然风光',
        date: '2024-01-20',
        description: '郊外的山水风景',
        cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
        photos: [
          {
            id: '2-1',
            src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
            alt: '山峦',
            description: '晨雾中的群山',
          },
          {
            id: '2-2',
            src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
            alt: '森林',
            description: '阳光穿透林间',
          },
          {
            id: '2-3',
            src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
            alt: '湖泊',
            description: '平静的湖面',
          },
          {
            id: '2-4',
            src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
            alt: '瀑布',
            description: '飞流直下的瀑布',
          },
          {
            id: '2-5',
            src: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07',
            alt: '草原',
            description: '广阔的草原风光',
          },
          {
            id: '2-6',
            src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
            alt: '山谷',
            description: '深邃的峡谷',
          },
          {
            id: '2-7',
            src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
            alt: '河流',
            description: '蜿蜒的河道',
          },
          {
            id: '2-8',
            src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
            alt: '海岸',
            description: '波涛汹涌的海岸线',
          },
          {
            id: '2-9',
            src: 'https://images.unsplash.com/photo-1472396961693-142e6e269027',
            alt: '高山',
            description: '雪山之巅',
          },
          {
            id: '2-10',
            src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
            alt: '山路',
            description: '盘山公路',
          },
        ],
      },
      {
        id: '3',
        title: '人文纪实',
        date: '2024-02-05',
        description: '城市生活的日常片段',
        cover: 'https://images.unsplash.com/photo-1532931899774-fbd4de0008fb',
        photos: [
          {
            id: '3-1',
            src: 'https://images.unsplash.com/photo-1532931899774-fbd4de0008fb',
            alt: '市场',
            description: '热闹的早市',
          },
          {
            id: '3-2',
            src: 'https://images.unsplash.com/photo-1519817650390-64a93db51149',
            alt: '咖啡馆',
            description: '悠闲的下午时光',
          },
          {
            id: '3-3',
            src: 'https://images.unsplash.com/photo-1581985673473-0784a7a44e39',
            alt: '地铁站',
            description: '匆忙的通勤者',
          },
          {
            id: '3-4',
            src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
            alt: '书店',
            description: '安静的阅读角落',
          },
          {
            id: '3-5',
            src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18',
            alt: '餐厅',
            description: '美食时光',
          },
          {
            id: '3-6',
            src: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a',
            alt: '公园',
            description: '休闲的周末',
          },
          {
            id: '3-7',
            src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
            alt: '办公室',
            description: '现代工作场所',
          },
          {
            id: '3-8',
            src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846',
            alt: '艺术展',
            description: '文化展览',
          },
          {
            id: '3-9',
            src: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf',
            alt: '街头音乐',
            description: '艺术表演者',
          },
          {
            id: '3-10',
            src: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17',
            alt: '城市生活',
            description: '都市日常',
          },
        ],
      },
    ]

    return albums
  },
})
