import { grass, dirt, wood } from "./images"

const grassImage = new Image()
grassImage.src = grass
const dirtImage = new Image()
dirtImage.src = dirt
const woodImage = new Image()
woodImage.src = wood

export class Cell {
  constructor(i, container) {
    this.id = i
    this.crop = 0
    this.x = Math.floor(i / 4)
    this.y = i % 4
    this.startTime = 0
    this.endTime = 0
    // this.state = 0
    this.cost = 2
    this.buystate = 0
    this.selected = false

    this.popup = document.createElement('div')
    this.popup.className = 'cell-popup'
    this.popup.innerHTML = `lol`

    container.appendChild(this.popup)
    // <div class="grow">
    //   <div class="grow-title"></div>
    //   <div class="grow-timer">
    //     <div class="grow-progress"></div>
    //     <div class="grow-time-left"></div>
    //   </div>
    // </div>
  }

  set(cell) {
    this.crop = parseInt(cell.crop)
    this.id = parseInt(cell.id)
    // this.x = parseInt(cell.x)
    // this.y = parseInt(cell.y)
    this.startTime = Date.parse(cell.starttime)
    this.endTime = Date.parse(cell.endtime)
    // this.state = parseInt(cell.state)
    this.cost = 10 * (parseInt(cell.id) * 1.2)
    this.buystate = parseInt(cell.buystate)
  }

  update(mousePos) {
    this.selected = this.x == mousePos.x && this.y == mousePos.y
  }

  draw(ctx, offset, w, h) {
    let x = (this.x - this.y) * w + offset.x
    let y = (this.x + this.y) * h + offset.y

    ctx.drawImage(this.buystate < 2 ? grassImage : dirtImage, x - w, y, w * 2, h * 2)

    if (this.selected) {
      ctx.fillStyle = '#FFFFFF64'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + w, y + h)
      ctx.lineTo(x, y + 2 * h)
      ctx.lineTo(x - w, y + h)
      ctx.fill()

      ctx.fillStyle = '#000000'

      this.popup.style.opacity = 1
      this.popup.style.top = y - 100 + 'px'
      this.popup.style.left = x + 'px'
    }
    else {
      this.popup.style.opacity = 0
    }

    if (this.buystate == 1) {
      ctx.drawImage(woodImage, x - 40, y - 50, 80, 100)
      return
    }
    if (this.buystate == 2 && this.crop !== 0) {
      ctx.textAlign = 'center'
      let timeleft = Date.now() - this.endTime
      let size = timeleft < 0 ? Math.floor((Date.now() - this.startTime) / (this.endTime - this.startTime) * 24) : 24

      ctx.font = `${24 + size}px sans-serif`
      ctx.fillText('🌱', x, y + h)

      if (this.endTime - Date.now() <= 0) {
        ctx.font = '30px sans-serif'
        ctx.fillText('🌶️', x - w / 4, y + h * 2 / 3)
      }
    }
  }

  isClicked(socket) {
    if (this.buystate == 0
      || !this.selected)
      return
    if (this.buystate == 1) {
      console.log('Купить')
      return
    }
    if (this.crop == 0) {
      socket.emit('plant', this.id)
      return
    }
    let date = new Date()
    if (date.getTime() < this.endTime) {
      console.log('Растёт')
      return
    }
    socket.emit('harvest', this.id)
  }

  isTouched(socket) {
    if (this.buystate == 0
      || !this.selected)
      return
    if (this.buystate == 1) {
      console.log('Купить')
      return
    }
    if (this.crop == 0) {
      socket.emit('plant', this.id)
      return
    }
    let date = new Date()
    if (date.getTime() < this.endTime) {
      console.log('Растёт')
      return
    }
    socket.emit('harvest', this.id)
  }
}