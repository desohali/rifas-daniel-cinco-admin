"use client";
import React, { useRef, useEffect } from 'react';
import { BrowserCodeReader, MultiFormatReader, BrowserQRCodeReader } from '@zxing/library';

var selectedDeviceId: any;

const Scanner = () => {


  const codeReader = new BrowserQRCodeReader();

  const videoRef = useRef<any>(null);
  const [text, settext] = React.useState<string>("");

  function decodeContinuously(codeReader: any, selectedDeviceId: any) {
    codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, videoRef.current, (result: any, err: any) => {
      if (result) {
        // properly decoded qr code
        console.log('Found QR code!', result)
        // document.getElementById('result').textContent = result.text
      }

    })
  }

  useEffect(() => {
    codeReader.getVideoInputDevices()
      .then((videoInputDevices) => {
        const rearCamera = videoInputDevices.find(device => device.label.includes('back'));
        selectedDeviceId = (rearCamera?.deviceId || videoInputDevices[0].deviceId);
      });
    return () => {
      codeReader.reset();
    }
  }, []);

  return <>
    <button type="button" onClick={() => {
      decodeContinuously(codeReader, selectedDeviceId);
    }}>Encender scanner</button>
    <button type="button" onClick={() => {
      codeReader.reset();
    }}>Apagar scanner</button>
    <video ref={videoRef} />
    <h4>{text.split("/").reverse()[0]}</h4>
  </>;
};

export default Scanner;



