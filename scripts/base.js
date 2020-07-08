function correctDropdown() {
    headerDropdown = $("#dropdown")
    headerDropdown.style.top = ( $('main').offsetTop ) + "px"
    headerDropdown.style.left = $('header > div:nth-child(2)').offsetLeft + "px"
    headerDropdown.style.width = ($("header > :nth-child(4)").offsetLeft-$("header > :nth-child(2)").offsetLeft + 1) + "px"
}
function setPageTitle(icon, title) { $('.page-title').innerHTML = `<i class="fad fa-${icon}"></i>${title}` }
function setActiveTab(index) {
    $$('.header--action')[index].classList.add('selected')
    $$('.header--action a')[index].removeAttribute('href')
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
            correctDropdown()
            headerDropdownVisible = true
            headerDropdown.classList.add("showing")
            headerDropdownArrow.style.transform = "rotateX(180deg)"
            setTimeout(() => { headerDropdown.classList.remove("showing"); headerDropdown.classList.add("showed") }, 200)
        }
    }
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
    let old = $('.password-modal--oldPassword').value,
        new1 = $('.password-modal--newPassword').value,
        new2 = $('.password-modal--newPassword2').value

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
    fetch('/user/getInfo', { method: 'POST' })
        .then(res => {
            res.json().then(res => {
                if (res.message == "logout") window.location = '/'
                userInfo = res.userInfo
                if (typeof load == "function") load()
                headerDropdownVisible = false
                headerDropdownArrow = $("#dropdown-arrow")
                if (userInfo.role == "teacher") $$('span.notify-dot').forEach(dot => dot.remove())
                $('.user-info .name').innerText = userInfo.prettyName
                if (userInfo.role == "teacher") $('.user-info .status').innerText = "[{(teacher)}]"
                else if (userInfo.currentSubject.subjectID) $('.user-info .status').innerText = `${userInfo.class.prettyName} | ${userInfo.currentSubject.prettyName}`
                else $('.user-info .status').innerText = `${userInfo.class.prettyName}`
                $('.user-photo').style.backgroundImage = `url(/users/${userInfo.userID})`
                correctDropdown()
            })
        })
})
window.addEventListener('scroll', () => correctDropdown())
window.addEventListener('click', e => { if (headerDropdownVisible && e.path[0] != headerDropdown && e.path[1] != headerDropdown && e.path[2] != headerDropdown && e.path[3] != headerDropdown && e.path[4] != headerDropdown) toggleDropdown() })
window.addEventListener('keypress', e => {
    if (e.key == "Enter") {
        if (document.activeElement === $('.password-modal--input.password-modal--oldPassword')) $('.password-modal--input.password-modal--newPassword').focus()
        else if (document.activeElement === $('.password-modal--input.password-modal--newPassword')) $('.password-modal--input.password-modal--newPassword2').focus()
        else if (document.activeElement === $('.password-modal--input.password-modal--newPassword2')) $('#password-submit').click()
        return false
    }
})