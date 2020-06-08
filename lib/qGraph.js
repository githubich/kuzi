var qGraph = {}

function drawLineFromToOn(x1, y1, x2, y2, c) {
    c.beginPath()
    c.shadowBlur = 10
    c.moveTo(x1, y1)
    c.lineTo(x2, y2)
    c.stroke()
}

qGraph.graph = class {
    constructor(canvas) {
        if (!canvas || canvas.nodeName.toLowerCase() !== "canvas") throw Error("A canvas must be specified when creating a new graph")
        let c = canvas.getContext('2d')
        let accent = ""
        let data = []
        let margin = 12
        let maximum = 0
        this.setAccent = accentF => {
            if (accentF && (accentF.length == 7 || accentF.length == 9)) { accent = accentF; this.redraw() }
        }
        this.setData = dataF => {
            if (dataF) { data = dataF; this.redraw(this.data) }
        }
        this.setSize = (width, height) => {
            if (height) canvas.height = height
            if (width) canvas.width = width
            if (height || width) this.redraw()
        }
        this.setMaximum = maximumF => {
            if (maximumF) { maximum = maximumF; this.redraw() }
        }
        this.redraw = () => {
            if (!data) return
            let usableHeight = canvas.offsetHeight - ( margin * 2 )
            let usableWidth = canvas.offsetWidth - ( margin * 2 )
            c.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
            let stepX = usableWidth / ( data.length - 1)
            let stepYhigher = maximum || 0
            let i = 0
            if (!maximum) {
                data.forEach(coord => {
                    if (!coord.includes(',')) data[i] = `${i},${data[i]}`
                    i++
                })
                i = 0
            }
            data.forEach(coord => {
                if (parseFloat(coord.split(',')[1]) > stepYhigher) stepYhigher = parseFloat(coord.split(',')[1])
            })
            let stepY = stepYhigher / usableHeight
            i = 0
            data.forEach(coord => {
                try {
                    c.strokeStyle = accent
                    c.fillStyle = accent
                    c.shadowColor = accent + "7a"
                    c.shadowBlur = 8
                    c.lineThickness = 1
                    drawLineFromToOn(
                        (parseInt(coord.split(',')[0]) * stepX) + margin,
                        (canvas.offsetHeight - (parseInt(coord.split(',')[1]) / stepY)) - margin,
                        (parseInt(data[i + 1].split(',')[0]) * stepX) + margin,
                        (canvas.offsetHeight - (parseInt(data[i + 1].split(',')[1]) / stepY)) - margin,
                        c
                    )
                } catch {}
                i++
            })
        }
    }
}