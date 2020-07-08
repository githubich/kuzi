setPageTitle("chart-line", "[{(dashboard)}]")
setActiveTab(0)

function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}

window.addEventListener('load', () => {
    if (getComputedStyle($('.dash-block.motivation-dash-block')).display != "none") {
        fetch('https://gist.githubusercontent.com/ezarcel/5749f919b44cc4291d59bcc8e4169147/raw/b7e0b2fb4ea9c466271b562668d7edc4aa692627/enterpreneur-quotes.json')
            .then(res => res.json())
            .then(res => {
                let quoteIndex = random(0,res.length - 1)
                $(".motivation-dash-block .title").innerText = `${res[quoteIndex].a} ~ ${res[quoteIndex].b}`
            })
    }
})
window.addEventListener('onresize', () => {
    $('#markGraph').width = $('#markGraph').offsetWidth
    $('#markGraph').height = $('#markGraph').offsetHeight
})