import React from 'react';
import BookingCard from '../UIcomponents/BookingList/BookingCard';
import Background from '../Images/Homepage.jpg';
import TutorialService from "../Services/TutorialService.js"
import UserService from "../Services/UserService";
import { toast } from 'react-toastify';
import Navigation from "../UIcomponents/PageDesign/Navigation";

export class BookingListView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            tutorials: [],
            filteredData: [],
            error: undefined
        };
        this.nowTime = +new Date();
    }

    componentWillMount() {
        this.setState({
            loading: true
        });
        let userType = UserService.getCurrentUser().userType;
        if (!userType) {
            toast.error("Need login information!");
            this.props.history.goBack();
        }
        userType === `customer` ?
            TutorialService.getAllTutorialsForCustomer().then((tutorialsData) => {
                let tutorialSort = tutorialsData;
                tutorialSort.sort(this.tutorialCompareFunction);
                this.setState({
                    tutorials: tutorialSort,
                    loading: false,
                    userType
                });
            }).catch((e) => {
                console.error(e);
            }) :
            TutorialService.getAllTutorialsForTutor().then((tutorialsData) => {
                let tutorialSort = tutorialsData;
                tutorialSort.sort(this.tutorialCompareFunction);
                this.setState({
                    tutorials: tutorialSort,
                    loading: false,
                    userType
                });
            }).catch((e) => {
                console.error(e);
            });
    }

    handleReview = (url) => {
        this.props.history.push(url);
    };

    handleChatRoom = (url) => {
        this.props.history.push(url);
    };


    cancelTutorial = (tutorialInfo) => {
        TutorialService.cancelTutorial(tutorialInfo).then(() => {
            toast.success('Successfully cancel tutorial');
            this.setState({
                tutorials: this.state.tutorials.map(t => (
                    t._id === tutorialInfo._id ?
                        Object.assign({}, t, { tutorialStatus: 'cancelled' }) :
                        t))
            })
        }).catch(() => {
            toast.error('Failed to cancel tutorial');
        });
    };

    confirmTutorial = (tutorialInfo) => {
        TutorialService.confirmTutorial(tutorialInfo).then(() => {
            toast.success('Successfully confirm tutorial');
            this.setState({
                tutorials: this.state.tutorials.map(t => (
                    t._id === tutorialInfo._id ?
                        Object.assign({}, t, { tutorialStatus: 'confirmed' }) :
                        t))
            })
        }).catch(() => {
            toast.error('Failed to confirm tutorial');
        });
    };

    tutorialCompareFunction = (a, b) => {
        if(a.startTime > this.nowTime && b.startTime > this.nowTime){
            return a.startTime - b.startTime;
        }
        if(a.startTime < this.nowTime && b.startTime > this.nowTime){
            return 1;
        }
        if(a.startTime > this.nowTime && b.startTime < this.nowTime){
            return -1;
        }
        if(a.startTime < this.nowTime && b.startTime < this.nowTime){
            return b.startTime - a.startTime;
        }
        return -1;
    }

    render() {
        if (this.state.loading) {
            return <h2>Loading</h2>
        }

        return (
            <div>
                <Navigation />

                <section>

                    {this.state.tutorials.map((t) => {
                        return (
                            this.state.userType === 'customer' ?
                                <BookingCard
                                    key={t._id}
                                    tutorial={t}
                                    userType={this.state.userType}
                                    handleReview={this.handleReview}
                                    handleChatRoom={this.handleChatRoom}
                                    cancelTutorial={this.cancelTutorial} /> :
                                <BookingCard
                                    key={t._id}
                                    tutorial={t}
                                    userType={this.state.userType}
                                    handleReview={this.handleReview}
                                    cancelTutorial={this.cancelTutorial}
                                    handleChatRoom={this.handleChatRoom}
                                    confirmTutorial={this.confirmTutorial} />
                        )
                    })}
                    <img src={Background} alt={"A Background Picture"} className="bg" />


                </section>
            </div>
        );
    }
}
