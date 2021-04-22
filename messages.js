const dayjs = require('dayjs');
// dayjs.format();


const formatMessage = (author,message) =>{
    return {
        author,
        message,
        time: dayjs().format('h:mm a')
    }
}

module.exports = formatMessage;