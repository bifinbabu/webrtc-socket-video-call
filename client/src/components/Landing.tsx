import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<null | MediaStreamTrack>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<null | MediaStreamTrack>(null);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // MediaStream
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setLocalVideoTrack(videoTrack);
    if (!videoRef.current) return;
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
    // MediaStream
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);

  return (
    <>
      <div>
        Landing Page
        <div>
          <video autoPlay ref={videoRef}></video>
          <input type="text" onChange={(e) => setName(e.target.value)} />
          <button
            onClick={() => {
              // Join room logic here
              navigate(`/room?name=${name}`);
            }}
          >
            Join
          </button>
        </div>
      </div>
    </>
  );
};
