const customerModel = require('../models/customer');
const tutorialModel = require('../models/tutorial');
const tutorModel = require('../models/tutor');
const reviewModel = require('../models/review');
const emailService = require('../services/emailService');

const getTutorialsForCustomer = (req, res) => {
    const email = req.email;
    tutorialModel.find({ customerEmail: email })
        .then(tutorials => {
            return res.status(200).json(tutorials);
        })
        .catch(error => {
            console.log('internal server error by searching');
            return req.status(400).json({ error: error.message })
        })
};

const getCustomerProfile = (req, res) => {
    if (req.userType === 'customer') {
        customerModel.findOne({ email: req.email }).exec()
            .then(customer => {
                return res.status(200).json({
                    email: customer.email,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    university: customer.university,
                })
            })
    } else
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Wrong user type'
        });
};

const searchCustomerByEmail = (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.query, 'q'))
        return res.status(200).json({
            error: 'Bad Request',
            message: 'The request query must contain a q property'
        });
    if (!req.query.q)
        return res.status(200).json({});
    const customerEmail = decodeURI(req.query.q);
    customerModel.findOne({ email: customerEmail }).exec()
        .then(customer => {
            return res.status(200).json({
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                university: customer.university,
            })
        }).catch(error => {
            return res.status(404).json({
                error: 'Customer not found',
                message: error.message
            })
        })
};

const uploadCustomerProfile = (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.body, 'email')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a email property'
    });
    if (req.body.email !== req.email)
        return res.status(400).json({
            error: 'Bad Request',
            message: 'No permission to upload other profile'
        });
    if (req.userType === 'customer') {
        if (!Object.prototype.hasOwnProperty.call(req.body, 'firstName')) return res.status(400).json({
            error: 'Bad Request',
            message: 'The request body must contain a firstName property'
        });

        if (!Object.prototype.hasOwnProperty.call(req.body, 'lastName')) return res.status(400).json({
            error: 'Bad Request',
            message: 'The request body must contain a lastName property'
        });

        if (!Object.prototype.hasOwnProperty.call(req.body, 'university')) return res.status(400).json({
            error: 'Bad Request',
            message: 'The request body must contain a university property'
        });

        const customer = Object.assign({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            university: req.body.university,
        });
        customerModel.updateOne({ email: customer.email }, customer).then(() => {
            return res.status(200).json({ message: "successfully updated" });
        }).catch(error => {
            console.log('error by creating a customer Profile');
            if (error.code === 11000) {
                return res.status(400).json({
                    error: 'customer Profile exists',
                    message: error.message
                })
            }
            else {
                return res.status(500).json({
                    error: 'Internal server error happens by add customer Profile',
                    message: error.message
                })
            }
        });
    }
};


const createReview = (req, res) => {

    let verificationResult = verifyReviewBody(req);

    if (!verificationResult.ifValid) {
        return res.status(400).json(verificationResult.message);
    }


    let overallRating = Math.round((req.body.comprehensionRating + req.body.friendlinessRating + req.body.teachingStyleRating) / 3);

    let review = Object.assign({
        comprehensionRating: req.body.comprehensionRating,
        friendlinessRating: req.body.friendlinessRating,
        teachingStyleRating: req.body.teachingStyleRating,
        text: req.body.text,
        overallRating: overallRating,
        tutorEmail: req.body.tutorEmail,
        customerEmail: req.body.customerEmail
    });

    reviewModel.create(review).then(
        review => {
            let error = updateReviewForCustomer(req.email, review._id);
            if (!error) {
                error = updateReviewForTutor(req.body.tutorEmail, review._id);
                error = !error && updateReviewInTutorial(req.body.tutorialId, review._id);
                if (!error) {
                    error = updateRatingForTutor(req.body.tutorEmail);
                    emailService.emailNotification(req.body.tutorEmail, req.body.tutorFirstName, "New Feedback Received", emailService.reviewTutorial);
                    if (!error) {
                        return res.status(200).json(review);
                    }
                }
            }
            console.log(error);
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Internal server error happened when create a new review ' + error.message
            });
        }
    ).catch(error => {
        console.log(error);
        return res.status(404).json({
            error: 'Review Not Created',
            message: error.message
        });
    })


};

const updateReview = (req, res) => {

    const {
        reviewId,
    } = req.params;

    if (!reviewId) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a reviewId parameter'
    });

    let verificationResult = verifyReviewBody(req);

    if (!verificationResult.ifValid) {
        return res.status(400).json(verificationResult.message);
    }

    let overallRating = Math.round((req.body.comprehensionRating + req.body.friendlinessRating + req.body.teachingStyleRating) / 3);

    let review = Object.assign({
        comprehensionRating: req.body.comprehensionRating,
        friendlinessRating: req.body.friendlinessRating,
        teachingStyleRating: req.body.teachingStyleRating,
        text: req.body.text,
        overallRating: overallRating,
        tutorEmail: req.body.tutorEmail,
        customerEmail: req.body.customerEmail
    });

    reviewModel.updateOne({ _id: reviewId }, review).then(
        review => {
            let error = updateRatingForTutor(req.body.tutorEmail);
            if (!error) {
                return res.status(200).json(review);
            }
            console.log(error);
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Internal server error happened when create a new review ' + error.message
            });
        }
    ).catch(error => {
        console.log(error);
        return res.status(404).json({
            error: 'Review Not Found',
            message: error.message
        });
    })

};

const getReview = (req, res) => {
    const {
        reviewId,
    } = req.params;

    if (!reviewId) return res.status(400).json({
        error: 'Bad Request',
        message: 'The path must contain a reviewId parameter'
    });

    reviewModel.findById(reviewId).then(
        review => {
            return res.status(200).json(review);
        }
    ).catch(error => {
        console.log(error);
        return res.status(404).json({
            error: 'Review Not Found',
            message: error.message
        });
    })

};

const verifyReviewBody = (req) => {

    if (!Object.prototype.hasOwnProperty.call(req.body, 'tutorEmail')) {
        return {
            ifValid: false,
            message: {
                error: 'Bad Request',
                message:
                    'The request body must contain a tutorEmail property'
            }
        };
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, 'tutorialId')) {
        return {
            ifValid: false,
            message: {
                error: 'Bad Request',
                message:
                    'The request body must contain a tutorialId property'
            }
        };
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, 'comprehensionRating')) {
        return {
            ifValid: false,
            message: {
                error: 'Bad Request',
                message: 'The request body must contain a comprehensionRating property'
            }
        };
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, 'friendlinessRating')) {
        return {
            ifValid: false,
            message: {
                error: 'Bad Request',
                message: 'The request body must contain a friendlinessRating property'
            }
        };
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, 'teachingStyleRating')) {
        return {
            ifValid: false,
            message: {
                error: 'Bad Request',
                message: 'The request body must contain a teachingStyleRating property'
            }
        };
    }

    if (!Object.prototype.hasOwnProperty.call(req.body, 'text')) {
        return {
            ifValid: false,
            message: {
                error: 'Bad Request',
                message: 'The request body must contain a text property'
            }
        };
    }

    return {
        ifValid: true
    }
};

const updateReviewForTutor = (email, reviewId) => {
    tutorModel.updateOne({ email: email }, { $push: { reviewIds: reviewId } }).exec().catch(error => {
        console.log('error by adding a review id to the tutor');
        return error;
    });

};

const updateReviewInTutorial = (_id, reviewId) => {
    tutorialModel.updateOne(
        { _id },
        {
            reviewId,
            tutorialStatus: 'reviewed'
        }).exec().catch(error => {
            console.log('error by adding a review id to the tutor');
            return error;
        });
    return false;
};

const updateRatingForTutor = (email) => {
    tutorModel.findOne({ email: email }).exec().then(
        tutor => {
            let reviewIds = tutor.reviewIds;
            let sumOverallRating = 0;
            reviewModel.find().where('_id').in(reviewIds).exec().then(reviews => {
                for (let i = 0; i < reviews.length; i++) {
                    sumOverallRating += reviews[i].overallRating;
                }
                tutorModel.updateOne({ email: email }, { $push: { rating: Math.round(sumOverallRating / reviews.length) } }).exec();
            });
        }
    ).catch(error => {
        console.log('error by update rating to the tutor');
        return error;
    });

};


const updateReviewForCustomer = (email, reviewId) => {
    customerModel.updateOne({ email: email }, { $push: { reviewIds: reviewId } }).exec().catch(error => {
        console.log('error by adding a review id to the customer');
        return error;
    });
};
module.exports = {
    getTutorialsForCustomer,
    getCustomerProfile,
    uploadCustomerProfile,
    createReview,
    updateReview,
    getReview,
    searchCustomerByEmail,
};