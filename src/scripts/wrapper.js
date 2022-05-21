export class Wrapper {
  constructor() {
    this.el = document.querySelector('.wrapper')
  }

  show() {
    this.el.style.opacity = 1
    this.el.style.pointerEvents = 'auto'
  }

  hide() {
    this.el.innerHTML = ''
    this.el.style.opacity = 0
    this.el.style.pointerEvents = 'none'
  }

  append(el) {
    this.el.appendChild(el)
  }
}