function updateConfigByMutatingFirst() {
    if (data0.type === 'bar')
        data0.type = 'line'
    else if (data0.type === 'line') {
        data0.type = 'bubble'
    } else {
        data0.type = 'bar'
    }

    chart0.destroy()
    chart0 = new Chart(chartCtx0, data0)
}

function updateConfigByMutatingSecond() {
    if (data1.type === 'polarArea')
        data1.type = 'pie'
    else if (data1.type === 'pie') {
        data1.type = 'doughnut'
    } else if (data1.type === 'doughnut'){
        data1.type = 'radar'
    } else {
        data1.type = 'polarArea'
    }

    chart1.destroy()
    chart1 = new Chart(chartCtx1, data1)
}

function updateConfigByMutatingThird() {
    if (data2.type === 'pie')
        data2.type = 'doughnut'
    else if (data2.type === 'doughnut') {
        data2.type = 'pie'
    } else {
        data2.type = 'pie'
    }

    chart2.destroy()
    chart2 = new Chart(chartCtx2, data2)
}
