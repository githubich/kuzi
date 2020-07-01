setPageTitle("chart-line", "dashboard.title")
setActiveTab(0)

function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}

fetch('https://gist.githubusercontent.com/ezarcel/5749f919b44cc4291d59bcc8e4169147/raw/8f85ac2de986830e35978fcd3e47bc4c8572606d/enterpreneur-quotes.json')
    .then(res => res.json())
    .then(res => {
        quoteIndex = random(0,res.length)
        $(".motivationQuote").innerText = `${res[quoteIndex].text} ~ ${res[quoteIndex].from}`
    })

fetch('/user/getevents')
    .then(res => res.json())
    .then(res => {
    })

fetch('/user/getnotifications')
    .then(res => res.json())
    .then(res => {
    })

fetch('/user/getmarks')
    .then(res => res.json())
    .then(res => {
    })