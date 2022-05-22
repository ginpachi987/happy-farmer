import { avatar } from "./images"

export class Player {
  constructor() {
    this.balance = 0
    this.displayBalance = 0
    this.name = 'Player'
    this.avatar = avatar
    this.level = 1
    this.exp = 10
    this.displayExp = 0
    this.nextLevelExp = 50

    // let menu = document.querySelector('#top-menu')

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
    this.$exp.style.width = `${Math.floor(this.exp/this.nextLevelExp*146)}px`
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

  updateExp(data) {
    if (data.nextLevel) {
      this.exp -= this.nextLevelExp
      this.nextLevelExp = data.nextLevelExp
      this.level++
    }
    this.exp += data.amount

    this.updateStats()
  }
}