const tutorialModel = require('../models/tutorialModel');
const tutorModel = require('../models/tutorModel');
const emailService = require('../services/emailService');
const requestBodyVerificationService = require('../services/requestBodyVerificationService');

const getTutorProfile = (req, res) => {
    if (req.userType === 'tutor') {
        tutorModel.findOne({ email: req.email }).exec()
            .then(tutor => {
                return res.status(200).json({
                    email: tutor.email,
                    firstName: tutor.firstName,
                    lastName: tutor.lastName,
                    university: tutor.university,
                    price: tutor.price,
                    description: tutor.description,
                    courses: tutor.courses,
                    timeSlotIds: tutor.timeSlotIds,
                    avatar: tutor.avatar,
                })
            })
    }
    else
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid userType value'
        });
};

const getTutorProfileById = (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.query, '_id')) return res.status(400).json({
        error: 'Bad Request',
        message: 'The request body must contain a _id property'
    });
    tutorModel.findOne({ _id: req.query._id }).exec()
        .then(tutor => {
            return res.status(200).json({
                email: tutor.email,
                firstName: tutor.firstName,
                lastName: tutor.lastName,
                university: tutor.university,
                price: tutor.price,
                description: tutor.description,
                courses: tutor.courses,
                timeSlotIds: tutor.timeSlotIds,
                avatar: tutor.avatar,
                rating: tutor.rating
            })
        }).catch(error => {
            return res.status(404).json({
                error: 'Tutor not found',
                message: error.message
            })
        })
};

const uploadTutorProfile = (req, res) => {
    let verificationResult = requestBodyVerificationService.verifyRequestBody(
        [
            "email",
            "firstName",
            "lastName",
            "university",
            "description"
        ], req);

    if (!verificationResult.ifValid) {

        return res.status(400).json(verificationResult.message);

    }

    if (req.body.email !== req.email)
        return res.status(400).json({
            error: 'Bad Request',
            message: 'No permission to upload other profile'
        });
    if (req.userType === 'tutor') {


        const tutor = Object.assign({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            university: req.body.university,
            price: req.body.price,
            description: req.body.description,
            courses: req.body.courses,
            timeSlotIds: req.body.timeSlotIds,
            avatar: req.body.avatar,
        });

        tutor.timeSlotIds = sortOnTimeSlots(tutor.timeSlotIds);
        tutorModel.updateOne({ email: tutor.email }, tutor)
            .then(
                () => {
                    return res.status(200)
                        .json({
                            message: "successfully updated"
                        });
                }
            )
            .catch(
                error => {
                    console.log('error by creating a Tutor Profile');
                    if (error.code === 11000) {
                        return res.status(400).json({
                            error: 'tutor Profile exists',
                            message: error.message
                        }
                        )
                    }
                    else {
                        return res.status(500).json({
                            error: 'Internal server error happens by add tutor Profile',
                            message: error.message
                        })
                    }
                });
    }
};

const sortOnTimeSlots = (timeSlotIds) => {
    let combinedTimeSlotIds = [];
    timeSlotIds = timeSlotIds.sort(function (x, y) {
        return x.start - y.start;
    });

    let tempTimeSlot = {};

    if (timeSlotIds.length > 1) {
        tempTimeSlot = timeSlotIds[0];
    }
    for (let i = 0; i < timeSlotIds.length - 1; i++) {
        if (!timeSlotIds[i].ifBooked) {
            if (timeSlotIds[i].end === timeSlotIds[i + 1].start
                && timeSlotIds[i].ifBooked === timeSlotIds[i + 1].ifBooked) {
                tempTimeSlot.end = timeSlotIds[i + 1].end
            } else {
                combinedTimeSlotIds.push(tempTimeSlot);
                tempTimeSlot = timeSlotIds[i + 1];
            }
        } else {
            // if the time slot is booked, we push it directly in
            combinedTimeSlotIds.push(tempTimeSlot);
            tempTimeSlot = timeSlotIds[i + 1];
        }

        if (i === timeSlotIds.length - 2) {
            combinedTimeSlotIds.push(tempTimeSlot);
        }
    }
    if (timeSlotIds.length === 1) {
        combinedTimeSlotIds = timeSlotIds;
    }
    return combinedTimeSlotIds;
};

const confirmTutorial = async (req, res) => {

    let verificationResult = requestBodyVerificationService.verifyRequestBody(
        [
            "_id",
            "status",
            "customerFirstName",
            "customerEmail",
            "description"
        ], req);

    if (!verificationResult.ifValid) {

        return res.status(400).json(verificationResult.message);

    }

    if (req.body.status === 'confirmed') {
        tutorialModel.updateOne(
            { _id: req.body._id }, { tutorialStatus: req.body.status }
        ).then(tutorial => {
            emailService.emailNotification(
                req.body.customerEmail, req.body.customerFirstName, 'Tutorial Session Confirmed', emailService.confirmTutorial
            );
            return res.status(200).json({
                tutorial: tutorial,
            });
        }).catch(error => {
            console.log('error by creating a tutorial');
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            })
        });
    }
};

const getTutorialsForTutor = (req, res) => {
    const email = req.email;
    tutorialModel.find(
        { tutorEmail: email }
    ).then(tutorials => {
        return res.status(200).json(tutorials)
    }).catch(error => {
        console.log('internal server error by searching');
        return res.status(400).json({ error: error.message })
    })
};

const searchTutor = (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.query, 'q'))
        return res.status(200).json({
            error: 'Bad Request',
            message: 'The request query must contain a q property'
        });
    if (!req.query.q)
        return res.status(200).json({});

    const queryString = decodeURI(req.query.q);
    tutorModel.find(
        { $text: { $search: queryString } }
    ).then(tutors => {
        return res.status(200).json(tutors);
    }).catch(error => {
        console.log('internal server error by searching');
        return res.status(400).json({
            error: 'Internal Server Error',
            message: 'Error in Search function: ' + error.message
        });
    })
};

const autoCompleteForSearch = (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.query, 'q'))
        return res.status(200).json({
            error: 'Bad Request',
            message: 'The request query must contain a q property'
        });

    const queryString = req.query.q;
    const pattern = new RegExp(`${queryString}`, 'i');

    Promise.all([
        tutorModel.distinct('courses'),
        tutorModel.find(
            { $or: [{ 'firstName': pattern }, { 'lastName': pattern }] },
            { firstName: true, lastName: true, _id: false }
        )
    ]).then((values) => {
        let filteredCourses = values[0].reduce((matches, c) => {
            if (pattern.test(c)) {
                matches.push(c);
            }
            return matches;
        }, []);
        let filteredTutorName = values[1].reduce((matches, tN) => {
            const { firstName, lastName } = tN;
            matches.push(lastName + ', ' + firstName);
            return matches;
        }, []);
        return res.status(200).json([
            ...filteredCourses,
            ...filteredTutorName
        ]);
    }).catch((error) => {
        console.log('internal server error by auto complete function for searching');
        return res.status(400).json({
            error: 'Internal Server Error',
            message: 'Error in auto complete function: ' + error.message
        });
    })
};

const searchTutorByEmail = (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(req.query, 'q'))
        return res.status(200).json({
            error: 'Bad Request',
            message: 'The request query must contain a q property'
        });
    if (!req.query.q)
        return res.status(200).json({});
    const tutorEmail = decodeURI(req.query.q);
    tutorModel.findOne({ email: tutorEmail }).exec()
        .then(tutor => {
            return res.status(200).json({
                email: tutor.email,
                firstName: tutor.firstName,
                lastName: tutor.lastName,
                university: tutor.university,
                price: tutor.price,
                description: tutor.description,
                courses: tutor.courses,
                timeSlotIds: tutor.timeSlotIds,
                avatar: tutor.avatar
            })
        }).catch(error => {
            return res.status(404).json({
                error: 'Tutor not found',
                message: error.message
            })
        })
};


module.exports = {
    getTutorProfile,
    getTutorProfileById,
    uploadTutorProfile,
    getTutorialsForTutor,
    confirmTutorial,
    searchTutor,
    autoCompleteForSearch,
    searchTutorByEmail,
};