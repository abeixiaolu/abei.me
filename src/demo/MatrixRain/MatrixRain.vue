<script setup lang="ts">
const canvasRef = shallowRef<HTMLCanvasElement>()

function createMatrix() {
  if (!canvasRef.value)
    return
  const canvas = canvasRef.value
  canvas.height = 300

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+{}|:"<>?~`-=[];\',./\\ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸ'
  const fontSize = 10
  const columns = Math.floor(canvas.width / fontSize)
  const drops: { y: number, speed: number }[] = []
  // 初始化雨滴位置
  for (let i = 0; i < columns; i++) {
    drops[i] = {
      y: Math.random() * -canvas.height, // 随机起始位置
      speed: 2 + Math.random() * 7, // 随机下落速度
    }
  }

  const ctx = canvas.getContext('2d')
  if (ctx == null)
    return

  const customText = {
    content: 'HELLO WORLD', // 可修改为任意文字
    fontSize: 20, // 文字大小
    color: 'rgba(0, 255, 0)', // 文字颜色
    interval: 2000, // 闪烁间隔（毫秒）
  }

  // 文字居中绘制函数
  function drawCenteredText() {
    if (ctx == null)
      return
    ctx.font = `${customText.fontSize}px monospace`
    ctx.textAlign = 'center' // 水平居中
    ctx.textBaseline = 'middle' // 垂直居中
    ctx.fillStyle = customText.color

    // 自动计算居中位置
    const x = canvas.width / 2
    const y = canvas.height / 2
    ctx.fillText(customText.content, x, y)
  }

  function draw() {
    if (ctx == null)
      return
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `${fontSize}px monospace`
    ctx.fillStyle = '#0F0'

    drops.forEach((drop, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const x = i * fontSize
      ctx.fillText(char, x, drop.y)
      if (drop.y > canvas.height) {
        drop.y = Math.random() * -canvas.height
        drop.speed = 2 + Math.random() * 5
      }
      drop.y += drop.speed

      if (drop.y < 50) {
        ctx.fillStyle = `rgba(0, 0, 0, ${drop.y / 50})`
      }
      else {
        ctx.fillStyle = '#0F0'
      }
    })
    requestAnimationFrame(draw)
  }

  draw()

  // 独立文字闪烁计时器
  setInterval(() => {
    // 使用临时画布状态保存
    ctx.save() // 保存当前画布状态
    drawCenteredText()
    ctx.restore() // 恢复原始画布状态
  }, customText.interval)
}

onMounted(createMatrix)
</script>

<template>
  <canvas ref="canvasRef" class="size-full block" />
</template>
