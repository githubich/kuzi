window.addEventListener('load', () => {
    setPageTitle("comment-exclamation", "announcements.title")
    setActiveTab(1)
})

/*let urlArgs = new URL(window.location.href).search
urlArgs = $parseURLArgs(urlArgs)

window.onload = () => {
    if (urlArgs.view == "sent") {
        $('.messages-container').style.display = "block"
        fetch('/messages/getsent', {
            method: 'POST'
        }).then(res => {
            console.log(res)
            res.json().then(res => {
                console.log(res)
            })
        })
    } else if (urlArgs.view == "write") {
        $('.announcements-writer').style.display = "block"
    } else {
        $('.announcements-container').style.display = "block"
        fetch('/messages/listrecieved', {
            method: 'POST'
        }).then(res => {
            console.log(res)
            res.json().then(res => {
                console.log(res)
            })
        })
    }
}

function sendMessage(reciversString,subject,body) {
    let recievers = []
    reciversString.split(';').forEach(reciever => {
        recievers = [...recievers, {prettyName: reciever}]
    })
    fetch('/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recievers: recievers,
            subject: subject,
            body: body
        })
    }).then(res => {
        console.log(res)
    })
}*/