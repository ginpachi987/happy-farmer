export function loginFormGenerator(server, wrapper, callback) {
  wrapper.show()

  let form = document.createElement('form')
  form.classList.add('login')
  let header = document.createElement('div')
  header.classList.add('login-title')
  header.innerHTML = '👤 Вход'
  form.appendChild(header)
  let login = document.createElement('input')
  login.id = 'username'
  login.type = 'text'
  login.minLength = 3
  login.pattern = '[a-zA-Z][a-zA-Z0-9]{2,}'
  login.placeholder = 'Имя пользователя'
  login.title = 'Имя пользователя должно начинаться с буквы и содержать не менее трёх символов. Допускаются буквы английского алфавита и цифры.'
  form.appendChild(login)
  let password = document.createElement('input')
  password.id = 'password'
  password.type = 'password'
  password.pattern = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'
  password.minLength = 8
  password.placeholder = 'Пароль'
  password.title = 'Пароль должен содержать хотя бы одну букву нижнего регистра, одну букву верхнего регистра и цифру и быть не короче 8 символов.'
  form.appendChild(password)
  let registration = document.createElement('label')
  registration.classList.add('registration')
  registration.title = 'Создать новую учётную запись'
  let registrationCheckbox = document.createElement('input')
  registrationCheckbox.id = 'registration'
  registrationCheckbox.type = 'checkbox'
  registration.appendChild(registrationCheckbox)
  registration.innerHTML += 'Регистрация'
  form.appendChild(registration)
  let error = document.createElement('div')
  error.classList.add('login-error')
  form.appendChild(error)
  let buttons = document.createElement('div')
  buttons.classList.add('buy-button')
  let loginButton = document.createElement('button')
  loginButton.id = 'login-button'
  loginButton.innerHTML = 'Войти'
  buttons.appendChild(loginButton)
  form.appendChild(buttons)
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    let username = document.querySelector('#username').value
    let password = document.querySelector('#password').value
    let registration = document.querySelector('#registration').checked
    // console.log(username, password, registration)
    // console.log(JSON.stringify(body))

    if (registration && (username.length < 3 || password.length < 8)) {
      error.innerHTML = 'Логин и пароль не могут быть пустыми'
      return
    }

    fetch(`${server}/${registration ? 'register' : 'login'}`, {
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
          const accessToken = res.accessToken
          const refreshToken = res.refreshToken

          // localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          wrapper.hide()
          callback(accessToken)
        }
        else {
          localStorage.removeItem('refreshToken')
          // location.reload()
          error.innerHTML = res.resp
        }
      })
    // server.login($username.value, $password.value)
  })

  wrapper.append(form)
}

export async function generateAccessToken(server, refreshToken, callback) {
  return new Promise((resolve) => {
    fetch(`${server}/generateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ refreshToken: refreshToken })
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          let accessToken = res.accessToken
          // let socket = openSocket(accessToken)

          let top = document.querySelector('.top')
          top.style.top = '0'

          // let bottom = document.querySelector('.bottom')
          // bottom.style.bottom = '0'

          callback(accessToken)
        }
        else {
          localStorage.removeItem('refreshToken')
          location.reload()
        }
        resolve()
      })
  })
}

export function logout(server, refreshToken, wrapper, socket) {
  let button = document.querySelector('.logout-button')
  button.addEventListener('click', () => {
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

    let logout = document.createElement('button')
    logout.innerHTML = 'Выйти'
    logout.addEventListener('click', () => {
      let input = document.querySelector('#logout')
      console.log(input.checked)
      fetch(`${server}/logout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ refreshToken: refreshToken, clearSessions: input.checked })
      })
        .then(() => {
          socket.disconnect()
          location.reload()
          localStorage.removeItem('refreshToken')
        })
    })
    btns.appendChild(logout)

    let cancel = document.createElement('button')
    cancel.innerHTML = 'Отмена'
    cancel.addEventListener('click', () => {
      wrapper.hide()
    })
    btns.appendChild(cancel)

    lo.appendChild(btns)

    wrapper.append(lo)
    wrapper.show()
  })
}