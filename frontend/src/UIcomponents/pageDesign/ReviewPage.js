import React from 'react'
import StarRatingComponent from 'react-star-rating-component';
import { Button, TextField, } from 'react-md';
import { toast } from 'react-toastify';

export class TutorReviewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().toLocaleDateString(),
            tutorEmail: '',
            customerEmail: '',
            comprehensionRating: 0,
            friendlinessRating: 0,
            teachingStyleRating: 0,
            overallRating: 0,
            text: ""
        }
    }

    onStarClickComprehensionRating(nextValue, prevValue, name) {
        this.setState({ comprehensionRating: nextValue });
    }

    onStarClickTeachingStyleRating(nextValue, prevValue, name) {
        this.setState({ teachingStyleRating: nextValue });
    }

    onStarClickFriendlinessRating(nextValue, prevValue, name) {
        this.setState({ friendlinessRating: nextValue });
    }

    handleChangeText(value) {
        this.setState(Object.assign({}, this.state, { text: value }));
    }

    handleSubmit = () => {
        if (this.state.text == '') {
            toast.error('Please input a tutor or course name');
            return;
        }
        let review = this.props.review;
        if (review == undefined) {
            review = {};
        }
        review.time = this.state.time
        review.tutorEmail = this.state.tutorEmail;
        review.customerEmail = this.state.customerEmail;
        review.comprehensionRating = this.state.comprehensionRating;
        review.friendlinessRating = this.state.friendlinessRating;
        review.teachingStyleRating = this.state.teachingStyleRating;
        review.chefName = this.state.chefName;
        review.title = this.state.title;
        review.text = this.state.text;
        review.overallRating = Math.round((this.state.comprehensionRating +
            this.state.friendlinessRating +
            this.state.teachingStyleRating) / 3);
        this.props.onSubmit(review);
    }

    render() {
        const { comprehensionRating } = this.state;
        const { friendlinessRating } = this.state;
        const { teachingStyleRating } = this.state;

        return (
            <div className="md-grid" id="reviewTable" label="Review" style={{
                display: 'flex',
                maxWidth: '60%',
                marginTop: '2%',
                position: 'relative',
                background: 'rgb(255,255,255,0.8)'
            }}>

                <div className="chef-container" style={{ marginTop: '0.5%' }}>
                    <img src={this.props.tutor.avatar} />
                    <h3 style={{ marginTop: '2%' }}>Tutor</h3>
                    <h1 style={{ marginTop: '-2%' }}>{this.props.tutor.firstName} {this.props.tutor.lastName}</h1>
                </div>

                <div className="reviewForm" style={{ marginTop: '0.5%', color: '#FFFFFF', marginLeft: '3%' }}>
                    <h1>Review Your Tutorial Session </h1>

                    <div className="comprehensionRating" style={{ marginTop: '10%' }}>
                        <h3>Have you understood the content of this tutorial session?  </h3>
                        <h2>
                            <StarRatingComponent
                                name="comprehensionRating"
                                starCount={5}
                                value={comprehensionRating}
                                onStarClick={this.onStarClickComprehensionRating.bind(this)}
                            />
                        </h2>
                    </div>

                    <div className="friendlinessRating" style={{ marginTop: '10%' }}>
                        <h3>Is your tutor patient and friendly?  </h3>
                        <h2>
                            <StarRatingComponent
                                name="friendlinessRating"
                                starCount={5}
                                value={friendlinessRating}
                                onStarClick={this.onStarClickFriendlinessRating.bind(this)}
                            />
                        </h2>
                    </div>

                    <div className="teachingStyleRating" style={{ marginTop: '10%' }}>
                        <h3>Do you like the tutor's teaching style </h3>
                        <h2>
                            <StarRatingComponent
                                name="teachingStyleRating"
                                starCount={5}
                                value={teachingStyleRating}
                                onStarClick={this.onStarClickTeachingStyleRating.bind(this)}
                            />
                        </h2>
                    </div>

                    <div id="reviewTextBox">
                        <TextField
                            id="reviewText"
                            label="Review"
                            required
                            value={this.state.text}
                            onChange={this.handleChangeText}
                            lineDirection="center"
                            placeholder="Do you want to leave some advises or appreciations"
                            rows={4}
                            paddedBlock
                            style={{ marginLeft: '1px', width: '100%' }}
                            maxLength={1000}
                            errorText="Max 1000 characters."
                        />
                    </div>

                    <div>
                        <Button id="submitButton"
                            raised
                            primary
                            className="md-cell md-cell--2"
                            onClick={() => this.handleSubmit()}
                        >Submit</Button>
                    </div>
                </div>


            </div>
        )
    }
}
export default withRouter(ReviewPage);