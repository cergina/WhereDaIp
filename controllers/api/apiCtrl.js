// controller is usually a callback function that corresponds to routers
// to handle requests. 
const configuration = require('../../config/config-nonRestricted.js')

const test = (req, res) => {
    res.json({ a: 1 });
}

const fake = (req, res) => {
    res.json({
        type: 'bar', // bar, pie, horizontalBar, line, doughnut, radar, polarArea
        data: {
            labels: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford'],
            datasets: [{
                label: 'Covid-19',
                data: [
                    5,
                    2,
                    1,                        
                    11,
                    8,
                    0
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderWidth: 1,
                borderColor: '#777',
                hoverBorderColor: '#000'
            }]
        },
        // end of data
        options: {
            layout:{
                padding:{
                    left:0,right:0,
                    bottom:0,top:0
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Test fake'
                }
            }
        }
    });
}



module.exports = {
    test, fake
}
