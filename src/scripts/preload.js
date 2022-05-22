import { grass, dirt, wood, bg, seedBag, news } from './images'

export function preload(wrapper) {
  return new Promise(resolve => {
    wrapper.show()
    const images = [grass, dirt, wood, bg, seedBag, news]
    let loaded = 0
    let el = document.createElement('div')
    el.classList.add('login')
    el.innerHTML = `
      <div class="login-title">🔃 Загрузка</div>
    `
    let progress = document.createElement('div')
    progress.innerHTML = `${loaded} из ${images.length}`
    el.appendChild(progress)
    wrapper.append(el)

    images.forEach(img => {
      let imgObj = new Image()
      imgObj.src = img
      imgObj.onload = () => {
        loaded++
        // console.log(`${loaded}/${images.length}`)
        progress.innerHTML = `${loaded} из ${images.length}`
        if (loaded === images.length) {
          setTimeout(() => {
            wrapper.hide()
            resolve()
          }, 500)
        }
      }
    })
  })
}