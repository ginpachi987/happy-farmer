import '../style.scss'

import { Game } from './game'
import { preload } from './preload'
import { wrapper } from './wrapper'
import { generateAccessToken, loginFormGenerator, logout } from './auth'
import { io } from 'socket.io-client'
import { Player } from './player'
import { News } from './news'
import { Shop } from './shop'
import { Warehouse } from './warehouse'

let mouseStart = {
  x: 0,
  y: 0
}
let touching = false

let game
let player = new Player()
let socket

const serverName = 'https://yoro-farmer.herokuapp.com'
// const serverName = 'http://localhost:3030'

// Canvas init
let canvas = document.getElementById('game')
canvas.addEventListener('touchstart', (e) => {
  touchStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
})
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault()
  let x = e.changedTouches[0].clientX
  let y = e.changedTouches[0].clientY
  if (!touching) return
  game.move(x - mouseStart.x, y - mouseStart.y)
})
canvas.addEventListener('touchend', (e) => {
  e.preventDefault()
  let x = e.changedTouches[0].clientX
  let y = e.changedTouches[0].clientY
  if (mouseStart.x == x && mouseStart.y == y) {
    game.mouseMove(x, y)
    game.touched(socket)
  }
  touchEnd()
})
canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return
  touchStart(e.clientX, e.clientY)
})
canvas.addEventListener('mouseup', (e) => {
  if (!touching) return
  if (mouseStart.x == e.clientX && mouseStart.y == e.clientY) {
    game.clicked(socket)
  }
  touchEnd()
})
canvas.addEventListener('mousemove', (e) => {
  if (touching) {
    game.move(e.clientX - mouseStart.x, e.clientY - mouseStart.y)
  }
  else {
    game.mouseMove(e.clientX, e.clientY)
  }
})
canvas.addEventListener('mouseleave', () => {
  touchEnd()
  game.mouseLeave()
})
canvas.addEventListener('wheel', (e) => {
  game.move(e.deltaX / 10, -e.deltaY / 10)
  game.setStart()
})
window.addEventListener('resize', () => {
  setCanvasSize()
})

let ctx = canvas.getContext('2d')
ctx.textAlign = 'center'
let lastTime = 0
setCanvasSize()

// Wrapper
// const wrapper = new Wrapper()
let refreshToken = localStorage.getItem('refreshToken') || ''

// Loading
let loading = { state: true }
preload(wrapper).then(() => {
  game = new Game()
  setCanvasSize()
  if (refreshToken) generateAccessToken(serverName, refreshToken, openSocket)
  else loginFormGenerator(serverName, wrapper, openSocket)
})

// Menus
let news = new News(wrapper)
let shop = new Shop(wrapper)
let warehouse = new Warehouse(wrapper)

requestAnimationFrame(mainLoop)

// Functions
function mainLoop(timestamp) {
  let deltaTime = timestamp - lastTime
  if (deltaTime < 33) {
    requestAnimationFrame(mainLoop)
    return
  }
  lastTime = timestamp

  if (loading.state) {
    const fruits = ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰']

    ctx.font = `${random() * 60 + 14}px sans-serif`
    ctx.fillText(fruits[floor(random() * fruits.length)], random() * canvas.width, random() * (canvas.height + 20))

    requestAnimationFrame(mainLoop)
    return
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  game.update(deltaTime)
  game.draw(ctx)

  if (player.balance != player.displayBalance) player.correctBalance()

  requestAnimationFrame(mainLoop)
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.closePath()
}

function setCanvasSize() {
  const width = Math.min(window.innerWidth, 1920)
  const height = Math.min(window.innerHeight, 1080)
  canvas.width = width
  canvas.height = height
  if (game) game.resize(width, height)
}

function random() {
  return Math.random()
}
function floor(number) {
  return Math.floor(number)
}

function touchStart(x, y) {
  mouseStart = {
    x: x,
    y: y
  }
  touching = true
}
function touchEnd() {
  mouseStart = {
    x: 0,
    y: 0
  }
  game.setStart()
  touching = false
}

function openSocket(accessToken) {
  logout(serverName, refreshToken, wrapper, socket)

  let top = document.querySelector('.top')
  top.style.top = '0'

  let bottom = document.querySelector('.bottom')
  bottom.style.bottom = '0'

  loading.state = false
  ctx.font = `14px sans-serif`

  socket = null
  socket = io(serverName, {
    extraHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  socket.on('message', (data) => {
    console.log(data)
  })

  socket.on('userData', (data) => {
    // console.log(data)
    player.setData(data)
  })

  socket.on('fields', (data) => {
    game.setCells(data)
    // console.log(data)
  })

  socket.on('balance', (balance) => {
    player.balance = balance
  })

  socket.on('cell', (cell) => {

  })

  socket.on('disconnect', () => {
    socket.close()
    generateAccessToken()
    location.reload()
    // openSocket()
  })

  socket.on('exp', (res) => {
    player.updateExp(res)
    // console.log(res)
    // if (res.nextLevel) {
    //   server.user.nextLevelExp = res.nextLevelExp
    //   server.user.exp += res.amount - res.nextLevelExp
    //   server.user.level++
    // }
    // else {
    //   server.user.exp += res.amount
    // }
    // server.user.updateStats()
  })
}