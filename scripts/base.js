function updateUserInfo(info, fromCache) {
    $().classList.remove('student', 'teacher', 'parent')
    $().classList.add(info.role)
    if ($('.user-photo').style.backgroundImage != `url(/users/${info.userID})`) $('.user-photo').style.backgroundImage = `url(/users/${info.userID})`
    $('.user-info .name').innerText = info.prettyName
    if (info.role == "teacher") {
        if (info.currentSubject.subjectID) $('.user-info .status').innerText = `${info.class.prettyName} | ${info.currentSubject.prettyName}`
        else $('.user-info .status').innerText = `[{(teacher)}]`
        if ($('#markGraph')) $('#markGraph').remove()
    } else if (info.role == "student") {
        if (info.currentSubject.subjectID) $('.user-info .status').innerText = `${info.class.prettyName} | ${info.currentSubject.prettyName}`
        else $('.user-info .status').innerText = `${info.class.prettyName}`
        if ($('#markGraph')) $('#markGraph').src = "/mark-graph.html"
    } else if (info.role == "parent") {
        if ($parseCookies().selectedChild == undefined) document.cookie = `selectedChild=${info.children[0].userID}`
        $('.user-info .status').innerText = info.children.find(e => e.userID == parseInt($parseCookies().selectedChild)).prettyName
        if ($('#markGraph')) $('#markGraph').src = "/mark-graph.html"
        if (fromCache === false) {
            let childSelector = $('#child-selector')
            info.children.forEach(child => {
                let childE = document.createElement('option')
                childSelector.appendChild(childE)
                childE.innerText = child.prettyName
                childE.value = child.userID
            })
            childSelector.value = $parseCookies().selectedChild
        }
    }
}
window.addEventListener('load', () => {
    if (localStorage.getItem('last-user-info')) updateUserInfo(JSON.parse(localStorage.getItem('last-user-info')), true)
    if (localStorage.getItem('theme') == 'dark') $('#theme + label').innerText = '[{(darkMode)}]'
    else $('#theme + label').innerText = '[{(lightMode)}]'
    $('#theme').checked = localStorage.getItem('theme') == 'dark'
    $('#theme').addEventListener('click', e => {
        if ($('#theme').checked) {
            localStorage.setItem('theme', 'dark')
            $('#theme + label').innerText = '[{(darkMode)}]'
        } else {
            localStorage.setItem('theme', 'light')
            $('#theme + label').innerText = '[{(lightMode)}]'
        }
        document.documentElement.setAttribute('theme', localStorage.getItem('theme'))
    })
    headerDropdown = $('#dropdown')
    headerDropdownArrow = $("#dropdown-arrow")
    headerDropdownVisible = false
    more = $("#more")
    moreVisible = false
    fetch('/user/getInfo', { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            userInfo = res.userInfo
            if (!userInfo.userID) location = '/'
            updateUserInfo(userInfo, false)
            if (typeof load == "function") load()
            localStorage.setItem('last-user-info', JSON.stringify(userInfo))
        })
        .catch(e => console.error(e))
})
window.addEventListener('click', e => {
    if (headerDropdownVisible && e.path[0] != headerDropdown && e.path[1] != headerDropdown && e.path[2] != headerDropdown && e.path[3] != headerDropdown && e.path[4] != headerDropdown) toggleDropdown()
    if (moreVisible && e.path[0] != more && e.path[1] != more && e.path[2] != more && e.path[3] != more && e.path[4] != more) toggleMore()
})
window.addEventListener('keydown', e => {
    if (e.key == "Enter") {
        e.preventDefault()
        if (document.activeElement == $('.password-modal--input.password-modal--oldPassword')) $('.password-modal--input.password-modal--newPassword').focus()
        else if (document.activeElement == $('.password-modal--input.password-modal--newPassword')) $('.password-modal--input.password-modal--newPassword2').focus()
        else if (document.activeElement == $('.password-modal--input.password-modal--newPassword2')) $('#password-submit').click()
        return false
    } else if (e.key == "Escape") {
        e.preventDefault()
        $$('.modal').forEach(modal => { if (modal.style.display == "block") modal.querySelector('.close').click() })
    }
})
function toggleDropdown() {
    if (!$("#dropdown.hiding") && !$("#dropdown.showing")) {
        headerDropdown.classList.remove("shown","hidden")
        if (headerDropdownVisible) {
            headerDropdownVisible = false
            headerDropdown.classList.add("hiding")
            headerDropdownArrow.style.transform = ""
            setTimeout(() => { headerDropdown.classList.remove("hiding"); headerDropdown.classList.add("hidden") }, 200)
        } else {
            headerDropdownVisible = true
            headerDropdown.classList.add("showing")
            headerDropdown.style.left = `${$('header > div:nth-child(2)').offsetLeft}px`
            headerDropdown.style.width = `${$("header > :nth-child(4)").offsetLeft - $("header > :nth-child(2)").offsetLeft + 1}px`
            headerDropdownArrow.style.transform = "rotateX(180deg)"
            setTimeout(() => { headerDropdown.classList.remove("showing"); headerDropdown.classList.add("shown") }, 200)
        }
    }
}
function toggleMore() {
    if (!$("#more.hiding") && !$("#more.showing")) {
        more.classList.remove("shown","hidden")
        if (moreVisible) {
            moreVisible = false
            more.classList.add("hiding")
            setTimeout(() => { more.classList.remove("hiding"); more.classList.add("hidden") }, 200)
        } else {
            moreVisible = true
            more.classList.add("showing")
            more.style.left = `${$('header .more-action').offsetLeft - more.offsetWidth + $('header .more-action').offsetWidth}px`
            setTimeout(() => { more.classList.remove("showing"); more.classList.add("shown") }, 200)
        }
    }
}
setPageTitle = (icon, title) => $('main .main-title').innerHTML = `<i class="fad fa-${icon}"></i>${title}`
function setActiveTab(index, preserveHref) {
    $$('.header-action')[index].classList.add('selected')
    if (!preserveHref) $$('.header-action a')[index].removeAttribute('href')
}
function changePhoto() {
    let maxSize = parseInt($('.picture-input').getAttribute('max-size'))
    if ($('.picture-input').files[0] == null) return qAlert({ message: "[{(noFileSelected)}]", mode: "error", buttons: { cancel: { invisible: true } } })
    let fileSize = $('.picture-input').files[0].size
    if (fileSize > maxSize || fileSize == 0) return
    let data = new FormData()
    data.append('photo', $('.picture-input').files[0])
    fetch('/user/changePicture', { method: 'POST', body: data })
        .then(res => res.json())
        .then(res => {
            if (res.message == 'ok') qAlert({ message: '[{(success.photoChange)}]', mode: 'success', buttons: { cancel: { invisible: true } } }).then(() => location.reload())
            else return qAlert({ message: '[{(error.unknown)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
        })
}
function toggleModal(modalName) {
    let modal = $(`#${modalName}-modal`)
    modal.style.display == "block" ? modal.style.display = "none" : modal.style.display = "block"
    window.dispatchEvent(new Event(`toggle-modal-${modalName}`))
}
function verifyAndChangePassword() {
    let old = $('.password-modal--oldPassword').value
    let new1 = $('.password-modal--newPassword').value
    let new2 = $('.password-modal--newPassword2').value

    if (old == "" || !old || old == null || old == undefined || new1 == "" || !new1 || new1 == null || new1 == undefined || new2 == "" || !new2 || new2 == null || new2 == undefined) return qAlert({ message: "[{(error.invalidInput)}]", mode: "error" , buttons: { cancel: { invisible: true } } })
    if (old == new1) return qAlert({ message: "[{(error.oldPassword=newPassword)}]", mode: "error" , buttons: { cancel: { invisible: true } } })
    if (new1 != new2) return qAlert({ message: "[{(error.newPassword!=newPasswordConfirmation)}]", mode: "error" , buttons: { cancel: { invisible: true } } })
    if (new1.length < 6) return qAlert({ message: "[{(error.newPasswordLength)}]", mode: "error" , buttons: { cancel: { invisible: true } } })

    fetch('/user/changePassword',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userInfo.userID,
                oldPassword: $('.password-modal--input.password-modal--oldPassword').value,
                newPassword: $('.password-modal--input.password-modal--newPassword').value
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.message == 'ok') { qAlert({ message: "[{(success.passwordUpdate)}]", mode: "ok" , buttons: { cancel: { invisible: true } } }); toggleModal('password') }
            else qAlert({ message: "[{(error.oldPasswordNotCorrect)}]", mode: "error" , buttons: { cancel: { invisible: true } } })
        })
}
function updateChild(ID) {
    document.cookie = `selectedChild=${ID}`
    location.reload()
}
function getTemplate(templateName, parameters) {
    if (templateName === (undefined || null) || $('#templates') === undefined) return
    let template = $(`#templates #${templateName}`).innerHTML
    if (parameters) {
        template = template.toString()
        Object.keys(parameters).forEach(parameter => template = template.split(`%${parameter}%`).join(parameters[parameter]))
    }
    return template
}
function createElement({ type, classes, id, innerContent, parameters }) {
    if (!type) return
    let element = document.createElement(type)
    if (classes) element.classList.add(...classes)
    if (id) element.id = id
    if (innerContent && innerContent.type && innerContent.content) {
        if (innerContent.type.toLowerCase() == 'html') element.innerHTML = innerContent.content
        else element.innerText = innerContent.content
    }
    if (parameters) Object.keys(parameters).forEach(parameter => element.setAttribute(parameter, parameters[parameter]))
    return element
}