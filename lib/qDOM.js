function getTemplate(templateName, parameters) {
    if (templateName === (undefined || null) || $('#templates') === undefined) return
    let template = $(`#templates #${templateName}`).innerHTML
    if (parameters) {
        template = template.toString()
        Object.keys(parameters).forEach(parameter => template = template.split(`%${parameter}%`).join(parameters[parameter]))
    }
    return template
}
function createElement({ type, classes, id, innerContent, parameters }) {
    if (!type) return
    let element = document.createElement(type)
    if (classes) element.classList.add(...classes)
    if (id) element.id = id
    if (innerContent && innerContent.type && innerContent.content) {
        if (innerContent.type.toLowerCase() == 'html') element.innerHTML = innerContent.content
        else element.innerText = innerContent.content
    }
    if (parameters) Object.keys(parameters).forEach(parameter => element.setAttribute(parameter, parameters[parameter]))
    return element
}