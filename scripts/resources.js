function load() {
    fetch(`/${userInfo.role}s/resources/get`, { method: 'POST' }).then(res => res.json())
        .then(res => {
            if (res.length != 0) $('#files').innerHTML = ''
            res.forEach(block => {
                let subjectE = document.createElement('div')
                $('#files').appendChild(subjectE)
                subjectE.classList.add('subject')
                
                let subjectTitleE = document.createElement('div')
                subjectE.appendChild(subjectTitleE)
                subjectTitleE.classList.add('subject-title')
                if (userInfo.role == "student") subjectTitleE.innerHTML = `<h2>${block.subject.prettyName}</h2>`
                else subjectTitleE.innerHTML = `<h2>${block.subject.prettyName} (${block.class.prettyName})</h2>`
                
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
                let programmingFormats = ['html','css','sass','scss','js','jsx','htm','c','h','cpp','cs','hta','json','xml','xaml','yml','dat','dat.old','properties','conf','cfg','vb','vbs','java','class','git','gitignore']
                let textFormats = ['txt','rtf','md']

                block.files.forEach(file => {
                    let fileE = document.createElement('a')
                    subjectContentE.appendChild(fileE)
                    let prettySize = file.display.byteSize
                    if (prettySize >= 1073741824) prettySize = `${Math.round(((prettySize / 1073741824) + Number.EPSILON) * 100) / 100}Gi`
                    else if (prettySize >= 1048576) prettySize = `${Math.round(((prettySize / 1048576) + Number.EPSILON) * 100) / 100}Mi`
                    else if (prettySize >= 1024) prettySize = `${Math.round(((prettySize / 1024) + Number.EPSILON) * 100) / 100}Ki`
                    else prettySize = `${prettySize}B`

                    let fileExt = file.name.slice(file.name.indexOf('.') + 1, file.name.length).toLowerCase()
                    let icon = ''
                    let fileType = 'Unknown'
                    if (wordFormats.find(e => e == fileExt)) { icon = '-word'; fileType = 'Word Document' }
                    else if (pptFormats.find(e => e == fileExt)) { icon = '-powerpoint'; fileType = 'PowerPoint Presentation' }
                    else if (excelFormats.find(e => e == fileExt)) { icon = '-excel'; fileType = 'Excel Spreadsheet' }
                    else if (imageFormats.find(e => e == fileExt)) { icon = '-image'; fileType = 'Image' }
                    else if (videoFormats.find(e => e == fileExt)) { icon = '-video'; fileType = 'Video' }
                    else if (audioFormats.find(e => e == fileExt)) { icon = '-music'; fileType = 'Audio' }
                    else if (fileExt == 'pdf' ) icon = '-pdf'
                    else if (fileExt == 'txt' || fileExt == 'rtf' ) icon = '-alt'
                    else if (archiveFormats.find(e => e == fileExt)) icon = '-archive'
                    else if (programmingFormats.find(e => e == fileExt)) icon = '-code'
                    else if (textFormats.find(e => e == fileExt)) icon = '-alt'
                    else icon = ''

                    fileE.outerHTML = `
                        <a class="file" download style="animation-play-state: running;" uuid="${file.uuid}" href="/resources/download/${file.uuid}" title="Size: ${prettySize}\nType: ${fileType}">
                            <i class="fad fa-file${icon}"></i>
                            <div class="details">
                                <p>${file.display.name}</p>
                                <p class="mobile-only size">Size: ${prettySize}</p><p class="mobile-only separator">|</p><p class="mobile-only type">Type: ${fileType}</p>
                            </div>
                        </a>
                    `
                })
            })
            if (userInfo.role == "teacher") $$('.file').forEach(e => {
                e.addEventListener('contextmenu', function(e) {
                    e.preventDefault()
                    let file = this
                    qAlert({ message: `[{(resources.deleteConfirmation.before)}]"${file.querySelector('p:nth-child(1)').innerText}"[{(resources.deleteConfirmation.after)}]`, mode: 'question', buttons: { ok: { text: '[{(yes)}]' }, cancel: { text: '[{(no)}]' } } })
                        .then(a => {
                            if (a) fetch('/teachers/resources/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ uuid: file.getAttribute('uuid') })
                            }).then(res => res.json())
                                .then(res => {
                                    if (res.message == 'ok') {
                                        qAlert({ message: '[{(success.resources.delete)}]', mode: 'success', buttons: { cancel: { invisible: true } } })
                                        location.reload()
                                    } else qError({ goBack: false })
                                })
                        })
                })
            })
            if (userInfo.role != "teacher") $$('.teachers-only').forEach(e => e.remove())
        })
        .catch(e => console.error(e))
}
function uploadFile() {
    let maxSize = parseInt($('.upload-input').getAttribute('max-size'))
    if ($('.upload-input').files[0] == null) return qAlert({ message: "[{(error.noFileSelected)}]", mode: "error", buttons: { cancel: { invisible: true } } })
    if (!$('.class input:checked')) return qAlert({ message: "[{(error.invalidInput)}]", mode: 'error', buttons: { cancel: { invisible: true } } })
    let fileSize = $('.upload-input').files[0].size
    if (fileSize > maxSize || fileSize == 0) return
    let data = new FormData()
    data.append('file', $('.upload-input').files[0])
    data.append('data', JSON.stringify({
        classID: parseInt($('.class input:checked').value),
        subjectID: parseInt($('#subject-chooser').value)
    }))
    fetch('/teachers/resources/upload', { method: 'POST', body: data }).then(res => res.json())
        .then(res => {
            if (res.message == 'ok') qAlert({ message: '[{(success.resources.upload)}]', mode: 'success', buttons: { cancel: { invisible: true } } }).then(() => window.location.reload())
            else return qAlert({ message: '[{(error.unknown)}]', mode: 'error', buttons: { cancel: { invisible: true } } })
        })
        .catch(e => qError({ message: e, goBack: true }))
}
window.addEventListener('load', () => {
    setPageTitle("folders", "[{(resources)}]")
    setActiveTab(3)
})
window.addEventListener('toggle-modal-upload', () => {
    if ($('#upload-modal').style.display == "none") return
    if (userInfo.role == "teacher") {
        fetch('/teachers/getInfo', { method: "POST" }).then(res => res.json())
            .then(res => {
                data = res
                let myClasses = $('#my-classes')
                myClasses.innerHTML = ''
                data.forEach(clas => {
                    let clasE = document.createElement('li')
                    myClasses.appendChild(clasE)
                    clasE.outerHTML = `<li class="class"><input type="radio" oninput="update(this.value)" id="class-${clas.classID}" name="class" value="${clas.classID}"><label for="class-${clas.classID}">${clas.className}</label></li>`
                })
            })
            .catch(e => qError({ message: e, goBack: true }))
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
})