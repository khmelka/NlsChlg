const express = require('express')
const app = express()
const Nylas = require('nylas');
require('dotenv').config();
const schedule = require('node-schedule')

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const ACCESS_TOKEN = process.env.ACCESS_TOKEN

Nylas.config({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
});
const nylas = Nylas.with(ACCESS_TOKEN);
  
schedule.scheduleJob('0 0 * * *', updateLabels)

function updateLabels() {
    nylas.labels.list().then(labels => {
        const newsLabel = labels.find(label => label.displayName === 'newsletters')
        nylas.messages.list().then(messages => {
            messages.forEach(message => {
                const labels = message.labels.map(label => label.displayName)
                if (labels.includes('autoarchive')){
                    message.labels = message.labels.filter(label => {
                        label.displayName !== 'autoarchive'
                    })
                    message.labels.push(newsLabel)
                    message.save()
                }
            })
        }).catch(error => console.error(error.message))
    }).catch(error => console.error(error.message))
}



const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));