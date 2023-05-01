import React, { useState, useRef } from "react";
import exifr from "exifr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

function App(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [exifData, setExifData] = useState<{
    Model?: string;
    ISO?: number;
    ShutterSpeed?: string;
    Aperture?: number;
    FocalLength?: string;
  }>({});

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(previewUrl);

      // Extract EXIF data from the file
      const dataUrl = await toDataUrl(selectedFile);
      const exifData = await exifr.parse(dataUrl);
      console.log(JSON.stringify(exifData, null, 2));
      setExifData({
        Model: `${exifData?.Make} - ${exifData?.Model}`,
        ISO: exifData?.ISO,
        ShutterSpeed: exifData?.ExposureTime
          ? `1/${1 / exifData.ExposureTime}`
          : "",
        Aperture: exifData?.ApertureValue,
        FocalLength: exifData?.FocalLength ? `${exifData.FocalLength} mm` : "",
      });
    } else {
      setFile(null);
      setPreviewUrl(null);
      setExifData({});
    }
  };

  const toDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCopyButtonClick = () => {
    const exifDataText = Object.entries(exifData)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    navigator.clipboard.writeText(exifDataText);
    toast.success("Data copied to clipboard!");
  };

  return (
    <div>
      <div className="container">
        <h1>Pixel 360 EXIF extractor</h1>
        <input type="file" onChange={handleFileInputChange} />
        <div className="preview-container">
          {previewUrl && <img src={previewUrl} alt="Preview" ref={imageRef} />}
          <div>
            {Object.entries(exifData).length > 0 &&
              <button onClick={handleCopyButtonClick}>Copy EXIF Data</button>
            }
            <ToastContainer position="top-center" />
            <div>
              {Object.entries(exifData).map(([key, value]) => {
                if (value === undefined) return null;
                return (
                  <p key={key}>
                    {key}: {value}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
