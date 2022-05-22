import { grass, dirt, wood } from "./images"
import { createOffscreenCanvas } from "./canvas"

const angle = Math.PI * 26 / 180
const cellSize = 100
const w = cellSize * Math.cos(angle)
const h = cellSize * Math.sin(angle)

export class Cell {
  static grassCanvas
  static dirtCanvas
  static woodCanvas

  constructor(i, container) {
    if (!Cell.grassCanvas) {
      Cell.grassCanvas = createOffscreenCanvas(grass, w * 2, h * 2)
      Cell.dirtCanvas = createOffscreenCanvas(dirt, w * 2, h * 2)
      Cell.woodCanvas = createOffscreenCanvas(wood, 80, 100)
    }
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
    this.popup.className = 'grow'
    this.title = document.createElement('div')
    this.title.classList.add('grow-title')
    this.title.innerHTML = `lol`
    let timer = document.createElement('div')
    timer.classList.add('grow-timer')
    this.progress = document.createElement('div')
    this.progress.classList.add('grow-progress')
    this.timeLeft = document.createElement('div')
    this.timeLeft.classList.add('grow-time-left')

    this.popup.appendChild(this.title)
    timer.appendChild(this.progress)
    timer.appendChild(this.timeLeft)
    this.popup.appendChild(timer)

    container.appendChild(this.popup)
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

    if (this.crop == 0) return

    this.title.innerHTML = '🌶️ Перец'

    this.updateTimer()
  }

  update(mousePos) {
    this.selected = this.x == mousePos.x && this.y == mousePos.y
    // this.updateTimer()
  }

  updateTimer() {
    let time = Math.floor((this.endTime - Date.now()) / 1000)
    if (time < 0) {
      if (this.progress.style.width == '100%') return
      this.timeLeft.innerHTML = 'Созрело 👍'
      this.progress.style.width = '100%'
      return
    }
    let seconds = time % 60
    seconds = seconds < 10 ? '0' + seconds : seconds
    let minutes = Math.floor(time / 60 % 60)
    minutes = minutes < 10 ? '0' + minutes : minutes
    let hours = Math.floor(time / 3600 % 24)
    hours = hours < 10 ? '0' + hours : hours
    let days = Math.floor(time / 86400)

    if (days == 0) {
      days = ''
      if (hours == '00') {
        hours = ''
        if (minutes == '00') {
          minutes = ''
        }
      }
    }

    this.timeLeft.innerHTML = `${days ? days + 'д' : ''} ${hours ? hours + 'ч' : ''} ${minutes ? minutes + 'м' : ''} ${seconds}с`
    let percent = Math.floor((Date.now() - this.startTime) / (this.endTime - this.startTime) * 100)
    // console.log(percent)
    this.progress.style.width = `${percent}%`
  }

  draw(ctx, offset, w, h) {
    let x = (this.x - this.y) * w + offset.x
    let y = (this.x + this.y) * h + offset.y

    ctx.drawImage(this.buystate < 2 ? Cell.grassCanvas : Cell.dirtCanvas, x - w, y, w * 2, h * 2)

    if (this.selected) {
      ctx.fillStyle = '#FFFFFF64'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + w, y + h)
      ctx.lineTo(x, y + 2 * h)
      ctx.lineTo(x - w, y + h)
      ctx.fill()

      ctx.fillStyle = '#000000'

      if (this.crop != 0) {
        this.popup.style.opacity = 1
        this.popup.style.top = y - 90 + 'px'
        this.popup.style.left = x - 90 + 'px'
      }
    }
    else {
      this.popup.style.opacity = 0
    }

    if (this.buystate == 1) {
      ctx.drawImage(Cell.woodCanvas, x - 40, y - 50, 80, 100)
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