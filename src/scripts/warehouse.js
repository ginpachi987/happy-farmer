export class Warehouse {
  constructor(wrapper) {
    this.button = document.querySelector('.warehouse-button')
    this.button.addEventListener('click', () => {
      this.show()
    })
    this.wrapper = wrapper
  }

  show() {
    this.wrapper.show()

    let nw = document.createElement('div')
    nw.classList.add('shop')
    let header = document.createElement('div')
    header.classList.add('warehouse-title')
    header.innerHTML = '🏭 Склад'
    nw.appendChild(header)

    let wip = document.createElement('div')
    wip.style.flex = '1'
    wip.style.display = 'flex'
    wip.style.flexDirection = 'column'
    wip.style.alignItems = 'center'
    wip.style.justifyContent = 'center'
    let wipInner = document.createElement('div')
    wipInner.innerHTML = 'Work in progress...'

    wip.appendChild(wipInner)
    nw.appendChild(wip)

    let buttons = document.createElement('div')
    buttons.classList.add('buy-button')

    let ext = document.createElement('button')
    ext.innerHTML = 'Закрыть'
    ext.addEventListener('click', () => {
      this.wrapper.hide()
    })

    buttons.appendChild(ext)
    nw.appendChild(buttons)
    this.wrapper.append(nw)
  }
}