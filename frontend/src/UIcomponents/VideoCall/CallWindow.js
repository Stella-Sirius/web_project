import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const giveButtonClass=(name,enabled)=> classNames(name,{disable: !enabled });
function CallWindow({ peerSrc, localSrc, config, mediaDevice, status, endCall, shareScreen, ifShareScreen }) {
    const peerVideo = useRef(null);
    const localVideo = useRef(null);
    const [video, setVideo] = useState(config.video);
    const [audio, setAudio] = useState(config.audio);

    useEffect(() => {
        if (peerVideo.current && peerSrc) {
            peerVideo.current.srcObject = peerSrc;
        }
        if (localVideo.current && localSrc) {
            localVideo.current.srcObject = localSrc;
        }
    });

    useEffect(() => {
        if (mediaDevice) {
            mediaDevice.toggle('Video', video);
            mediaDevice.toggle('Audio', audio);
        }
    });

    /**
     * Turn on/off a media device
     * @param {String} deviceType - Type of the device eg: Video, Audio
     */
    const toggleMediaDevice = (deviceType) => {
        if (deviceType === 'video') {
            setVideo(!video);
            mediaDevice.toggle('Video');
        }
        if (deviceType === 'audio') {
            setAudio(!audio);
            mediaDevice.toggle('Audio');
        }
    };
    return (
        <div className={classNames('call-window', status)}
             style={{  marginLeft:"30px",
                 marginTop:"80px",
                 height:"82%",
                 width:"70%"}}>
            <video id="peerVideo" ref={peerVideo} autoPlay />
            <video id="localVideo" ref={localVideo} autoPlay muted />
            <div className="video-control" >
                <button
                    key="btnVideo"
                    type="button"
                 //   className={getButtonClass('fa-video-camera', video)}
                    className={giveButtonClass('video', video)}
                    onClick={() => toggleMediaDevice('video')}
                />
                <button
                    key="btnAudio"
                    type="button"
                    className={giveButtonClass('microphone', audio)}
                    onClick={() => toggleMediaDevice('audio')}
                />
                <button
                    key="btnShareScreen"
                    type="button"
                    className={giveButtonClass('shareScreen', ifShareScreen)}
                    onClick={shareScreen}
                />
                <button
                    type="button"
                    className="hangup"
                    onClick={() => endCall(true)}
                />
            </div>
        </div>
    );
}

CallWindow.propTypes = {
    status: PropTypes.string.isRequired,
    localSrc: PropTypes.object, // eslint-disable-line
    peerSrc: PropTypes.object, // eslint-disable-line
    config: PropTypes.shape({
        audio: PropTypes.bool.isRequired,
        video: PropTypes.bool.isRequired
    }).isRequired,
    mediaDevice: PropTypes.object, // eslint-disable-line
    endCall: PropTypes.func.isRequired
};

export default CallWindow;
