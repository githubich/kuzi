window.addEventListener('load', () => {
    qAlert_alert = document.createElement('div')
    $().appendChild(qAlert_alert)
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
                    <p class="hint"></p>
                    <input type="text" autofocus>
                </div>
                <button class="btn ok">[{(ok)}]</button>
                <button class="btn cancel">[{(cancel)}]</button>
            </div>
        </div>
    `
    $('#qAlert').addEventListener('keypress', e => { if (e.key == "Enter") $("#qAlert .ok").click() } )
    $('#qAlert .text-input input').addEventListener('keypress', e => { if (e.key == "Enter") $("#qAlert .ok").click() } )
})
function qAlert({ message, mode, textHint, buttons }) {
    return new Promise(resolve => {
        $('#qAlert .alert-text').innerText = message
        $('#qAlert').classList.remove("error","warn","question","info")
        if (mode == "error") $('#qAlert').classList.add("error")
        else if (mode == "warning") $('#qAlert').classList.add("warn")
        else if (mode == "question") $('#qAlert').classList.add("question")
        else if (mode == "correct" || mode == "ok" || mode == "success") $('#qAlert').classList.add("ok")
        else $('#qAlert').classList.add("info")
        if (textHint && textHint.text) {
            $('#qAlert .text-input').style.display = "block"
            $('#qAlert .text-input .hint').innerText = textHint.text
            if (textHint.icon) $('#qAlert .text-input .hint').innerHTML = `<i class="fad fa-${textHint.icon}"></i>${$('#qAlert .text-input .hint').innerHTML}`
            $('#qAlert .text-input input').value = ""
        } else $('#qAlert .text-input').style.display = "none"
        $$("#qAlert button")[0].addEventListener('click', () => {
            if (textHint && textHint.text) resolve($('#qAlert .text-input input').value)
            else resolve(true)
        })
        $$("#qAlert button")[1].addEventListener('click', () => resolve(false))
        $$("#qAlert button").forEach(e => e.addEventListener('click', () => $("#qAlert").style.display = "none"))
        
        if (buttons && buttons.ok && buttons.ok.text) $("#qAlert .ok").innerText = buttons.ok.text
        else $("#qAlert .ok").innerText = "OK"

        $("#qAlert .ok").style.display = "inline-block"

        if (buttons && buttons.cancel && buttons.cancel.text) $("#qAlert .cancel").innerText = buttons.cancel.text
        else $("#qAlert .cancel").innerText = "[{(cancel)}]"
        if (buttons && buttons.cancel && buttons.cancel.invisible) $("#qAlert .cancel").style.display = "none"
        else $("#qAlert .cancel").style.display = "inline-block"
        
        $("#qAlert").style.display = "block"
        $('#qAlert .ok').focus()
    })
}