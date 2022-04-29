import ava from './img/avatar.png'

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
    this.startTime
    this.endTime
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

class UserData {
  constructor() {
    this.balance = 0
    this.name = 'Player'
    this.avatar = ava
    this.exp = 0

    let menu = document.querySelector('#top-menu')

    this.$img = document.createElement('img')
    this.$img.classList.add('avatar')
    menu.appendChild(this.$img)
    this.$name = document.createElement('div')
    menu.appendChild(this.$name)
    this.$balance = document.createElement('div')
    menu.appendChild(this.$balance)

    this.$exp = document.createElement('div')
    menu.appendChild(this.$exp)

    this.updateStats()
  }

  updateStats() {
    this.$img.src = this.avatar
    this.$name.innerText = this.name
    this.$balance.innerHTML = `${this.balance} <i class="fas fa-coins"></i>`
    this.$exp.innerHTML = `${this.exp} <i class="fas fa-star"></i>`
  }

  setData(user) {
    this.balance = user.balance
    this.name = user.name
    this.avatar = user.avatar || ava

    this.updateStats()
  }
}

export class Server {
  constructor(url, field) {
    this.url = url
    this.field = field
    this.user = new UserData()
  }

  requestStats(request = {}) {
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
      })
  }

  buy(id) {
    this.requestStats({
      event: 'buy',
      id: id
    })
  }
}