headerDropdownVisible = false
moreVisible = false
function correctDropdown() {
    headerDropdown.style.top = ( $('main').offsetTop ) + "px"
    headerDropdown.style.left = $('header > div:nth-child(2)').offsetLeft + "px"
    headerDropdown.style.width = ($("header > :nth-child(4)").offsetLeft-$("header > :nth-child(2)").offsetLeft + 1) + "px"
}
function toggleDropdown() {
    if (!$("#dropdown.hiding") && !$("#dropdown.showing")) {
        headerDropdown.classList.remove("showed","hidden")
        if (headerDropdownVisible) {
            headerDropdownVisible = false
            headerDropdown.classList.add("hiding")
            headerDropdownArrow.style.transform = ""
            setTimeout(() => { headerDropdown.classList.remove("hiding"); headerDropdown.classList.add("hidden") }, 200)
        } else {
            headerDropdownVisible = true
            headerDropdown.classList.add("showing")
            correctDropdown()
            headerDropdownArrow.style.transform = "rotateX(180deg)"
            setTimeout(() => { headerDropdown.classList.remove("showing"); headerDropdown.classList.add("showed") }, 200)
        }
    }
}
function correctMore() {
    more.style.top = ( $('main').offsetTop ) + "px"
    more.style.left = ( $('header .more-action').offsetLeft - more.offsetWidth + $('header .more-action').offsetWidth ) + "px"
}
function toggleMore() {
    if (!$("#more.hiding") && !$("#more.showing")) {
        more.classList.remove("showed","hidden")
        if (moreVisible) {
            moreVisible = false
            more.classList.add("hiding")
            setTimeout(() => { more.classList.remove("hiding"); more.classList.add("hidden") }, 200)
        } else {
            moreVisible = true
            more.classList.add("showing")
            correctMore()
            setTimeout(() => { more.classList.remove("showing"); more.classList.add("showed") }, 200)
        }
    }
}
function setPageTitle(icon, title) { $('main .main-title').innerHTML = `<i class="fad fa-${icon}"></i>${title}` }
function setActiveTab(index) {
    $$('.header--action')[index].classList.add('selected')
    $$('.header--action a')[index].removeAttribute('href')
}
function uploadProfilePhoto() {
    let maxSize = parseInt($('.picture-input').getAttribute('max-size'))
    if ($('.picture-input').files[0] != null) {
        let fileSize = $('.picture-input').files[0].size
        if (fileSize > maxSize || fileSize == 0) return false; return true
    } else return false
}
function toggleModal(modalName) {
    let modal = $(`#${modalName}-modal`)
    if (modal.style.display == "block") modal.style.display = "none"
    else modal.style.display = "block"
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
        .then(res => res.json()
            .then(res => {
                console.log(res)
                if (res.message == 'ok') { qAlert({ message: "[{(success.passwordUpdate)}]", mode: "ok" , buttons: { cancel: { invisible: true } } }); toggleModal('password') }
                else qAlert({ message: "[{(error.oldPasswordNotCorrect)}]", mode: "error" , buttons: { cancel: { invisible: true } } })
            })
        )
}
window.addEventListener('load', () => {
    headerDropdown = $('#dropdown')
    headerDropdownArrow = $("#dropdown-arrow")
    more = $("#more")
    fetch('/user/getInfo', { method: 'POST' })
        .then(res => {
            res.json().then(res => {
                if (res.message == "logout") window.location = '/'
                userInfo = res.userInfo
                if (typeof load == "function") load()
                if (userInfo.role == "teacher") $$('span.notify-dot').forEach(dot => dot.remove())
                $('.user-info .name').innerText = userInfo.prettyName
                if (userInfo.role == "teacher") $('.user-info .status').innerText = "[{(teacher)}]"
                else if (userInfo.currentSubject.subjectID) $('.user-info .status').innerText = `${userInfo.class.prettyName} | ${userInfo.currentSubject.prettyName}`
                else $('.user-info .status').innerText = `${userInfo.class.prettyName}`
                $('.user-photo').style.backgroundImage = `url(/users/${userInfo.userID})`
            })
        })
})
window.addEventListener('scroll', () => correctDropdown())
window.addEventListener('click', e => {
    if (headerDropdownVisible && e.path[0] != headerDropdown && e.path[1] != headerDropdown && e.path[2] != headerDropdown && e.path[3] != headerDropdown && e.path[4] != headerDropdown) toggleDropdown()
    if (moreVisible && e.path[0] != more && e.path[1] != more && e.path[2] != more && e.path[3] != more && e.path[4] != more) toggleMore()
})
window.addEventListener('keypress', e => {
    if (e.key == "Enter") {
        if (document.activeElement === $('.password-modal--input.password-modal--oldPassword')) $('.password-modal--input.password-modal--newPassword').focus()
        else if (document.activeElement === $('.password-modal--input.password-modal--newPassword')) $('.password-modal--input.password-modal--newPassword2').focus()
        else if (document.activeElement === $('.password-modal--input.password-modal--newPassword2')) $('#password-submit').click()
        return false
    }
})