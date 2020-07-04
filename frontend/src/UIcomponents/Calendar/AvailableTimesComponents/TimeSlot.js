/*
this class is copied from project react-available-times
like: https://github.com/trotzig/react-available-times/
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import momentTimezone from 'moment-timezone';

import { MINUTE_IN_PIXELS } from './Constants';
import HelpFunctionCollections from './HelpFunctionCollections'
import styles from './TimeSlot.css';

const BOTTOM_GAP = MINUTE_IN_PIXELS * 10;

export default class TimeSlot extends PureComponent {
    constructor() {
        super();
        this.handleResizerMouseDown = this.handleResizerMouseDown.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.preventMove = e => e.stopPropagation();
    }

    componentDidMount() {
        this.creationTime = new Date().getTime();
    }

    handleDelete(event) {
        if (new Date().getTime() - this.creationTime < 500) {
            // Just created. Ignore this event, as it's likely coming from the same
            // click event that created it.
            return;
        }
        event.stopPropagation();
        const { onDelete, end, start } = this.props;
        onDelete({ end, start }, event);
    }

    handleResizerMouseDown(event) {
        event.stopPropagation();
        const { onSizeChangeStart, end, start } = this.props;
        onSizeChangeStart({ end, start }, event);
    }

    handleMouseDown(event) {
        const { onMoveStart, end, start } = this.props;
        onMoveStart({ end, start }, event);
    }

    formatTime(date) {
        const { timeConvention, timeZone, frozen } = this.props;
        const m = momentTimezone.tz(date, timeZone);
        if (timeConvention === '12h') {
            if (frozen && m.minute() === 0) {
                return m.format('ha');
            }
            return m.format('hh:mma');
        }
        if (frozen && m.minute() === 0) {
            return m.format('HH');
        }
        return m.format('HH:mm');
    }

    timespan() {
        const { start, end } = this.props;
        return [this.formatTime(start), '-', this.formatTime(end)].join('');
    }

    render() {
        const {
            active,
            date,
            start,
            end,
            frozen,
            width,
            offset,
            timeZone,
            title,
            touchToDelete,
            ifBooked,
        } = this.props;

        const top = HelpFunctionCollections.positionInDay(date, start, timeZone);
        const bottom = HelpFunctionCollections.positionInDay(date, end, timeZone);

        const height = Math.max(
            bottom - top - (frozen ? BOTTOM_GAP : 0),
            1,
        );

        // the booked time slot will be present in red, otherwise in green
        const classes = ifBooked?
            [styles.bookedComponent]:
            [styles.component];
        if (frozen) {
            classes.push(styles.frozen);
        }
        if (active) {
            classes.push(styles.active);
        }
        let secondFrozen = ifBooked;
        const style = {
            top,
            height,
        };

        if (typeof width !== 'undefined' && typeof offset !== 'undefined') {
            style.width = `calc(${width * 100}% - 5px)`;
            style.left = `${offset * 100}%`;
        }

        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
                className={classes.join(' ')}
                style={style}
                onMouseDown={secondFrozen || touchToDelete ? undefined : this.handleMouseDown}
                onClick={secondFrozen || !touchToDelete ? undefined : this.handleDelete}
            >
                <div
                    className={styles.title}
                    style={{
                        // two lines of text in an hour
                        lineHeight: `${(MINUTE_IN_PIXELS * 30) - (BOTTOM_GAP / 2)}px`,
                    }}
                >
                    {title && (
                        <span>
              {title}
                            <br />
            </span>
                    )}
                    {this.timespan()}
                </div>
                {!secondFrozen && !touchToDelete && (
                    <div>
                        <div
                            className={styles.handle}
                            onMouseDown={this.handleResizerMouseDown}
                        >
                            ...
                        </div>
                        <button
                            className={styles.delete}
                            onClick={this.handleDelete}
                            onMouseDown={this.preventMove}
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

TimeSlot.propTypes = {
    touchToDelete: PropTypes.bool,
    timeConvention: PropTypes.oneOf(['12h', '24h']),
    timeZone: PropTypes.string.isRequired,

    active: PropTypes.bool, // Whether the time slot is being changed
    date: PropTypes.instanceOf(Date).isRequired, // The day in which the slot is displayed
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
    title: PropTypes.string,
    frozen: PropTypes.bool,
    ifBooked: PropTypes.bool,

    onSizeChangeStart: PropTypes.func,
    onMoveStart: PropTypes.func,
    onDelete: PropTypes.func,

    // Props used to signal overlap
    width: PropTypes.number,
    offset: PropTypes.number,
};

TimeSlot.defaultProps = {
    touchToDelete: false,
};