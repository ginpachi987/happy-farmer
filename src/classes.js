import { avatar } from './scripts/images'

export class Coords {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  add(other) {
    this.x += other.x
    this.y += other.y
  }

  reset() {
    this.x = 0
    this.y = 0
  }
}

export class Field {
  constructor(cols, rows) {
    this.cols = cols
    this.rows = rows
    this.cells = [...Array(cols)].map(() => [...Array(rows)].map(() => new Cell()))
  }

  set(field) {
    field.forEach((cell, i) => {
      this.cells[i % 4][Math.floor(i / 4)].set(cell)
    })
    // this.cells = field.cells
  }
}

export class Cell {
  constructor() {
    this.crop = 0
    this.id = 0
    this.x = 0
    this.y = 0
    this.startTime = 0
    this.endTime = 0
    // this.state = 0
    this.cost = 2
    this.buystate = 0
  }

  set(cell) {
    this.crop = parseInt(cell.crop)
    this.id = parseInt(cell.id)
    this.x = parseInt(cell.x)
    this.y = parseInt(cell.y)
    this.startTime = Date.parse(cell.starttime)
    this.endTime = Date.parse(cell.endtime)
    // this.state = parseInt(cell.state)
    this.cost = 10 * (parseInt(cell.id) * 1.2)
    this.buystate = parseInt(cell.buystate)
  }
}

class Crop {
  constructor(id, name, cost, time, img) {
    this.id = id
    this.name = name
    this.cost = cost
    this.time = time
    this.img = img
  }
}

class UserData {
  constructor() {
    this.balance = 0
    this.displayBalance = 0
    this.name = 'Player'
    this.avatar = avatar
    this.level = 1
    this.exp = 10
    this.displayExp = 0
    this.nextLevelExp = 50

    let menu = document.querySelector('#top-menu')

    this.$img = document.querySelector('.avatar')
    // menu.appendChild(this.$img)
    this.$name = document.querySelector('.username')
    // menu.appendChild(this.$name)
    this.$balance = document.querySelector('.user-balance')
    // menu.appendChild(this.$balance)

    this.$level = document.querySelector('.user-level')
    // menu.appendChild(this.$exp)
    this.$exp = document.querySelector('.current-exp')

    this.updateStats()
  }

  updateStats(sync = false) {
    this.$img.src = this.avatar
    this.$name.innerText = this.name
    if (sync) this.displayBalance = this.balance
    this.$balance.innerHTML = `${this.displayBalance} <i class="fas fa-coins"></i>`
    this.$level.innerHTML = `${this.level}`
    this.$exp.style.width = `${floor(this.exp/this.nextLevelExp*146)}px`
  }

  setData(user) {
    this.balance = parseInt(user.balance)
    this.name = user.username
    this.avatar = user.avatar || avatar
    this.exp = parseInt(user.exp)
    this.level = parseInt(user.level) || 1
    this.nextLevelExp = parseInt(user.nextLevelExp) || 50

    this.updateStats()
  }

  correctBalance() {
    let oldBalance = this.displayBalance.toString().split('').map(el => parseInt(el)).reverse()
    let newBalance = this.balance.toString().split('').map(el => parseInt(el)).reverse()

    if (newBalance.length > oldBalance.length) {
      oldBalance.push(...[...Array(newBalance.length - oldBalance.length)].map(() => 0))
    }
    if (newBalance.length < oldBalance.length) {
      newBalance.push(...[...Array(oldBalance.length - newBalance.length)].map(() => 0))
    }

    for (let i = 0; i < newBalance.length; i++) {
      if (newBalance[i] == oldBalance[i]) {
        continue
      }
      if (newBalance[i] > oldBalance[i]) {
        oldBalance[i]++
      }
      else {
        oldBalance[i]--
      }
      break
    }

    // oldBalance.forEach((digit, i) => {
    //   // console.log(digit, newBalance[i])
    //   if (digit > newBalance[i]) {
    //     digit--
    //   }
    //   if (digit < newBalance[i]) {
    //     digit++
    //   }
    //   // console.log(digit, newBalance[i])
    // })

    // console.log(oldBalance.reverse().join(''))
    this.displayBalance = parseInt(oldBalance.reverse().join(''))
    // console.log(this.displayBalance)

    this.updateStats()
  }
}

export class Server {
  constructor(url, field) {
    this.url = url
    this.field = field
    this.user = new UserData()
    this.crops = [
      new Crop(1, 'Перец', 5, 90, '🌶️'),
      new Crop(2, 'Арбуз', 10, 120, '🍈'),
      new Crop(3, 'Апельсин', 15, 150, '🍊'),
      new Crop(4, 'Лимон', 20, 180, '🍋'),
      new Crop(5, 'Яблоко', 30, 360, '🍎'),
      // 🍓🍆
    ]
  }

  requestStats(request = {}) {
    // console.log('fetch')
    fetch(this.url, {
      method: 'POST',
      // mode: 'no-cors',
      // credentials: 'omit',
      // headers: {
      //   'Content-Type': 'application/json'
      // },
      body: JSON.stringify(request)
    })
      .then(res => res.json())
      .then(res => {
        // console.log(res)
        if (res.user) {
          this.user.setData(res.user)
        }
        if (res.field) {
          this.field.set(res.field)
        }
        // if (res.crops) {
        if (true) {
          const crops = [
            new Crop(1, 'Перец', 5, 90, '🌶️'),
            new Crop(2, 'Арбуз', 10, 120, '🍈'),
            new Crop(3, 'Апельсин', 15, 150, '🍊'),
            new Crop(4, 'Лимон', 20, 180, '🍋'),
            new Crop(5, 'Яблоко', 30, 360, '🍎'),
            // 🍓🍆
          ]
          this.crops = crops
        }
      })
  }

  buy(id) {
    this.requestStats({
      event: 'buy',
      id: id
    })
  }

  plant(id) {
    this.requestStats({
      event: 'plant',
      id: id
    })
  }

  harvest(cell) {
    if (Date.now() - cell.endTime > 0) {
      this.requestStats({
        event: 'harvest',
        id: cell.id
      })
    }
  }
}

export class Collectable {
  constructor(container, type, img, left, top) {
    this.container = container
    this.el = document.createElement('div')
    this.el.classList.add('collectable')
    this.container.appendChild(this.el)
    this.type = type
    this.img = img
    this.setPos(left, top)
    this.el.innerHTML = this.img
  }

  setPos(x, y) {
    this.el.style.left = `${x}px`
    this.el.style.top = `${y}px`
  }

  destroy() {
    this.container.removeChild(this.el)
  }
}