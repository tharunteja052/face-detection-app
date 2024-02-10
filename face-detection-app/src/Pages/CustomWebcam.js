import React from "react";
import Webcam from "react-webcam";
import { useCallback, useRef, useState } from "react";

const CustomWebcam = () => {

    const retake = () => {
        setImgSrc(null);
    };

    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [info, setInfo] = useState(null);
    const canvasRef = useRef(null);

    // create a capture function
    const capture = useCallback(async () => {
        try {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
            await handleScan(imageSrc);
            
        } catch(error) {
            console.error('Error Accessing webcam:',error.message)
        }
        
    }, [webcamRef]);

    const handleScan = async (imgSrc) => {
        if (!imgSrc) {
            console.error('Webcam not available');
            return;
        }
    
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas ref is not available');
            return;
        }
    
        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Canvas context is not available');
            return;
        }
    
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        const image = new Image();
        image.src = imgSrc;
        image.onload = async () => {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, image.width, image.height);
    
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
        };
    };
    
        

  return (
    <div className="container">
      {imgSrc ? (
        <img src={imgSrc} alt="webcam" />
      ) : (
        <Webcam height={500} width={500} ref={webcamRef} />
      )}
      <div className="btn-container">
        {imgSrc ? (
            <>
                <button onClick={retake}>Retake photo</button>
                {/*
                <div style={{ display: 'inline-block', marginRight: '10px' }}>
                    <button onClick={retake}>Retake photo</button>
                </div>
                
                <div style={{ display: 'inline-block' }}>
                    <button onClick={handleScan}>Scan Face</button>
                </div>*/}
            </>
        ) : (
            <button onClick={capture}>Scan Face</button>
        )}
        
        {info && (
            <div>
                <h2>{info.name}</h2>
                <p>{info.info}</p>
            </div>
        )}
        <canvas ref={canvasRef} className="hidden-canvas" />
      </div>
    </div>
  );
};

export default CustomWebcam;