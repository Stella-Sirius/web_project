import React from "react";
import {withRouter} from "react-router-dom";
import DatePicker from "react-datepicker";
import '../../css/react-datepicker.css';
import EditProfileService from "../../Services/EditProfileService";

const stylePicker = {
    display: "contents",
    marginTop: 50,
    marginLeft: 50
}

class BookingCalendar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initialTimes: [],
            selectedStart: undefined,
            selectedEnd: undefined,
            initialTimesForSpecificDay: []
        };
    }

    componentDidMount() {
        let initials = [];
        EditProfileService.getTutorProfile().then((data) => {
            console.log(data)
            data.timeSlotIds.forEach((times) => {
                initials.push({
                    start: new Date(parseInt(times.start)),
                    end: new Date(parseInt(times.end))
                })
            })
            this.setState({initialTimes: initials})

            //    this.availableTimes(initials);
        })

    }

    //acquire time slots between start and end timestamp within one time period
    getSingleTimes = (startTimestamp, endTimestamp) => {
        let arr = [];
        let current = startTimestamp;
        while (current < endTimestamp) {
            arr.push(new Date(parseInt(current)));
            current += 60 * 60 * 1000;
        }
        arr.push(new Date(parseInt(endTimestamp)));
        return arr;
    }

    //get all time slots
    availableTimes = (initials) => {
        let arr = [];
        initials.forEach((data) => {
            if (data.start !== undefined && data.end !== undefined) {
                let startStp = data.start.getTime();
                let endStp = data.end.getTime();
                let newArr = this.getSingleTimes(startStp, endStp);
                if (newArr !== null && newArr !== undefined) {
                    newArr.forEach((data) => {
                        if (arr.indexOf(data) === -1) {
                            arr.push(data);
                            console.log(arr)
                        }
                    })
                }
            }

        })
        return arr;
    }
    handleChangeStart = (value) => {
        let timeOnSpecificDay = [];
        this.state.initialTimes.map((data) => {
            console.log(data)
            let dateDay = data.start.getDate();
            if (value.getDate() === dateDay) {
                console.log(dateDay);
                timeOnSpecificDay.push(data);
            }
        })
        this.setState({selectedStart: value});
        this.setState({initialTimesForSpecificDay: timeOnSpecificDay})
    }
    handleChangeEnd = (value) => {
        this.setState({selectedEnd: value});
    }

    render() {
        return (
            <div>
                <DatePicker
                    id="newPickDate"
                    require
                    inline
                    includeDates={this.availableTimes(this.state.initialTimes)}
                    includeTimes={this.availableTimes(this.state.initialTimesForSpecificDay)}
                    timesShown={2}
                    style={stylePicker}
                    dateFormat='dd.MM.yyyy HH:mm'
                    className="md-cell"
                    selected={this.state.selectedStart}
                    isClearable
                    showYearDropdown
                    scrollableMonthYearDropdown
                    minDate={new Date()}
                    onChange={this.handleChangeStart}
                    showTimeSelect
                    timeIntervals={60}
                    timeCaption="Time"
                    timeFormat="HH:mm"

                />
                <DatePicker
                    id="newPickDateEnd"
                    require
                    inline
                    style={stylePicker}
                    dateFormat='dd.MM.yyyy HH:mm'
                    className="md-cell"
                    selected={this.state.selectedEnd}
                    includeDates={this.availableTimes(this.state.initialTimes)}
                    includeTimes={this.availableTimes(this.state.initialTimesForSpecificDay)}
                    isClearable
                    //   minDate={this.state.test}
                    onChange={this.handleChangeEnd}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={60}
                    timeCaption="Time"
                    timeFormat="HH:mm"

                />
            </div>

        );
    }

}

export default withRouter(BookingCalendar);