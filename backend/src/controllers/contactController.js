const customerSupportModel = require('../models/customerSupportModel');
const emailService = require('../services/emailService');


const saveMessage = (req, res) =>{
    if (!Object.prototype.hasOwnProperty.call(req.body, 'message')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a message property'
    });

    if (!Object.prototype.hasOwnProperty.call(req.body, 'email')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a email property'
    });
    let timestamp = (new Date()).valueOf();
    const contact = {
        "email": req.body.email,
        "message": req.body.message,
        "supportStatus": "open",
        "timeStamp" : timestamp,
    };

    customerSupportModel.create(contact).then(() => {
        emailService.contactUs(req.body.email, req.body.firstName);
        return res.status(200).json({});
    }).catch(error => {
        console.log('error happened by creating customerSupport');
        return res.status(400).json({error: error })
    })


};

module.exports = {
    saveMessage
};