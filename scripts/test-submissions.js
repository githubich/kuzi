window.addEventListener('load', () => {
    if ($parseURLArgs().ID == undefined) history.back()
    setPageTitle("clipboard-check", `[{(loading)}]`)
    setActiveTab(2, true)
})
function load() {
    fetch('/teachers/tests/get', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ID: $parseURLArgs().ID }) })
        .then(res => res.json())
        .then(test => {
            setPageTitle("clipboard-check", `[{(testSubmissions)}] (${test.name})`)
            fetch('/teachers/tests/listSubmissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testID: $parseURLArgs().ID }) })
                .then(res => res.json())
                .then(res => {
                    let table = $('#submissions')
                    res.forEach(submission => {
                        let submissionE = document.createElement('tr')
                        table.appendChild(submissionE)
                        submissionE.innerHTML += `<td>${submission.student.prettyName}</td>`

                        let startTime = new Date(submission.start)
                        let startHours = startTime.getHours()
                        let startMinutes = startTime.getMinutes()
                        if (startHours < 10) startHours = `0${startHours}`
                        if (startMinutes < 10) startMinutes = `0${startMinutes}`
                        submissionE.innerHTML += `<td>${startHours}:${startMinutes} ${startTime.getDate()}/${startTime.getMonth()}/${startTime.getFullYear()}</td>`

                        let submitTime = new Date(submission.end)
                        let submitHours = submitTime.getHours()
                        let submitMinutes = submitTime.getMinutes()
                        if (submitHours < 10) submitHours = `0${submitHours}`
                        if (submitMinutes < 10) submitMinutes = `0${submitMinutes}`
                        submissionE.innerHTML += `<td>${submitHours}:${submitMinutes} ${submitTime.getDate()}/${submitTime.getMonth()}/${submitTime.getFullYear()}</td>`

                        submissionE.innerHTML += `
                            <td class="actions">
                                <a href="/test-answers.html?testID=${test.testID}&studentID=${submission.student.userID}" title="[{(view)}]"><i class="fad fa-eye"></i></a>
                                <a onclick="deleteTestAnswer(${test.testID}, ${submission.student.userID})" title="[{(delete)}]"><i class="fad fa-trash"></i></a>
                            </td>
                        `
                    })
                })
        })
}