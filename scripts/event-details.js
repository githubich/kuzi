function load() {
    setPageTitle("calendar-alt", "[{(eventDetails)}]")
    fetch('/misc/events/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventID: parseInt($parseURLArgs().ID) })
    })
        .then(res => res.json())
        .then(res => {
            if (res.message == 'not allowed') qAlert({ message: "[{(error.notAllowed)}]", mode: 'error', buttons: { cancel: { invisible: true } } }).then(() => history.back())
            let months = ['[{(january)}]','[{(february)}]','[{(march)}]','[{(april)}]','[{(may)}]','[{(june)}]','[{(july)}]','[{(august)}]','[{(september)}]','[{(octover)}]','[{(november)}]','[{(december)}]']
            $('#view p.name').innerText += res.name
            $('#view p.description').innerText += res.description
            $('#view p.date').innerText += `${res.date.day} ${months[res.date.month - 1]} ${res.date.year}`
            $('#view p.owner').innerText += res.owner.prettyName
            if (res.owner.userID == userInfo.userID) {
                $$('.owner-only').forEach(e => e.style.display = "block")
                $('#edit input.name').value = res.name
                $('#edit textarea.description').innerText = res.description
                if (res.date.month < 10 ) res.date.month = `0${res.date.month}`
                if (res.date.day < 10 ) res.date.day = `0${res.date.day}`
                $('#edit input.date').value = `${res.date.year}-${res.date.month}-${res.date.day}`
            } else $$('.owner-only, #edit').forEach(e => e.remove())
        })
        .catch(e => console.error(e))
}
function deleteEvent() {
    qAlert({ message: '[{(areYouSure)}]', mode: 'question', buttons: { ok: { text: 'Yes' }, cancel: { text: 'No' } } }).then(ans => {
        if (ans) {
            fetch('/misc/events/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventID: parseInt($parseURLArgs().ID) })
            })
                .then(res => res.json())
                .then(res => {
                    if (res.message == 'ok') qAlert({ message: "[{(success.delete.event)}]", mode: 'success', buttons: { cancel: { invisible: false } } }).then(() => history.back())
                    else if (res.message == 'not allowed') qAlert({ message: "[{(error.notAllowed)}]", mode: 'error', buttons: { cancel: { invisible: false } } })
                    else if (res.message == 'unknown error') qAlert({ message: "[{(error.unknown.doNotRetry)}]", mode: 'error', buttons: { cancel: { invisible: false } } }).then(() => location.reload())
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
    })
        .then(res => res.json())
        .then(res => {
            if (res.message == 'ok') qAlert({ message: "[{(success.edit.event)}]", mode: 'success', buttons: { cancel: { invisible: false } } }).then(() => history.back())
            else if (res.message == 'not allowed') qAlert({ message: "[{(error.notAllowed)}]", mode: 'error', buttons: { cancel: { invisible: false } } })
            else if (res.message == 'unknown error') qAlert({ message: "[{(error.unknown.doNotRetry)}]", mode: 'error', buttons: { cancel: { invisible: false } } }).then(() => location.reload())
        })
}