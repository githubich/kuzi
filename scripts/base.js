random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
setPageTitle = (icon, title) => $('main .main-title').innerHTML = `<i class="fad fa-${icon}"></i>${title}`
function setActiveTab(index, preserveHref) {
    $$('.header-action')[index].classList.add('selected')
    if (!preserveHref) $$('.header-action a')[index].removeAttribute('href')
}
function updateUserInfo(info, fromCache) {
    $().classList.remove('student', 'teacher', 'parent', 'admin')
    $().classList.add(info.role)
    if (info.isAdmin) $().classList.add('admin')
    if ($('.user-photo').style.backgroundImage != `url(/users/${info.userID})`) $('.user-photo').style.backgroundImage = `url(/users/${info.userID})`
    $('.user-info .name').innerText = info.prettyName
    if (info.role == "teacher") {
        if (info.currentSubject.subjectID) $('.user-info .status').innerText = `${info.class.prettyName} | ${info.currentSubject.prettyName}`
        else $('.user-info .status').innerText = `[{(teacher)}]`
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
    if ($('#markGraph') && info.role != 'teacher' && !fromCache) $('#markGraph').src = "/mark-graph.html"
    else if ($('#markGraph') && info.role == 'teacher' && !fromCache) $('#markGraph').remove()
    dropdown.style.left = `${$('header > div:nth-child(2)').offsetLeft}px`
    dropdown.style.width = `${$("header > :nth-child(4)").offsetLeft - $("header > :nth-child(2)").offsetLeft + 1}px`
}
function toggleDropdown() {
    if ($('#dropdown.showing') || $('#dropdown.hiding')) return;
    dropdown.classList.remove("shown","hidden")
    if (dropdownVisible) {
        dropdownVisible = false
        dropdown.classList.add("hiding")
        $("#dropdown-arrow").style.transform = ""
        setTimeout(() => { dropdown.classList.remove("hiding"); dropdown.classList.add("hidden") }, 200)
    } else {
        dropdownVisible = true
        dropdown.classList.add("showing")
        $("#dropdown-arrow").style.transform = "rotateX(180deg)"
        setTimeout(() => { dropdown.classList.remove("showing"); dropdown.classList.add("shown") }, 200)
    }
}
function toggleMore() {
    if ($('#more.showing') || $('#more.hiding')) return;
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
function changePhoto() {
    let maxSize = parseInt($('.picture-input').getAttribute('max-size'))
    if ($('.picture-input').files[0] == null) return qError({ message: "[{(noFileSelected)}]"})
    let fileSize = $('.picture-input').files[0].size
    if (fileSize > maxSize || fileSize == 0) return
    let data = new FormData()
    data.append('photo', $('.picture-input').files[0])
    fetch('/user/changePicture', { method: 'POST', body: data }).then(res => res.json())
        .then(res => qSuccess({ message: '[{(success.photoChange)}]'}).then(() => location.reload()))
        .catch(e => qError({ message: e }))
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

    if (old == "" || !old || old == null || old == undefined || new1 == "" || !new1 || new1 == null || new1 == undefined || new2 == "" || !new2 || new2 == null || new2 == undefined) return qError({ message: "[{(error.invalidInput)}]" })
    if (old == new1) return qError({ message: "[{(error.oldPassword=newPassword)}]" })
    if (new1 != new2) return qError({ message: "[{(error.newPassword!=newPasswordConfirmation)}]" })
    if (new1.length < 6) return qError({ message: "[{(error.newPasswordLength)}]" })

    fetch('/user/changePassword',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userID: userInfo.userID,
            oldPassword: $('.password-modal--input.password-modal--oldPassword').value,
            newPassword: $('.password-modal--input.password-modal--newPassword').value
        })}).then(res => res.json())
        .then(res => {
            if (res.message == 'ok') { toggleModal('password'); qSuccess({ message: "[{(success.passwordUpdate)}]" }) }
            else qError({ message: "[{(error.oldPasswordNotCorrect)}]" })
        })
        .catch(e => qError({ message: e }))
}
function updateChild(ID) {
    document.cookie = `selectedChild=${ID}`
    location.reload()
}
window.addEventListener('load', () => {
    dropdown = $('#dropdown')
    dropdownVisible = false
    more = $("#more")
    moreVisible = false
    fetch('/user/getInfo', { method: 'POST' }).then(res => res.json())
        .then(res => {
            userInfo = res.userInfo
            if (!userInfo.userID) location = '/'
            updateUserInfo(userInfo, false)
            window.dispatchEvent(new Event('ready'))
            localStorage.setItem('last-user-info', JSON.stringify(userInfo))
        })
        .catch(e => location = '/')
    window.addEventListener('click', e => {
        if (!dropdownVisible && !moreVisible) return;
        if (!e.path && !e.composedPath) return console.warn("[Kuzi] Your browser doesn't support event.path or event.composedPath, the dropdown will stay open")
        if (dropdownVisible && ((e.path && !e.path.includes(dropdown)) || (e.composedPath && !e.composedPath().includes(dropdown)))) toggleDropdown()
        if (moreVisible && ((e.path && !e.path.includes(more)) || (e.composedPath && !e.composedPath().includes(more)))) toggleMore()
    })
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
        $$('iframe[src]').forEach(el => {
            el.contentDocument.documentElement.setAttribute('theme', localStorage.getItem('theme'))
        })
    })
})
window.addEventListener('keydown', e => {
    if (e.key == "Enter") {
        e.preventDefault()
        if (document.activeElement == $('.password-modal--input.password-modal--oldPassword')) $('.password-modal--input.password-modal--newPassword').focus()
        else if (document.activeElement == $('.password-modal--input.password-modal--newPassword')) $('.password-modal--input.password-modal--newPassword2').focus()
        else if (document.activeElement == $('.password-modal--input.password-modal--newPassword2')) $('#password-submit').click()
    } else if (e.key == "Escape") {
        e.preventDefault()
        $$('.modal').forEach(modal => { if (modal.style.display == "block") modal.querySelector('.close').click() })
    }
})

// SIZE DETECTOR
window.addEventListener('resize', () => {
    const lastAction = $('header .header--actions .header-action:nth-last-child(1)')
    $('header').classList.remove('icons-only')
    if (window.innerWidth <= (lastAction.offsetLeft + lastAction.offsetWidth)) $('header').classList.add('icons-only')
})

// ELEMENT FEATURES
function minMaxInput(el) {
    let value = parseInt(el.value),
        min = parseInt(el.getAttribute('min')),
        max = parseInt(el.getAttribute('max'))
    if (value < min) el.value = min
    else if (value > max) el.value = max
}
function features__summary_update() {
    $$('summary').forEach(summary => {
        if (summary.children[0].nodeName != 'I' && !summary.children[0].classList.contains('details-arrow')) {
            summary.insertBefore(createElement({ type: 'i', classes: [ 'fas', 'fa-triangle', 'details-arrow' ] }), summary.children[0])
        }
    })
}
window.addEventListener('load', () => {
    $$('input[type=date].no-year').forEach(el => {
        let now = new Date()
        el.min = `${now.getFullYear()}-01-01`;
        el.max = `${now.getFullYear()}-12-31`;
        el.setAttribute('onload', '')
    })
    //
    features__summary_update()
})