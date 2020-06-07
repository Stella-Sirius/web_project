"use strict";

import HttpService from './HttpService';
const config = require('../config');

export default class EditProfileService {

    constructor() {
    }

    static baseURL = () => config.backendUri + '/user'

    static updateCustomerProfile(profile) {
        profile = {
            ...profile,
            userType: 'customer'
        }
        return new Promise((resolve, reject) => {
            HttpService.post(`${this.baseURL()}/uploadCustomerProfile`, profile, function (data) {
                resolve(data);
            }, function (textStatus) {
                reject(textStatus);
            });
        });
    }

    static getCustomerProfile() {
        return new Promise((resolve, reject) => {
            HttpService.get(`${this.baseURL()}/customerProfile`, function (data) {
                if (data != undefined || Object.keys(data).length !== 0) {
                    resolve(data);
                }
                else {
                    reject('Error while retrieving movie');
                }
            }, function (textStatus) {
                reject(textStatus);
            });
        });
    }

    static updateTutorProfile(profile) {
        profile = {
            ...profile,
            userType: 'tutor'
        }
        // TODO: remove above, should done by check authentication
        return new Promise((resolve, reject) => {
            HttpService.post(`${this.baseURL()}/uploadTutorProfile`, profile, function (data) {
                resolve(data);
            }, function (textStatus) {
                reject(textStatus);
            });
        });
    }

    static getTutorProfile() {
        return new Promise((resolve, reject) => {
            HttpService.get(`${this.baseURL()}/tutorProfile`, function (data) {
                if (data != undefined || Object.keys(data).length !== 0) {
                    resolve(data);
                }
                else {
                    reject('Error while retrieving movie');
                }
            }, function (textStatus) {
                reject(textStatus);
            });
        });
    }
}