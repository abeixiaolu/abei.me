<script setup lang="ts">
import { useMousePressed } from '@vueuse/core'
import { onMounted, onUnmounted, ref } from 'vue'

interface Card {
  id: number
  title: string
  description: string
  actionText: string
  imageUrl: string
  backgroundColor: string
  shadowColor: string
  x: number
  y: number
  rotation: number
  zIndex: number
  isDragging: boolean
  originalX: number
  originalY: number
}

// 生成随机颜色（柔和的颜色）
function generatePastelColor() {
  const hue = Math.floor(Math.random() * 360)
  const saturation = 25 + Math.floor(Math.random() * 30) // 25-55%
  const lightness = 75 + Math.floor(Math.random() * 15) // 75-90%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// 生成阴影颜色（与背景色相似但更深）
function generateShadowColor(backgroundColor: string) {
  const matches = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (matches && matches.length === 4) {
    const hue = Number.parseInt(matches[1])
    const saturation = Number.parseInt(matches[2])
    const lightness = Math.max(Number.parseInt(matches[3]) - 30, 10) // 降低亮度，但不低于10%
    return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`
  }
  return 'rgba(0, 0, 0, 0.3)'
}

// 卡片数据
const cardData = [
  {
    title: 'MAGNA',
    description: 'An undiscovered coastal jewel on the Gulf of Aqaba near the Red Sea. Magna will be a place like nothing on earth.',
    actionText: 'Invest in Future',
    imageUrl: 'https://picsum.photos/1920/1080',
  },
  {
    title: 'NEOM',
    description: 'A vision of what a new future might look like. A region in northwest Saudi Arabia being built from the ground up.',
    actionText: 'Explore Vision',
    imageUrl: 'https://picsum.photos/1920/1080',
  },
  {
    title: 'THE LINE',
    description: 'A revolution in urban living. A city that delivers new wonders for the world and a model for sustainable living.',
    actionText: 'Discover Future',
    imageUrl: 'https://picsum.photos/1920/1080',
  },
  {
    title: 'TROJENA',
    description: 'A mountain destination like no other. Experience year-round outdoor skiing and adventure sports.',
    actionText: 'Plan Adventure',
    imageUrl: 'https://picsum.photos/1920/1080',
  },
  {
    title: 'OXAGON',
    description: 'The world\'s largest floating industrial complex. A reimagined manufacturing and innovation hub.',
    actionText: 'See Innovation',
    imageUrl: 'https://picsum.photos/1920/1080',
  },
]

// 容器引用
const containerRef = ref<HTMLElement | null>(null)

// 卡片状态
const cards = ref<Card[]>([])

// 当前拖动的卡片索引
const currentDragIndex = ref<number | null>(null)

// 鼠标状态
const { pressed } = useMousePressed()

// 初始化卡片
function initializeCards() {
  cards.value = []

  for (let i = 0; i < cardData.length; i++) {
    const backgroundColor = generatePastelColor()
    const shadowColor = generateShadowColor(backgroundColor)

    cards.value.push({
      id: i,
      ...cardData[i % cardData.length],
      backgroundColor,
      shadowColor,
      x: 0,
      y: 0,
      rotation: (Math.random() * 6) - 3, // -3 到 3 度的随机旋转
      zIndex: i,
      isDragging: false,
      originalX: 0,
      originalY: 0,
    })
  }
}

// 开始拖动
function startDrag(event: MouseEvent | TouchEvent, index: number) {
  event.preventDefault()

  // 更新所有卡片的 zIndex
  cards.value.forEach((card, i) => {
    card.zIndex = i
  })

  // 设置当前卡片为最高层级
  cards.value[index].zIndex = cards.value.length
  cards.value[index].isDragging = true
  currentDragIndex.value = index

  // 记录初始位置
  cards.value[index].originalX = cards.value[index].x
  cards.value[index].originalY = cards.value[index].y

  // 添加事件监听器
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchend', stopDrag)
}

// 拖动中
function onDrag(event: MouseEvent | TouchEvent) {
  if (currentDragIndex.value === null || !pressed.value)
    return

  let clientX: number, clientY: number

  if ('touches' in event) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }
  else {
    clientX = event.clientX
    clientY = event.clientY
  }

  // 获取容器位置
  if (!containerRef.value)
    return
  const rect = containerRef.value.getBoundingClientRect()

  // 计算相对于容器的位置
  const x = clientX - rect.left
  const y = clientY - rect.top

  // 更新卡片位置
  const card = cards.value[currentDragIndex.value]
  card.x = x - rect.width / 2
  card.y = y - rect.height / 2

  // 计算拖动距离
  const distance = Math.sqrt(
    (card.x - card.originalX) ** 2
    + (card.y - card.originalY) ** 2,
  )

  // 如果拖动距离超过阈值，准备移除卡片
  if (distance > rect.width * 0.4) {
    stopDrag()
    removeCard(currentDragIndex.value)
  }
}

// 停止拖动
function stopDrag() {
  if (currentDragIndex.value !== null) {
    // 如果没有被移除，则恢复原位
    if (cards.value[currentDragIndex.value]) {
      cards.value[currentDragIndex.value].isDragging = false

      // 缓慢恢复原位
      const card = cards.value[currentDragIndex.value]
      const targetX = 0
      const targetY = 0

      const animate = () => {
        if (!card)
          return

        card.x = card.x * 0.8 + targetX * 0.2
        card.y = card.y * 0.8 + targetY * 0.2

        if (Math.abs(card.x - targetX) > 0.5 || Math.abs(card.y - targetY) > 0.5) {
          requestAnimationFrame(animate)
        }
        else {
          card.x = targetX
          card.y = targetY
        }
      }

      animate()
    }

    currentDragIndex.value = null
  }

  // 移除事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
}

// 移除卡片并添加新卡片
function removeCard(index: number) {
  // 移除卡片
  cards.value.splice(index, 1)

  // 添加新卡片
  const backgroundColor = generatePastelColor()
  const shadowColor = generateShadowColor(backgroundColor)

  cards.value.push({
    id: Date.now(), // 使用时间戳作为唯一ID
    ...cardData[Math.floor(Math.random() * cardData.length)],
    backgroundColor,
    shadowColor,
    x: 0,
    y: 0,
    rotation: (Math.random() * 6) - 3, // -3 到 3 度的随机旋转
    zIndex: 0,
    isDragging: false,
    originalX: 0,
    originalY: 0,
  })

  // 重新排列卡片层级
  cards.value.forEach((card, i) => {
    card.zIndex = i
  })
}

// 生命周期钩子
onMounted(() => {
  initializeCards()
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<template>
  <div ref="containerRef" class="draggable-cards-container">
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      class="card"
      :class="{ dragging: card.isDragging }"
      :style="{
        transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation}deg)`,
        zIndex: card.zIndex,
        backgroundColor: card.backgroundColor,
        boxShadow: `0 10px 30px -5px ${card.shadowColor}`,
      }"
      @mousedown="startDrag($event, index)"
      @touchstart="startDrag($event, index)"
    >
      <div class="card-content">
        <div class="card-header">
          <div class="card-title">
            {{ card.title }}
          </div>
          <div class="card-icon">
            <div class="arrow-icon">
              ↗
            </div>
          </div>
        </div>
        <div class="card-image">
          <img :src="card.imageUrl" alt="Card Image">
        </div>
        <div class="card-footer">
          <div class="card-description">
            {{ card.description }}
          </div>
          <div class="card-action">
            <button class="action-button">
              $ {{ card.actionText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.draggable-cards-container {
  position: relative;
  width: 100%;
  height: 420px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  perspective: 1000px;
  user-select: none;
}

.card {
  position: absolute;
  width: 280px;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  cursor: grab;
  transition: transform 0.1s ease-out, box-shadow 0.3s ease;
  will-change: transform;
  background-color: #1a1a1a;
  color: white;
}

.card.dragging {
  cursor: grabbing;
  transition: none;
  box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5) !important;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 1px;
}

.card-icon {
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.arrow-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.card-image {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 15px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card:hover .card-image img {
  transform: scale(1.05);
}

.card-footer {
  margin-top: auto;
}

.card-description {
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  max-height: 80px;
  overflow: hidden;
}

.card-action {
  display: flex;
  justify-content: center;
}

.action-button {
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.action-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

/* 添加卡片堆叠效果 */
.card:nth-child(1) { transform: translateY(0) rotate(0deg); }
.card:nth-child(2) { transform: translateY(5px) rotate(1deg); }
.card:nth-child(3) { transform: translateY(10px) rotate(-1deg); }
.card:nth-child(4) { transform: translateY(15px) rotate(2deg); }
.card:nth-child(5) { transform: translateY(20px) rotate(-2deg); }
</style>
