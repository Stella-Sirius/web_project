import HttpService from './HttpService';
const config = require('../config');

export default class ReviewService {
    constructor() {
    }
    static baseURL = () => config.backendUri;


    static createReview(review) {
        return new Promise((resolve, reject) => {
            HttpService.post(this.baseURL() + '/customer/review',
                {
                    time: new Date().toLocaleDateString(),
                    tutorEmail: review.tutorEmail,
                    customerEmail: review.customerEmail,
                    comprehensionRating: review.comprehensionRating,
                    friendlinessRating: review.friendlinessRating,
                    teachingStyleRating: review.teachingStyleRating,
                    overallRating: review.overallRating,
                    text: review.text,
                    tutorialId: review.tutorialId,
                }, function (data) {
                    resolve(data);
                }, function (textStatus) {
                    reject(textStatus);
                });

        })
    }

    static getReview(id) {
        return new Promise((resolve, reject) => {
            HttpService.get(this.baseURL() + `/customer/review/${id}`,
                function (data) {
                    resolve(data);
                }, function (textStatus) {
                    reject(textStatus);
                });
        })
    }

    static updateReview(id, review) {
        return new Promise((resolve, reject) => {
            HttpService.put(this.baseURL() + `/customer/review/${id}`,
                {
                    time: new Date().toLocaleDateString(),
                    tutorEmail: review.tutorEmail,
                    customerEmail: review.customerEmail,
                    comprehensionRating: review.comprehensionRating,
                    friendlinessRating: review.friendlinessRating,
                    teachingStyleRating: review.teachingStyleRating,
                    overallRating: review.overallRating,
                    text: review.text,
                    tutorialId: review.tutorialId,
                }, function (data) {
                    resolve(data);
                }, function (textStatus) {
                    reject(textStatus);
                });

        })
    }
}