function deleteEvent() {
    qAlert({ message: '[{(areYouSure)}]', mode: 'question', buttons: { ok: { text: 'Yes' }, cancel: { text: 'No' } } }).then(ans => {
        if (ans) {
            fetch('/misc/events/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventID: parseInt($parseURLArgs().ID) })
            }).then(res => res.json())
                .then(res => {
                    if (res.message == 'ok') qSuccess({ message: "[{(success.event.delete)}]" }).then(() => history.back())
                    else if (res.message == 'not allowed') qError({ message: "[{(error.notAllowed)}]", goBack: false })
                    else qError({ message: "[{(error.unknown)}]", goBack: false }).then(() => location.reload())
                })
        }
    })
}
function editEvent() {
    fetch('/misc/events/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            eventID: parseInt($parseURLArgs().ID),
            name: $('#edit input.name').value,
            description: $('#edit textarea.description').value,
            date: $('#edit input.date').value
        })
    }).then(res => res.json())
        .then(res => {
            if (res.message == 'ok') qSuccess({ message: "[{(success.event.edit)}]" }).then(() => history.back())
                    else if (res.message == 'not allowed') qError({ message: "[{(error.notAllowed)}]", goBack: false })
                    else qError({ message: "[{(error.unknown)}]", goBack: false }).then(() => location.reload())
        })
}
window.addEventListener('load', () => {
    setPageTitle("calendar-alt", "[{(eventDetails)}]")
    setActiveTab(0, true)
})
window.addEventListener('ready', () => {
    fetch('/misc/events/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventID: parseInt($parseURLArgs().ID) })
    }).then(res => res.json())
        .then(res => {
            if (res.message == 'not allowed') qError({ message: "[{(error.notAllowed)}]", goBack: true })
            let months = ['[{(january)}]','[{(february)}]','[{(march)}]','[{(april)}]','[{(may)}]','[{(june)}]','[{(july)}]','[{(august)}]','[{(september)}]','[{(octover)}]','[{(november)}]','[{(december)}]']
            $('#view p.name').innerText += res.name
            $('#view p.description').innerText += res.description
            $('#view p.date').innerText += `${res.date.day} ${months[res.date.month - 1]} ${res.date.year}`
            $('#view p.owner').innerText += res.owner.prettyName
            if (res.owner.userID == userInfo.userID) {
                $$('.owner-only').forEach(e => e.style.display = "")
                $('#edit input.name').value = res.name
                $('#edit textarea.description').innerText = res.description
                if (res.date.month < 10 ) res.date.month = `0${res.date.month}`
                if (res.date.day < 10 ) res.date.day = `0${res.date.day}`
                $('#edit input.date').value = `${res.date.year}-${res.date.month}-${res.date.day}`
            } else $$('.owner-only, #edit').forEach(e => e.remove())
        })
        .catch(e => qError({ message: "[{(error.notAllowed)}]", goBack: true }))
})