exports.port = 8888
let target = null
target = 'http://172.16.202.10:18082'
target = 'http://192.168.4.230:30080'
exports.target = target
const proxy = {}
const services = [
    'gateway',
    'base',
    'user',
    'workflow',
    'job',
]
services.forEach(item => {
    proxy['/' + item] = {
        target: target,
    }
})
exports.proxy = proxy
