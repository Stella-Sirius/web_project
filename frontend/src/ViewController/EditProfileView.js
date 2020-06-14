"use strict";

import React from 'react';

import EditProfile from './../UIcomponents/pageDesign/EditProfile';
import Navigation from "../UIcomponents/pageDesign/Navigation";
import Background from '../Images/Homepage.jpg';

import UserService from '../Services/UserService';
import EditProfileService from '../Services/EditProfileService';
import { toast } from "react-toastify";


export class EditProfileView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: undefined
        };
    }

    componentDidMount() {
        let user = UserService.getCurrentUser();
        if (Object.keys(user).length === 0 && user.constructor === Object) {
            // user not define
            this.setState({
                userType: undefined,
                loading: false,
                error: "No login information"
            })
        }
        else {
            this.setState({
                userType: user.userType
            });
            // get customer profile
            if (user.userType === 'tutor') {
                EditProfileService.getTutorProfile().then((data) => {
                    this.setState({
                        userProfile: data,
                        loading: false,
                        error: undefined
                    });
                }).catch((e) => {
                    console.error(e);
                });
            } else {
                EditProfileService.getCustomerProfile().then((data) => {
                    this.setState({
                        userProfile: data,
                        loading: false,
                        error: undefined
                    });
                }).catch((e) => {
                    console.error(e);
                });
            }
        }
    }

    updateProfile = (userProfile) => {
        if (this.state.userType === 'tutor') {
            EditProfileService.updateTutorProfile(userProfile).then((data) => {
                toast.success('Update profile succeeded');
                this.props.history.push('/');
            }).catch((e) => {
                toast.error('Please input correct information');
                this.setState({
                    error: 'Error while updating user profile'
                });
            });
        } else {
            EditProfileService.updateCustomerProfile(userProfile).then((data) => {
                toast.success('Update profile succeeded');
                this.props.history.push('/');
            }).catch((e) => {
                toast.error('Please input correct information');
                this.setState({
                    error: 'Error while updating customer profile'
                });
            });
        }
    };

    render() {
        if (this.state.loading) {
            return (<h2>Loading...</h2>);
        }
        if (this.state.userType === undefined) {
            this.props.history.goBack();
        }

        return (
            <div>
                <Navigation />
                <section>
                    <img src={Background} alt={"A Background Picture"} className="bg" />
                    <EditProfile userType={this.state.userType} userProfile={this.state.userProfile} onSubmit={(userProfile) => this.updateProfile(userProfile)} error={this.state.error} />
                </section>
            </div>);
    }
}
