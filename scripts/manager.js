function changeTab(tab) {
    if (!tab || $('.tab.selected') == tab) return
    $$('.content').forEach(content => content.style.display = 'none')
    $(`.content#${tab.getAttribute('value')}`).removeAttribute('style')
}
window.addEventListener('load', () => setPageTitle("users-cog", "[{(manager)}]"))
window.addEventListener('ready', () => {
    if (!userInfo.isAdmin) return qError({ message: "[{(error.notAllowed)}]", goBack: true })
})