import React, { useState, useRef, useEffect } from 'react';
import '../camera.css';


const Camera = () => {
  const [videoStream, setVideoStream] = useState(null);
  const [info, setInfo] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
      } catch (error) {
        console.error('Error accessing webcam:', error.message);
      }
    };

    startVideo();

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleScan = async () => {
    if (!videoStream) {
      console.error('Webcam not available.');
      return;
    }

    const video = document.createElement('video');
    video.srcObject = videoStream;
    video.width = 640;
    video.height = 480;
    video.autoplay = true;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Fix the typo here (new ImageCapture instead of new imageCapture)
    let imageCapture;

    video.addEventListener('loadeddata', async () => {
      // Use videoStream.current here
      imageCapture = new ImageCapture(video.captureStream().getVideoTracks()[0]);

      //imageCapture = new ImageCapture(videoStream.current.getVideoTracks()[0]);
      const bitmap = await imageCapture.grabFrame();

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
      const formData = new FormData();
      formData.append('image', blob, 'snapshot.jpg');

      try {
        const response = await fetch('http://127.0.0.1:5000/api/face-detection', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setInfo(data);
        } else {
          console.error('Face detection error:', response.statusText);
        }
      } catch (error) {
        console.error('Face detection error:', error.message);
      }
    });
  };

  return (
    <div className="camera-container">
      <h1>Face Detection Camera</h1> 
      {videoStream && <video ref={videoStream} width="640" height="480" autoPlay />}

      <button onClick={handleScan}>Scan Face</button>

      {info && (
        <div>
          <h2>{info.name}</h2>
          <p>{info.info}</p>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden-canvas" />
    </div>
  );
};

export default Camera;

