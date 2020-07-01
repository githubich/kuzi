fetch('/user/getinfo', { method: 'POST' })
    .then(res => {
        res.json().then(res => {
            if (res.message == "logout") window.location = '/'
            userInfo = res.userInfo
            load()
        })
        .catch(e => {
            window.location = '/'
    })
})
function correctDropdown(top) {
    headerDropdown=$("#dropdown")
    if (top) headerDropdown.style.top = top + "px"
    headerDropdown.style.left = document.querySelector('#main-header>div:nth-child(2)').offsetLeft + "px"
    headerDropdown.style.width = ($("header>:nth-child(4)").offsetLeft-$("header>:nth-child(2)").offsetLeft + 1) + "px"
}
function load() {
    headerDropdownVisible = false
    headerDropdownArrow = $("#dropdown-arrow")
    if (userInfo.role == "teacher") $$('span.notify-dot').forEach(dot => dot.remove())
    $('.student-info .name').innerText = userInfo.prettyName
    if (userInfo.role == "teacher") {
        $('.student-info .status').innerText = "base.teacher"
    } else {
        $('.student-info .status').innerText = userInfo.prettyClassName
    }
    if (userInfo.isAdmin) $('.student-info .status').innerText = `[Admin] ${$('.student-info .status').innerText}`
    $('.student-photo').style.backgroundImage = `url(/users/${userInfo.userID})`
    correctDropdown(59.5)
}
function addSubheaderAction(icon, text, url, onclick) {
    $('.subheader--actions').innerHTML = `${$('.subheader--actions').innerHTML}
        <li class="subheader--action">
            <a href="${url}" onclick="${onclick}"><i class="fas fa-${icon}"></i><span>${text}</span></a>
        </li>`
    $("#subheader").style.display="block"
    window.scrollY=0
    correctDropdown(108.5)
}
function setPageTitle(icon, title) {
    $('.page-title').innerHTML = `<i class="fad fa-${icon}"></i>${title}`
}
function setActiveTab(index) {
    $$('.header--action')[index].style.fontWeight = "bold"
    $$('.header--action a')[index].removeAttribute('href')
}
function toggleDropdown() {
    if (!$("#dropdown.hiding") && !$("#dropdown.showing")) {
        correctDropdown()
        headerDropdown.classList.remove("showed","hidden")
        if (headerDropdownVisible) {
            headerDropdownVisible = false
            headerDropdown.classList.add("hiding")
            headerDropdownArrow.style.transform = ""
            setTimeout(()=>{headerDropdown.classList.remove("hiding"); headerDropdown.classList.add("hidden")},200)
        } else {
            headerDropdownVisible = true
            headerDropdown.classList.add("showing")
            headerDropdownArrow.style.transform = "rotateX(180deg)"
            setTimeout(()=>{headerDropdown.classList.remove("showing"); headerDropdown.classList.add("showed")},200)
        }
    }
}
window.onclick = e => {
    if (e.path[0] != headerDropdown && e.path[1] != headerDropdown && e.path[2] != headerDropdown && e.path[3] != headerDropdown) {
        if (headerDropdownVisible && $('#dropdown.showed') !== null){
            headerDropdown.classList.remove("showed","hidden","showing","hiding");
            headerDropdownVisible=false;
            headerDropdownArrow.style.transform=""
            headerDropdown.classList.add("hiding");
            setTimeout(function(){headerDropdown.classList.remove("hiding");headerDropdown.classList.add("hidden")},250)
        }
    }
}
window.onscroll = () => {
    if ($("#dropdown.hidden") == null) {
        $("#dropdown").style.top=`${window.scrollY+headerDropdownOffset}px`
    }
}
function uploadProfilePhoto() {
    let maxSize = parseInt($('.photo-change-input').getAttribute('max-size'))
    if ($('.photo-change-input').files[0] !== null) {
        let fileSize = $('.photo-change-input').files[0].size
        if (fileSize > maxSize || fileSize == 0) return false; return true
    } else {
        return false
    }
}