function random(min,max) {return Math.floor(Math.random()*(max-min+1)+min)}
/*function animateFiles(i) {
    if ($$('.file').length != i) {
        setTimeout(() => animateFiles(i + 1), 100)
        $$('.file i')[i].style.transform = `rotate(${random(-7, 7)}deg)`
        $$('.file i')[i].parentElement.style.animationPlayState = 'running'
    }
}*/
function load() {
    if (userInfo.role == "student") $$('.teachers-only').forEach(e => e.remove())
    fetch(`/${userInfo.role}s/resources/get`, { method: 'POST' })
        .then(res => res.json())
        .then(res => {
            res.forEach(block => {
                let subjectE = document.createElement('div')
                $('#files').appendChild(subjectE)
                subjectE.classList.add('subject')
                
                let subjectTitleE = document.createElement('div')
                subjectE.appendChild(subjectTitleE)
                subjectTitleE.classList.add('subject-title')
                if (userInfo.role == "student") subjectTitleE.innerHTML = `<h2>${block.subject.prettyName}</h2><i class="far fa-file-upload teachers-only" onclick="toggleModal('upload')"></i>`
                else subjectTitleE.innerHTML = `<h2>${block.subject.prettyName} (${block.class.prettyName})</h2><i class="far fa-file-upload teachers-only" onclick="toggleModal('upload')"></i>`
                
                let subjectContentE = document.createElement('div')
                subjectE.appendChild(subjectContentE)
                subjectContentE.classList.add('subject-content')

                let wordFormats = ['doc','dot','wbk','docx','docm','dotx','dotm','docb']
                let pptFormats = ['ppt','pot','pps','pptx','pptm','potx','potm','ppam','ppsx','ppsm','sldx','sldm']
                let excelFormats = ['xls','xlt','xlm','xlsx','xlsm','xltx','xltm','xlsb','xla','xlam','xll','xlw']
                let imageFormats = ['png','jpg','jpeg','webp','gif','tif','tiff','psd','raw','arw','cr2','nrw','k25','bmp','dib','heif','heic','ind','indd','indt','jp2','j2k','jpf','jpx','jpm','svg','svgz','ai','eps','mj2','jpe','jif','jfif','jfi']
                let videoFormats = ['webm','mkv','flv','vob','ogv','drc','gifv','mng','avi','mts','ts','m2ts','mov','qt','wmv','yuv','rm','rmvb','asf','amv','mp4','m4p','m4v','mpg','mp2','mpeg','mpe','mpv','m2v','svi','3gp','3g2','mxf','roq','nsv','flv','f4v','f4p','f4a','f4b']
                let audioFormats = ['aa','aac','aax','act','aiff','alac','amr','ape','au','awb','dct','dss','dvf','flac','gsm','iklax','ivs','m4a','m4b','m4p','mmf','mp3','mpc','msv','nmf','ogg','oga','mogg','opus','ra','rf64','sln','tta','voc','vox','wav','wma','wv','8svx','cda']
                let archiveFormats = ['a','ar','cpio','shar','lbr','iso','lbr','mar','sbx','tar','bz2','f','?xf','gz','lz','lz4','lzma','lzo','rz','sfark','sz','?q?','?z?','xz','z','zst','??_','7z','s7z','ace','afa','alz','apk','arc','ark','cdx','arj','b1','b6z','ba','bh','cab','car','cfs','cpt','dar','dd','dgc','dmg','ear','gca','ha','hki','ice','jar','kgb','lzh','lha','lzx','pak','partimg','paq','paq1','paq2','paq3','paq4','paq5','paq6','paq7','paq8','paq9','pea','pim','pit','qda','rar','rk','sda','sea','sen','sfx','shk','sit','sitx','sqx','tag.gz','.tgz','tar.z','tar.bz2','tbz2','tar.lz','tlz','tar.xz','txz','uc','uc0','uz2','ucn','ur2','ue2','uca','uha','war','wim','xar','xp3','yz1','zip','zipx','zoo','zpaq','zz','ecc','ecsbx','par','par2','rev']
                let programmingFormats = ['html','css','sass','scss','js','jsx','htm','c','h','cpp','cs','hta','json','xml','xaml','yml','dat','dat.old','properties','conf','cfg','vb','vbs','java','class']

                block.files.forEach(file => {
                    let fileE = document.createElement('a')
                    subjectContentE.appendChild(fileE)
                    let prettySize = file.display.byteSize
                    Math.round(((prettySize / 1073741824) + Number.EPSILON) * 100) / 100
                    if (prettySize >= 1073741824) prettySize = `${Math.round(((prettySize / 1073741824) + Number.EPSILON) * 100) / 100}GiB`
                    else if (prettySize >= 1048576) prettySize = `${Math.round(((prettySize / 1048576) + Number.EPSILON) * 100) / 100}MiB`
                    else if (prettySize >= 1024) prettySize = `${Math.round(((prettySize / 1024) + Number.EPSILON) * 100) / 100}KiB`
                    else prettySize = `${prettySize}B`
                    let fileExt = file.name.slice(file.name.indexOf('.') + 1, file.name.length).toLowerCase()

                    if (wordFormats.find(e => e == fileExt)) icon = '-word'
                    else if (pptFormats.find(e => e == fileExt)) icon = '-powerpoint'
                    else if (excelFormats.find(e => e == fileExt)) icon = '-excel'
                    else if (imageFormats.find(e => e == fileExt)) icon = '-image'
                    else if (videoFormats.find(e => e == fileExt)) icon = '-video'
                    else if (audioFormats.find(e => e == fileExt)) icon = '-music'
                    else if (fileExt == 'pdf' ) icon = '-pdf'
                    else if (fileExt == 'txt' || fileExt == 'rtf' ) icon = '-alt'
                    else if (archiveFormats.find(e => e == fileExt)) icon = '-archive'
                    else if (programmingFormats.find(e => e == fileExt)) icon = '-code'
                    else icon = ''
                    fileE.outerHTML = `
                        <a class="file" download uuid="${file.uuid}" href="/resources/download/${file.uuid}" title="Size: ${prettySize}">
                            <i class="fad fa-file${icon}"></i>
                            <div class="details">
                                <p>${file.display.name}</p>
                                <p class="mobile-only">Size: ${prettySize}B</p>
                            </div>
                        </a>
                    `
                })
            })
            // animateFiles(0)
            $$('.file').forEach(e => {
                e.addEventListener('contextmenu', function(e) {
                    e.preventDefault()
                    let file = this
                    qAlert({ message: `[{(resources.deleteConfirmation.before)}]"${file.querySelector('p:nth-child(1)').innerText}"[{(resources.deleteConfirmation.after)}]`, mode: 'question', buttons: { ok: { text: '[{(yes)}]' }, cancel: { text: '[{(no)}]' } } })
                        .then(a => {
                            if (a) fetch('/teachers/resources/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ uuid: file.getAttribute('uuid') })
                            })
                                .then(res => res.json())
                                .then(res => {
                                    if (res.message == 'ok') {
                                        qAlert({ message: '[{(success.resources.delete)}]', mode: 'success', buttons: { cancel: { invisible: true } } })
                                        location.reload()
                                    } else qAlert({ message: '[{(error.unknown)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
                                })
                        })
                })
            })
            $$('.file i').forEach(e => { e.style.transform = `rotate(${random(-7, 7)}deg)`; e.parentElement.style.animationPlayState = 'running'}) })
        .catch(e => console.error(e))
}
function uploadFile() {
    let maxSize = parseInt($('.upload-input').getAttribute('max-size'))
    if ($('.upload-input').files[0] == null) return qAlert({ message: "[{(noFileSelected)}]", mode: "error", buttons: { cancel: { invisible: true } } })
    let fileSize = $('.upload-input').files[0].size
    if (fileSize > maxSize || fileSize == 0) return
    let data = new FormData()
    data.append('file', $('.upload-input').files[0])
    data.append('data', JSON.stringify({
        classID: parseInt($('.class input:checked').value),
        subjectID: parseInt($('#subject-chooser').value)
    }))
    fetch('/teachers/resources/upload', { method: 'POST', body: data })
        .then(res => res.json())
        .then(res => {
            if (res.message == 'ok') qAlert({ message: '[{(success.resources.upload)}]', mode: 'success', buttons: { cancel: { invisible: true } } }).then(() => window.location.reload())
            else return qAlert({ message: '[{(error.unknown.doNotRetry)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
        })
}
window.addEventListener('load', () => { setPageTitle("folders", "[{(resources)}]"); setActiveTab(4) })
window.addEventListener('toggle-modal-upload', () => {
    if (userInfo.role == "teacher") {
        fetch('/teachers/getInfo', { method: "POST" })
            .then(res => res.json()
            .then(res => {
                data = res
                console.log(data)
                let myClasses = $('#my-classes')
                myClasses.innerHTML = ""
                data.forEach(clas => {
                    let clasE = document.createElement('li')
                    myClasses.appendChild(clasE)
                    clasE.outerHTML = `<li class="class"><input type="radio" oninput="update(this.value)" id="class-${clas.classID}" name="class" value="${clas.classID}"><label for="class-${clas.classID}">${clas.className}</label></li>`
                })
            }))
            .catch(e => console.error(e))
    }
    update = updateID => {
        if (!updateID) return
        updateID = parseInt(updateID)
        let subjectChooser = $('#subject-chooser')
        data.forEach(clas => {
            if (clas.classID == updateID) {
                subjectChooser.innerHTML = ''
                clas.subjects.forEach(subject => {
                    subjectE = document.createElement('option')
                    subjectChooser.appendChild(subjectE)
                    subjectE.outerHTML = `<option value="${subject.subjectID}">${subject.subjectName}</option>`
                })
            }
        })
        $('.subject-chooser-div').style = ""
    }
    /*submit = () => {
        let sendData = { name: $('#event-name').value, description: $('#event-description').value, date: {} }
        sendData.date.year = parseInt($('#event-date').value.split("-")[0])
        sendData.date.month = parseInt($('#event-date').value.split("-")[1])
        sendData.date.day = parseInt($('#event-date').value.split("-")[2])
        if (userInfo.role == "teacher") {
            if ($('#forMyStudentsAndMe').checked) {
                sendData.teacherMode = "forMyStudentsAndMe"
                sendData.visibleTo = []
                $$('#students-in-class input').forEach(e => {
                    if (e.checked) sendData.visibleTo.push(parseInt(e.getAttribute('studentID')))
                })
            } else sendData.teacherMode = "justForMe"
        }
        if (sendData.name && sendData.description && sendData.date.year != NaN && sendData.date.month != NaN && sendData.date.day != NaN && (!sendData.visibleTo || sendData.visibleTo.length > 0)) {
            fetch('/misc/events/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sendData)
            })
                .then(res => res.json())
                .then(res => {
                    if (res.message == 'ok') qAlert({ message: "[{(success.eventSubmit)}]", mode: 'success', buttons: { cancel: { invisible: true } } }).then(ans => { if (ans == true) toggleModal('new-event'); updateEvents() })
                    if (res.message == 'not ok') qAlert({ message: "[{(error.unknown)}]", mode: 'error', buttons: { ok: { text: '[{(retry)}]' }, cancel: { text: "[{(doNotRetry)}]" } } }).then(ans => { if (ans == true) submit() })
                })
                .catch(() => { qAlert({ message: "[{(error.unknown.retry)}]", mode: 'error', buttons: { ok: { text: '[{(retry)}]' }, cancel: { text: "[{(doNotRetry)}]" } } }).then(ans => { if (ans == true) submit() })})
        } else qAlert({ message: "[{(error.invalidInput)}]", mode: 'error', buttons: { cancel: { invisible: true } } })
    }*/
})