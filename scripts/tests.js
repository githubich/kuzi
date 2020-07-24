window.addEventListener('load', () => {
    setPageTitle("clipboard-check", `[{(tests)}]`)
    setActiveTab(2)
})
function load() {
    fetch(`${userInfo.role}s/tests/list`, { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            console.log(res)
        })
}