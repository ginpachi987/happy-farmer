export class News {
  constructor(wrapper) {
    this.button = document.querySelector('.news-button')
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
      this.wrapper.hide()
    })

    buttons.appendChild(ext)
    nw.appendChild(buttons)
    this.wrapper.append(nw)
  }
}