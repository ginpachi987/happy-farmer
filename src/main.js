/// <reference types='../node_modules/@types/p5/global' />

import './style.scss'
import * as p5 from '../node_modules/p5/lib/p5'
import { Coords, Field, Server } from './classes'

import grass from './img/grass.svg'
import dirt from './img/dirt.svg'
import wood from './img/wood-2.svg'

let cols = 4
let rows = 8

let p = window

let disp = new Coords(0, 0)
let mouseStart = new Coords(0, 0)
let current

let screen

let cellSize = 100

let balance = 4

// let sizeSlider
// let dispX, dispY

let mouseOver = true
let pressed = false

let selected = new Coords(-1, -1)

let w, h

let angle = 33

let field
let img = {}

let showBuy = false
let cellForBuy
let $buy = {}

let server

let growInterval
let $grow = {}
let growShow = false

p.preload = () => {
  img.grass = loadImage(grass)
  img.buy = loadImage(wood)
  img.dirt = loadImage(dirt)
}

p.setup = () => {
  screen = {
    width: p.windowWidth,
    height: p.windowHeight
  }
  let canvas = createCanvas(p.windowWidth, p.windowHeight)
  canvas.parent('game')

  canvas.mousePressed(mousePressed)

  let game = document.querySelector('#game')
  game.addEventListener('mouseenter', () => {
    mouseOver = true
  })
  game.addEventListener('mouseleave', () => {
    mouseOver = false
  })
  current = new Coords(p.windowWidth / 2, p.windowHeight / 3)

  field = new Field(cols, rows)
  server = new Server('https://games.yoro.dev/farmer/api/', field)

  server.requestStats()

  // sizeSlider = createSlider(1, 100, 10, 1)
  // sizeSlider.position(10, 10)
  // dispX = createSlider(25, 60, 33, 1)
  // dispX.position(10, 40)
  // dispY = createSlider(0, cellSize * 2, cellSize, 1)
  // dispY.position(10, 70)

  angleMode(DEGREES)
  imageMode(CENTER)
  // noLoop()

  h = cellSize * sin(angle)
  w = cellSize * cos(angle)

  textAlign(CENTER)

  // Buy Div control
  $buy.div = document.querySelector('.buy')
  $buy.yes = document.querySelector('#buy-yes')
  $buy.yes.addEventListener('click', () => {
    server.buy(cellForBuy.id)
    // cellForBuy.state = 1
    // cellForBuy.buyable = false
    // server.user.balance -= cellForBuy.cost
    displayBuy(false)
    // console.log(server.user.balance)
  })
  $buy.no = document.querySelector('#buy-no')
  $buy.no.addEventListener('click', () => {
    displayBuy(false)
  })

  // Grow
  $grow.div = document.querySelector('.grow')
  $grow.timer = document.querySelector('.grow-time-left')
  $grow.progress = document.querySelector('.grow-progress')
  growInterval = setInterval(() => {
    if (true) {
      let x = 0
      let y = 0

      let cell = field.cells[x][y]
      let time = Math.floor((cell.endTime - Date.now()) / 1000)
      // console.log(time)
      let seconds = time % 60
      seconds = seconds < 10 ? '0' + seconds : seconds
      let minutes = Math.floor(time / 60 % 60)
      minutes = minutes < 10 ? '0' + minutes : minutes
      let hours = Math.floor(time / 3600 % 24)
      hours = hours < 10 ? '0' + hours : hours
      let days = Math.floor(time / 86400)

      $grow.timer.innerHTML = `${days ? days + 'д' : ''} ${hours}ч ${minutes}м ${seconds}с`
      let percent = Math.floor((Date.now() - cell.startTime) / (cell.endTime - cell.startTime) * 100)
      // console.log(percent)
      $grow.progress.style.width = `${percent}%`
    }
  }, 1000)
}

p.draw = () => {
  // console.log(dispX.value()/cellSize, dispY.value()/cellSize)
  background('#7ba149')
  noFill()
  stroke(255)

  // angle = dispX.value()

  if (pressed) {
    disp.x = -mouseStart.x + mouseX
    disp.y = -mouseStart.y + mouseY
  }
  translate(current.x + disp.x, current.y + disp.y)

  if (selected.x >= 0 && selected.x < rows && selected.y >= 0 && selected.y < cols) {
    document.querySelector('body').style.cursor = 'pointer'
    growShow = true
  }
  else {
    document.querySelector('body').style.cursor = 'default'
    growShow = false
  }

  for (let j = 0; j < cols; j++) {
    push()
    for (let i = 0; i < rows; i++) {
      let sprite

      switch (field.cells[j][i].buystate) {
        case 0:
        case 1:
          sprite = img.grass
          break;
        case 2:
          sprite = img.dirt
          break;
      }

      image(sprite, 0, h, 2 * w, 2 * h)

      // beginShape()
      // vertex(0, 0)
      // vertex(w, h)
      // vertex(0, 2 * h)
      // vertex(-w, h)
      // endShape(CLOSE)

      if (i === selected.x && j === selected.y) {
        fill('#FFFFFF66')
        noStroke()
        beginShape()
        vertex(0, 0)
        vertex(w, h)
        vertex(0, 2 * h)
        vertex(-w, h)
        // vertex(0, h)
        // vertex(w, 0)
        // vertex(0, -h)
        // vertex(-w, 0)
        endShape(CLOSE)
      }
      if (field.cells[j][i].buystate === 1) {
        image(img.buy, 0, h / 3, 80, 100)
      }
      noFill()
      // text(`${i}, ${j}`, 0, h)
      translate(w, h)
    }
    pop()
    translate(-w, h)
  }

  getMouseCoords()
}

p.mousePressed = () => {
  if (!mouseOver) return
  pressed = true
  mouseStart = { x: mouseX, y: mouseY }
}

p.mouseClicked = () => {
  if (!mouseOver) return
  if (mouseX !== mouseStart.x || mouseY !== mouseStart.y || selected.x < 0 || selected.x >= rows || selected.y < 0 || selected.y >= cols) {
    displayBuy(false)
    return
  }

  if (field.cells[selected.y][selected.x].buystate == 1) {
    cellForBuy = field.cells[selected.y][selected.x]
    displayBuy()
    // field.cells[selected.y][selected.x].state = 1
    // field.cells[selected.y][selected.x].buyable = false

    // let [x,y] = [selected.x, selected.y]

    // if (selected.y + 1 >= cols) {
    //   x++
    //   y = 0
    // }
    // else {
    //   y++
    // }

    // field.cells[y][x].buyable = true
  }
}

p.mouseReleased = () => {
  if (!pressed) return
  pressed = false
  current.add(disp)
  disp.reset()

  // displayBuy(false)
}

p.mouseWheel = (event) => {
  // if (event.delta > 0 && cellSize <= 100) {
  //   cellSize += 1
  // }
  // else if (cellSize >= 20) {
  //   cellSize -= 1
  // }
  // [h, w] = [cellSize * sin(angle), cellSize * cos(angle)]
}

p.windowResized = () => {
  resizeCanvas(p.windowWidth, p.windowHeight)
  let w = current.x / screen.width
  let h = current.y / screen.height
  screen = {
    width: p.windowWidth,
    height: p.windowHeight
  }
  current = new Coords(p.windowWidth * w, p.windowHeight * h)
}

function getMouseCoords() {
  // if (mousePressed()) return
  // LocalX = ((GlobalY - IsoY) / IsoH + (GlobalX - IsoX) / IsoW) / 2;
  // LocalY = ((GlobalY - IsoY) / IsoH - (GlobalX - IsoX) / IsoW) / 2;

  let x = Math.floor(((mouseY - current.y - disp.y) / h + (mouseX - current.x - disp.x) / w) / 2)
  let y = Math.floor(((mouseY - current.y - disp.y) / h - (mouseX - current.x - disp.x) / w) / 2)

  selected = { x: x, y: y }

  // let x = Math.floor((mouseX - current.x) / w)
  // let y = Math.floor((mouseY - current.y) / h)
  // console.log(x, y)
}

function displayBuy(state = !showBuy) {
  showBuy = state
  let opacity = showBuy ? 1 : 0

  $buy.div.style.opacity = opacity
  $buy.div.style.pointerEvents = showBuy ? 'auto' : 'none'

  if (!(selected.x < 0 || selected.x >= rows || selected.y < 0 || selected.y >= cols) && showBuy) {
    let text = $buy.div.children[0].children[0]
    $buy.div.style.top = `${current.y + (selected.x + selected.y) * h - 150}px`

    $buy.div.style.left = `${current.x + (selected.x - selected.y) * w - $buy.div.clientWidth / 2}px`

    let cost = field.cells[selected.y][selected.x].cost
    text.innerHTML = `Купить участок за ${cost} <i class="fas fa-coins"></i>?`

    if (cost > server.user.balance) {
      $buy.yes.disabled = true
    }
    else {
      $buy.yes.disabled = false
    }
  }
}