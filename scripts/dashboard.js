setPageTitle("chart-line", "dashboard.title")
setActiveTab(0)

function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}

fetch('https://gist.githubusercontent.com/ezarcel/5749f919b44cc4291d59bcc8e4169147/raw/8f85ac2de986830e35978fcd3e47bc4c8572606d/enterpreneur-quotes.json')
    .then(res => res.json())
    .then(res => {
        let quoteIndex = random(0,res.length - 1)
        $(".motivation-dash-block .title").innerText = `${res[quoteIndex].text} ~ ${res[quoteIndex].from}`
    })

/*fetch('/events/get')
    .then(res => res.json())
    .then(res => {
        
    })

fetch('/notifications/get')
    .then(res => res.json())
    .then(res => {
        
    })

fetch('/marks/get')
    .then(res => res.json())
    .then(res => {

    })*/