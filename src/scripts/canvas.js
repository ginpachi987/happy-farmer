// const canvas = document.getElementById('canvas')
// const ctx = canvas.getContext('2d')

// const line = (x1, y1, x2, y2) => {
//   ctx.beginPath()
//   ctx.moveTo(x1, y1)
//   ctx.lineTo(x2, y2)
//   ctx.stroke()
//   ctx.closePath()
// }

// export { canvas, line }

export function createOffscreenCanvas(image, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  const img = new Image(width, height)
  img.src = image
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}