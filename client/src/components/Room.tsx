import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [socket, setSocket] = useState<null | Socket>(null);
  const [connected, setConnected] = useState(false);
  const [lobby, setLobby] = useState(true);

  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<null | MediaStreamTrack>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<null | MediaStreamTrack>(null);

  const name = searchParams.get("name");

  useEffect(() => {
    // Logic to init user to the room
    const socket = io(URL);

    socket.on("send-offer", async ({ roomId }) => {
      // alert("Send offer please");
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);

      const sdp = await pc.createOffer();
      socket.emit("offer", {
        sdp,
        roomId,
      });
    });

    socket.on("offer", async ({ roomId, offer }) => {
      // alert("Send answer please");
      setLobby(false);

      const pc = new RTCPeerConnection();
      pc.setRemoteDescription({ sdp: offer, type: "offer" });
      const sdp = await pc.createAnswer();
      // trickle ice
      pc.ontrack = ({ track, type }) => {
        if (type === "audio") {
          setRemoteAudioTrack(track);
        } else {
          setRemoteVideoTrack(track);
        }
      };
      socket.emit("answer", {
        sdp,
        roomId,
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      setLobby(false);
      // alert("Connection done");
      setSendingPc((pc) => {
        pc?.setRemoteDescription({
          type: "answer",
          sdp: answer,
        });
        return pc;
      });
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    setSocket(socket);
  }, [name]);

  if (lobby) {
    return (
      <>
        <div>Waiting to connect you to someone</div>
      </>
    );
  }

  return (
    <>
      <div>
        {`Hi ${name}`}
        <video width={400} height={400} />
        <video width={400} height={400} />
      </div>
    </>
  );
};
