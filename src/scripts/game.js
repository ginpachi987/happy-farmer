import { bg } from "./images"
import { Cell } from "./cell"
import { Player } from "./player"

const cellsOffset = {
  x: 770,
  y: 470
  // x: 499,
  // y: 601
}

const angle = Math.PI * 26 / 180
const cellSize = 100
const w = Math.ceil(cellSize * Math.cos(angle))
const h = Math.ceil(cellSize * Math.sin(angle))

export class Game {
  constructor() {
    this.width = Math.min(window.innerWidth, 1920)
    this.height = Math.min(window.innerHeight, 1080)
    let popups = document.querySelector('.cells-popups')
    this.objects = [...Array(4 * 7)].map((el, i) => new Cell(i, popups))
    let bgImage = new Image(1920, 1080)
    bgImage.src = bg

    this.bg = document.createElement('canvas')
    this.bg.width = bgImage.width
    this.bg.height = bgImage.height
    this.bg.getContext('2d').drawImage(bgImage, 0, 0)
    this.disp = {
      x: 0,
      y: 0
    }
    this.pos = {
      x: (this.width - this.bg.width) / 2,
      y: (this.height - this.bg.height) / 2
    }
    this.mousePos = {
      x: -1,
      y: -1
    }
    this.interval = setInterval(() => {
      this.objects.forEach(obj => {
        obj.updateTimer()
      })
    }, 1000)
  }

  resize(width, height) {
    this.width = width
    this.height = height
    this.pos.x = (this.width - this.bg.width) / 2
    this.pos.y = (this.height - this.bg.height) / 2
  }

  update(deltaTime) {
    this.objects.forEach(obj => obj.update(this.mousePos))
  }

  draw(ctx) {
    let offset = {
      x: cellsOffset.x + this.pos.x + this.disp.x,
      y: cellsOffset.y + this.pos.y + this.disp.y
    }
    ctx.drawImage(this.bg, this.disp.x + this.pos.x, this.disp.y + this.pos.y)
    this.objects.forEach((obj, i) => obj.draw(ctx, offset, w, h))
  }

  move(x, y) {
    this.disp.x = x
    this.disp.y = y
    // console.log(x)

    if (x > -this.pos.x) {
      this.disp.x = -this.pos.x
    }
    if (y > -this.pos.y) {
      this.disp.y = -this.pos.y
    }
    if (x < -this.pos.x + this.width - this.bg.width) {
      this.disp.x = -this.pos.x + this.width - this.bg.width
    }
    if (y < -this.pos.y + this.height - this.bg.height) {
      this.disp.y = -this.pos.y + this.height - this.bg.height
    }
  }

  setStart() {
    this.pos.x += this.disp.x
    this.pos.y += this.disp.y
    this.disp.x = 0
    this.disp.y = 0
  }

  setCells(cells) {
    this.objects.forEach((obj, i) => obj.set(cells[i]))
  }

  mouseMove(mouseX, mouseY) {
    let i = Math.floor(((mouseY - this.pos.y - this.disp.y - cellsOffset.y) / h + (mouseX - this.pos.x - this.disp.x - cellsOffset.x) / w) / 2)
    let j = Math.floor(((mouseY - this.pos.y - this.disp.y - cellsOffset.y) / h - (mouseX - this.pos.x - this.disp.x - cellsOffset.x) / w) / 2)

    this.mousePos = { x: i, y: j }

    if (this.objects.filter(el => el.selected).length) {
      document.querySelector('body').style.cursor = 'pointer'
    }
    else {
      document.querySelector('body').style.cursor = 'default'
    }
  }

  clicked(socket) {
    this.objects.forEach(obj => {
      obj.isClicked(socket)
    })
  }

  touched(socket) {
    this.objects.forEach(obj => {
      obj.isTouched(socket)
    })
  }

  mouseLeave() {
    this.mousePos = { x: -1, y: -1 }
    document.querySelector('body').style.cursor = 'default'
  }
}