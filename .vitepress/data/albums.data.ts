import type { Album } from '../theme/types/album'
import { defineLoader } from 'vitepress'

declare const data: Album[]
export { data }

/**
 * 相册数据加载器
 * 可以在这里从外部API或JSON文件加载数据
 */
export default defineLoader({
  async load() {
    const albums: Album[] = [
      {
        id: '4',
        title: '城市竖影',
        date: '2024-01-15',
        description: '垂直视角下的城市',
        cover: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722',
        photos: [
          {
            id: '4-1',
            src: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722',
            alt: '摩天大楼',
            description: '直插云霄的现代建筑',
          },
          {
            id: '4-2',
            src: 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5',
            alt: '城市天际线',
            description: '黄昏下的城市轮廓',
          },
          {
            id: '4-3',
            src: 'https://images.unsplash.com/photo-1547499417-61a435d27cb3',
            alt: '城市街道',
            description: '繁忙的城市街道',
          },
        ],
      },
      {
        id: '5',
        title: '自然竖景',
        date: '2024-01-16',
        description: '大自然的垂直视角',
        cover: 'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c',
        photos: [
          {
            id: '5-1',
            src: 'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c',
            alt: '高大的树木',
            description: '参天古树',
          },
          {
            id: '5-2',
            src: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9',
            alt: '瀑布',
            description: '飞流直下的瀑布',
          },
          {
            id: '5-3',
            src: 'https://images.unsplash.com/photo-1465919292275-c60ba49da6ae',
            alt: '峡谷',
            description: '深邃的峡谷',
          },
        ],
      },
      {
        id: '6',
        title: '人文竖像',
        date: '2024-01-17',
        description: '人文风情的竖直记录',
        cover: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b',
        photos: [
          {
            id: '6-1',
            src: 'https://images.unsplash.com/photo-1504703395950-b89145a5425b',
            alt: '古建筑',
            description: '传统建筑的魅力',
          },
          {
            id: '6-2',
            src: 'https://images.unsplash.com/photo-1519475889208-0968e5438f7d',
            alt: '街头艺人',
            description: '城市中的艺术表演',
          },
          {
            id: '6-3',
            src: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d',
            alt: '城市生活',
            description: '垂直空间中的日常',
          },
        ],
      },
      {
        id: '1',
        title: '城市日光',
        date: '2023-12-15',
        description: '清晨的上海街头',
        cover: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
        photos: [
          {
            id: '1-1',
            src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
            alt: '清晨的城市',
            description: '阳光洒在城市的每个角落',
          },
          {
            id: '1-2',
            src: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9',
            alt: '街头的行人',
            description: '匆匆行走的行人',
          },
          {
            id: '1-3',
            src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e',
            alt: '建筑之美',
            description: '现代建筑的艺术',
          },
        ],
      },
      {
        id: '2',
        title: '自然风光',
        date: '2023-12-16',
        description: '大自然的美丽',
        cover: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
        photos: [
          {
            id: '2-1',
            src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
            alt: '宁静的湖泊',
            description: '湖水清澈见底',
          },
          {
            id: '2-2',
            src: 'https://images.unsplash.com/photo-1448375240586-882707db888b',
            alt: '森林的秘密',
            description: '绿树成荫的森林',
          },
          {
            id: '2-3',
            src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
            alt: '巍峨的山峰',
            description: '山峦叠嶂的景色',
          },
        ],
      },
      {
        id: '3',
        title: '人文风情',
        date: '2023-12-17',
        description: '城市中的人文景观',
        cover: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
        photos: [
          {
            id: '3-1',
            src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
            alt: '城市生活',
            description: '多彩的城市生活',
          },
          {
            id: '3-2',
            src: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db',
            alt: '文化活动',
            description: '丰富多彩的文化活动',
          },
          {
            id: '3-3',
            src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
            alt: '节日庆典',
            description: '热闹的节日庆典',
          },
        ],
      },
    ]

    return albums
  },
})
