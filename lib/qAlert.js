window.addEventListener('load', () => {
    qAlert_alert = document.createElement('div')
    document.body.appendChild(qAlert_alert)
    qAlert_alert.outerHTML = `
        <div id="qAlert" style="display: none;">
            <div class="qAlert-inner">
                <i class="qAlert fas fa-exclamation-triangle"></i>
                <i class="qAlert fas fa-exclamation-circle"></i>
                <i class="qAlert fas fa-question-circle"></i>
                <i class="qAlert fas fa-info-circle"></i>
                <i class="qAlert fas fa-check-circle"></i>
                <p class="alert-text"></p>
                <div class="text-input">
                    <p class="hint">Hint</p>
                    <input type="text" autofocus>
                </div>
                <button class="btn ok">OK</button>
                <button class="btn cancel">Cancel</button>
            </div>
        </div>
    `
    document.querySelector('#qAlert .text-input input').addEventListener('keydown', e => { if (e.key == "Enter") document.querySelector("#qAlert .ok").click() } )
})

function qAlert({ message, mode, textHint, buttons }) {
    return new Promise(resolve => {
        document.querySelector('#qAlert .alert-text').innerText = message
        document.querySelector('#qAlert').classList.remove("error","warn","question","info")
        if (mode == "error") document.querySelector('#qAlert').classList.add("error")
        else if (mode == "warning") document.querySelector('#qAlert').classList.add("warn")
        else if (mode == "question") document.querySelector('#qAlert').classList.add("question")
        else if (mode == "correct" || mode == "ok" || mode == "success") document.querySelector('#qAlert').classList.add("ok")
        else document.querySelector('#qAlert').classList.add("info")
        if (textHint && textHint.text) {
            document.querySelector('#qAlert .text-input').style.display = "block"
            document.querySelector('#qAlert .text-input .hint').innerText = textHint.text
            if (textHint.icon) document.querySelector('#qAlert .text-input .hint').innerHTML = `<i class="fad fa-${textHint.icon}"></i>${document.querySelector('#qAlert .text-input .hint').innerHTML}`
            document.querySelector('#qAlert .text-input input').value = ""
        } else {
            document.querySelector('#qAlert .text-input').style.display = "none"
        }
        document.querySelectorAll("#qAlert button")[0].addEventListener('click', () => {
            if (textHint.text) resolve(document.querySelector('#qAlert .text-input input').value)
            else resolve(true)
        })
        document.querySelectorAll("#qAlert button")[1].addEventListener('click', () => resolve(false))
        document.querySelectorAll("#qAlert button").forEach(e => e.addEventListener('click', () => document.querySelector("#qAlert").style.display = "none"))
        
        if (buttons && buttons.ok && buttons.ok.text) document.querySelector("#qAlert .ok").innerText = buttons.ok.text
        else document.querySelector("#qAlert .ok").innerText = "OK"

        if (buttons.cancel.text) document.querySelector("#qAlert .cancel").innerText = buttons.cancel.text
        else document.querySelector("#qAlert .cancel").innerText = "Cancel"
        if (buttons.cancel.invisible) document.querySelector("#qAlert .cancel").style.display = "none"
        else document.querySelector("#qAlert .cancel").style.display = "inline-block"
        
        document.querySelector("#qAlert").style.display = "block"
    })
}