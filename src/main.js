/// <reference types='../node_modules/@types/p5/global' />

import './style.scss'
import { p5 } from 'p5'
import { io } from 'socket.io-client'
import { Collectable, Coords, Field, Server } from './classes'
import { grass, dirt, wood, bg, seedBag, news } from './images'

let cols = 4
let rows = 7

// const serverName = 'https://yoro-farmer.herokuapp.com'
const serverName = 'http://localhost:3030'
// const serverName = 'http://192.168.1.139:3030/'

let p = window

let disp = new Coords(0, 0)
let mouseStart = new Coords(0, 0)
let current

let screen

let cellSize = 100

// let sizeSlider
// let dispX, dispY

let mouseOver = false
let pressed = false

let selected = new Coords(-1, -1)

let w, h

let angle = 26

let field
let img = {}

let showBuy = false
let cellForBuy
let $buy = {}

let server

let growInterval
let $grow = {}
let growShow = false

let updateInterval

let bgSize
const cellsDisp = {
  x: 190,
  y: 70
}

let shopShow = false
let shopButton
let $shop = {}

let invShow = false
let invButton
let $inv = {}

let collectables

let socket

let accessToken //= localStorage.getItem('accessToken')
let refreshToken = localStorage.getItem('refreshToken')

let $login = document.querySelector('.login')
$login.addEventListener('submit', async (e) => {
  e.preventDefault()
  let username = document.querySelector('#username').value
  let password = document.querySelector('#password').value
  let registration = document.querySelector('#registration').checked
  // console.log(username, password, registration)
  // console.log(JSON.stringify(body))

  if (registration && (username.length < 3 || password.length < 8)) {
    document.querySelector('.login-error').innerHTML = 'Логин и пароль не могут быть пустыми'
    return
  }

  fetch(`${serverName}/${registration ? 'register' : 'login'}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
    .then(res => res.json())
    .then(res => {
      // console.log(res)
      if (res.success) {
        accessToken = res.accessToken
        refreshToken = res.refreshToken

        // localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        let loginWrapper = document.querySelector('.login-wrapper')
        loginWrapper.style.opacity = 0
        loginWrapper.style.pointerEvents = 'none'

        let top = document.querySelector('.top')
        top.style.top = '0'

        let bottom = document.querySelector('.bottom')
        bottom.style.bottom = '0'

        openSocket()
      }
      else {
        localStorage.removeItem('refreshToken')
        // location.reload()
        document.querySelector('.login-error').innerHTML = res.resp
      }
    })
  // server.login($username.value, $password.value)
})

if (!refreshToken) {
  let loginWrapper = document.querySelector('.login-wrapper')
  loginWrapper.style.opacity = 1
  loginWrapper.style.pointerEvents = 'all'

  // let top = document.querySelector('.top')
  // top.style.opacity = 0
}
else {
  generateAccessToken()
}

let $wrapper = document.querySelector('.wrapper')
let $logout = document.querySelector('.logout-button')
$logout.addEventListener('click', () => {
  let lo = document.createElement('div')
  lo.classList.add('login')
  let header = document.createElement('div')
  header.classList.add('login-title')
  header.innerHTML = '👤 Выход'
  lo.appendChild(header)

  let lbl = document.createElement('label')
  let inp = document.createElement('input')
  inp.type = 'checkbox'
  inp.id = 'logout'
  lbl.appendChild(inp)
  lbl.innerHTML += 'Выйти на всех устройствах'

  lo.appendChild(lbl)

  let btns = document.createElement('div')
  btns.classList.add('buy-button')

  let button = document.createElement('button')
  button.innerHTML = 'Выйти'
  button.addEventListener('click', () => {
    let input = document.querySelector('#logout')
    console.log(input.checked)
    fetch(`${serverName}/logout`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ refreshToken: refreshToken, clearSessions: input.checked })
    })
      .then(res => {
        socket.disconnect()
        location.reload()
        localStorage.removeItem('refreshToken')
      })
  })
  btns.appendChild(button)

  let button2 = document.createElement('button')
  button2.innerHTML = 'Отмена'
  button2.addEventListener('click', () => {
    $wrapper.removeChild(lo)
    $wrapper.style.opacity = 0
    $wrapper.style.pointerEvents = 'none'
  })
  btns.appendChild(button2)

  lo.appendChild(btns)

  $wrapper.appendChild(lo)
  $wrapper.style.opacity = 1
  $wrapper.style.pointerEvents = 'all'
})

let $news = document.querySelector('.news-button')
$news.addEventListener('click', () => {
  $wrapper.style.opacity = 1
  $wrapper.style.pointerEvents = 'all'
  mouseOver = false

  let nw = document.createElement('div')
  nw.classList.add('shop')
  let header = document.createElement('div')
  header.classList.add('shop-title')
  header.innerHTML = '📰 Новости'
  nw.appendChild(header)

  let wrapper = document.createElement('div')
  wrapper.classList.add('news-list')

  let n = document.createElement('div')
  n.classList.add('news-entry')
  let h = document.createElement('h3')
  h.innerHTML = 'Здесь начинается история'

  let date = document.createElement('sub')
  date.innerHTML = '16 мая 2022, 23:15'

  let txt = document.createElement('div')
  txt.innerHTML = 'Привет всем читающим. Добро пожаловать на открытый альфа-тест v0.0.0.0.0.0.0.1 нашей любимой игры Счастливый фермер. На данный момент можно только сажать перец (по нажатию) и собирать его (так же), ну, и открывать новые поля (да, я знаю про цену 9 поля, спасибо). Подозреваю, что со временем будет очень много изменений и сбросов, так что не очень привязывайтесь к тому, что уже открыли. Даже эту новость я пока что пишу "на коленках". 🌚<br/>Предложения принимаются в <a href="https://t.me/ginpachi987" target="_blank">телеграме</a>. Подписывайтесь на <a href="https://t.me/yorodev" target="_blank">канал</a>, если этого не сделал. Ну, или не подписывайтесь, что я вам сделаю. 🙈'

  n.appendChild(h)

  n.appendChild(document.createElement('hr'))
  n.appendChild(txt)
  n.append(date)
  wrapper.appendChild(n)
  nw.appendChild(wrapper)

  let buttons = document.createElement('div')
  buttons.classList.add('buy-button')

  let ext = document.createElement('button')
  ext.innerHTML = 'Закрыть'
  ext.addEventListener('click', () => {
    $wrapper.innerHTML = ''
    $wrapper.style.opacity = 0
    $wrapper.style.pointerEvents = 'none'
  })

  buttons.appendChild(ext)
  nw.appendChild(buttons)
  $wrapper.appendChild(nw)
})

function generateAccessToken() {
  fetch(`${serverName}/generateToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ refreshToken: refreshToken })
  })
    .then(res => res.json())
    .then(res => {
      // console.log(res)
      if (res.success) {
        accessToken = res.accessToken
        mouseOver = true
        openSocket()

        let top = document.querySelector('.top')
        top.style.top = '0'

        // let bottom = document.querySelector('.bottom')
        // bottom.style.bottom = '0'
      }
      else {
        localStorage.removeItem('refreshToken')
        location.reload()
      }
    })
}

function openSocket() {
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
    server.user.setData(data)
  })

  socket.on('fields', (data) => {
    server.field.set(data)
    // console.log(data)
  })

  socket.on('balance', (balance) => {
    server.user.balance = balance
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
    // console.log(res)
    if (res.nextLevel) {
      server.user.nextLevelExp = res.nextLevelExp
      server.user.exp += res.amount - res.nextLevelExp
      server.user.level++
    }
    else {
      server.user.exp += res.amount
    }
    server.user.updateStats()
  })
}

p.preload = () => {
  img.grass = loadImage(grass)
  img.buy = loadImage(wood)
  img.dirt = loadImage(dirt)
  img.bg = loadImage(bg)
  img.seedBag = loadImage(seedBag)
}

p.setup = () => {
  // console.log(img)
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
    // console.log('mouse enter')
  })
  game.addEventListener('mouseleave', () => {
    mouseOver = false
    // console.log('mouse leave')
  })
  current = new Coords(p.windowWidth / 2, p.windowHeight / 2)

  field = new Field(cols, rows)
  server = new Server('https://games.yoro.dev/farmer/api/', field)

  // server.requestStats()

  // sizeSlider = createSlider(1, 100, 10, 1)
  // sizeSlider.position(10, 10)
  // dispX = createSlider(0, 200, 0, 1)
  // dispX.position(10, 40)
  // dispY = createSlider(0, 200, 0, 1)
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
    // server.buy(cellForBuy.id)
    socket.emit('buy', cellForBuy.id)
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
  $grow.title = document.querySelector('.grow-title')
  $grow.timer = document.querySelector('.grow-time-left')
  $grow.progress = document.querySelector('.grow-progress')
  growInterval = setInterval(() => {
    if (growShow) {
      let cell = field.cells[selected.y][selected.x]

      let time = Math.floor((cell.endTime - Date.now()) / 1000)
      if (time < 0) {
        $grow.timer.innerHTML = 'Созрело 👍'
        $grow.progress.style.width = '100%'
        return
      }
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

  // updateInterval = setInterval(() => {
  //   // console.log('sync')
  //   server.requestStats()
  // }, 1000 * 60)

  bgSize = {
    width: img.bg.width * 1.85,
    height: img.bg.height * 1.85
  }

  $shop.div = document.querySelector('.shop-wrapper')
  $shop.close = document.querySelector('#shop-close')
  $shop.close.addEventListener('click', () => {
    shopShow = false
    $shop.div.style.opacity = 0
    $shop.div.style.pointerEvents = 'none'
  })
  shopButton = document.querySelector('.shop-button')
  shopButton.addEventListener('click', () => {
    shopShow = true
    $shop.div.style.opacity = 1
    $shop.div.style.pointerEvents = 'all'

    // let itemList = document.querySelector('.shop-items')
    // itemList.innerHTML = ''
    // server.crops.forEach(crop => {
    //   let item = document.createElement('div')
    //   item.classList.add('shop-item')
    //   item.innerHTML = `
    //     <div class="shop-item-image shop-item-bg"><div>${crop.img}</div></div>
    //     <div class="shop-item-name">${crop.name}</div>
    //     <div class="shop-item-cost">${crop.cost} <i class="fas fa-coins"></i></div>
    //   `
    //   itemList.appendChild(item)
    // })
  })
  // console.log(shopButton.getBoundingClientRect())

  $inv.div = document.querySelector('.inv-wrapper')
  $inv.close = document.querySelector('#inv-close')
  $inv.close.addEventListener('click', () => {
    invShow = false
    $inv.div.style.opacity = 0
    $inv.div.style.pointerEvents = 'none'
  })
  invButton = document.querySelector('.inv-button')
  invButton.addEventListener('click', () => {
    invShow = true
    $inv.div.style.opacity = 1
    $inv.div.style.pointerEvents = 'all'
  })

  collectables = document.querySelector('.collectables')

  background('#7ba149')
}

p.draw = () => {
  if (!accessToken) {
    const fruits = ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰']

    push()
    textSize(random() * 60 + 14)
    textAlign(CENTER, CENTER)
    text(fruits[floor(random() * fruits.length)], random() * p.windowWidth, random() * p.windowHeight)
    translate(p.windowWidth / 2, p.windowHeight / 2)
    pop()

    return
  }

  // console.log(dispX.value()/cellSize, dispY.value()/cellSize)
  // background('#7ba149')
  background('#89ba48')
  noFill()
  stroke(255)

  // console.log(dispX.value(), dispY.value())

  // angle = dispX.value()
  // console.log(angle)
  // h = cellSize * sin(angle)
  // w = cellSize * cos(angle)

  // angle = dispX.value()

  if (pressed) {
    disp.x = -mouseStart.x + mouseX
    disp.y = -mouseStart.y + mouseY
  }
  translate(current.x + disp.x, current.y + disp.y)

  image(img.bg, 0, 0, bgSize.width, bgSize.height)

  translate(-cellsDisp.x, -cellsDisp.y)

  if (mouseOver)
    getMouseCoords()

  if (selected.x >= 0 && selected.x < rows && selected.y >= 0 && selected.y < cols) {
    document.querySelector('body').style.cursor = 'pointer'
    growShow = true
    if (field.cells[selected.y][selected.x].crop == 0) {
      $grow.div.style.opacity = 0
    }
    else {
      let crop = field.cells[selected.y][selected.x].crop
      $grow.div.style.opacity = 1

      $grow.title.innerHTML = `${server.crops[crop - 1].img} ${server.crops[crop - 1].name}`

      $grow.div.style.top = `${current.y - cellsDisp.y + (selected.x + selected.y - 2) * h}px`
      $grow.div.style.left = `${current.x - cellsDisp.x + (selected.x - selected.y) * w - $grow.div.clientWidth / 2}px`
    }
  }
  else {
    document.querySelector('body').style.cursor = 'default'
    growShow = false
    $grow.div.style.opacity = 0
  }

  for (let j = 0; j < cols; j++) {
    push()
    for (let i = 0; i < rows; i++) {
      let sprite
      let cell = field.cells[j][i]

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

      if (field.cells[j][i].crop > 0) {
        push()
        let timeleft = Date.now() - cell.endTime
        let size = timeleft < 0 ? Math.floor((Date.now() - cell.startTime) / (cell.endTime - cell.startTime) * 24) : 24
        textSize(24 + size)
        text('🌱', 0, h)

        if (field.cells[j][i].endTime - Date.now() <= 0) {
          textSize(30)
          text('🌶️', -w / 4, h * 2 / 3)
        }
        pop()
      }

      if (i === selected.x && j === selected.y) {
        push()
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
        pop()
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

  // console.log(server.user.balance != server.user.displayBalance)
  if (server.user.balance != server.user.displayBalance) {
    server.user.correctBalance()
  }

  // if (server.user.balance > server.user.displayBalance) {
  //   server.user.displayBalance++
  //   server.user.updateStats()
  // }
  // else if (server.user.balance < server.user.displayBalance) {
  //   server.user.displayBalance--
  //   server.user.updateStats()
  // }

  // console.log(server.user.exp, server.user.displayExp)
  if (server.user.exp > server.user.displayExp) {
    server.user.displayExp++
    server.user.updateStats()
  }
  else if (server.user.exp < server.user.displayExp) {
    server.user.displayExp--
    server.user.updateStats()
  }
}

p.mousePressed = () => {
  if (!mouseOver) return
  pressed = true
  mouseStart = { x: mouseX, y: mouseY }
}

p.mouseClicked = () => {
  // socket.emit('message', 'click')
  // spawnCollectables()
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

  if (field.cells[selected.y][selected.x].buystate == 2) {
    switch (field.cells[selected.y][selected.x].crop) {
      case 0:
        socket.emit('plant', field.cells[selected.y][selected.x].id)
        // server.plant(field.cells[selected.y][selected.x].id)
        break;

      default:
        socket.emit('harvest', field.cells[selected.y][selected.x].id)
        // server.harvest(field.cells[selected.y][selected.x])
        break;
    }
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

p.touchStarted = () => {
  if (!mouseOver) return
  getMouseCoords()
  console.log(selected)
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

  let x = Math.floor(((mouseY - current.y - disp.y + cellsDisp.y) / h + (mouseX - current.x - disp.x + cellsDisp.x) / w) / 2)
  let y = Math.floor(((mouseY - current.y - disp.y + cellsDisp.y) / h - (mouseX - current.x - disp.x + cellsDisp.x) / w) / 2)

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
    $buy.div.style.top = `${current.y - cellsDisp.y + (selected.x + selected.y) * h - 150}px`

    $buy.div.style.left = `${current.x - cellsDisp.x + (selected.x - selected.y) * w - $buy.div.clientWidth / 2}px`

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

function spawnCollectables() {
  // console.log(mouseX, mouseY)
  let left = mouseX - 8
  let top = mouseY - 8
  let cols = [...Array(5)].map(() => new Collectable(collectables, 0, '🌶️', left, top))

  cols.push(new Collectable(collectables, 1, '⭐', left, top))
  cols.push(new Collectable(collectables, 1, '⭐', left, top))
  cols.push(new Collectable(collectables, 1, '⭐', left, top))

  // console.table(cols)

  // cols.forEach(col => {
  //   col.classList.add('collectable')
  //   collectables.appendChild(col)
  //   col.innerHTML = '🌶️'
  //   col.style.left = `${left}px`
  //   col.style.top = `${top}px`
  // })
  // console.log(cols)
  // let col = document.createElement('div')
  // col.classList.add('collectable')
  // collectables.appendChild(col)

  let inventory = invButton.getBoundingClientRect()
  let exp = document.querySelector('.user-level').getBoundingClientRect()
  // console.log(inventory)
  let invLeft = inventory.left + inventory.width / 2 - 16
  let invTop = inventory.top + inventory.height / 2 - 16

  let expLeft = exp.left + exp.width / 2 - 16
  let expTop = exp.top + exp.height / 2 - 16

  setTimeout(() => {
    cols.forEach(col => {
      left = left + Math.floor(Math.random() * 64) - 32
      top = top + Math.floor(Math.random() * 64) - 32
      col.setPos(left, top)
      // console.log(left, top)
      // col.style.left = `${left}px`
      // col.style.top = `${top}px`
    })
  }, 100)

  setTimeout(() => {
    cols.forEach(col => {
      switch (col.type) {
        case 0:
          col.setPos(invLeft, invTop)
          break;
        case 1:
          col.setPos(expLeft, expTop)
          break;
        default:
          break;
      }
      // col.style.left = `${invLeft}px`
      // col.style.top = `${invTop}px`
    })
  }, 1000)

  setTimeout(() => {
    cols.forEach(col => {
      col.destroy()
      server.user.exp += 1
      server.user.balance += 1
      // collectables.removeChild(col)
    })

  }, 1550);
}