function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}
window.addEventListener('load', () => {
    setPageTitle("chart-line", "[{(dashboard)}]")
    setActiveTab(0)
    if (getComputedStyle($('.dash-block.motivation-dash-block')).display != "none") {
        fetch('https://gist.githubusercontent.com/ezarcel/5749f919b44cc4291d59bcc8e4169147/raw/b7e0b2fb4ea9c466271b562668d7edc4aa692627/enterpreneur-quotes.json')
            .then(res => res.json())
                .then(res => {
                    let quoteIndex = random(0, res.length - 1)
                    $(".motivation-dash-block .title").innerText = `${res[quoteIndex].a} ~ ${res[quoteIndex].b}`
                })
    }
    fetch('/misc/notifications/get', { method: 'POST' })
        .then(res => res.json())
            .then(res => {
                let notifications = $('.notifications-dash-block .dash-block-content')
                res.forEach(notification => {
                    notificationE = document.createElement('div')
                    notifications.insertBefore(notificationE, notifications.children[0])
                    notificationE.outerHTML = `
                        <div class="notification">
                            <div class="clickable" onclick='${notification.action}'>
                                <i class="fad fa-bell"></i>
                                <div class="notification-content">
                                    <p class="title">${notification.title}</p>
                                    <p class="details">${notification.details}</p>
                                </div>
                            </div>
                            <i class="far fa-check delete-notification" title="[{(discard)}]" onclick=""></i>
                        </div>
                    `
                })
            })
})
window.addEventListener('onresize', () => {
    $('#markGraph').width = $('#markGraph').offsetWidth
    $('#markGraph').height = $('#markGraph').offsetHeight
})