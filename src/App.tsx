import React, { useState, useRef } from "react";
import exifr from "exifr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

const PHOTOGRAPHERS = [{
  name: "Naresh",
  userName: "naresh_kumar_ram",
},{
  name: "Srinath",
  userName: "srinathvathsa",
},{
  name: "Sudarshan",
  userName: "iyengarsudharshan",
}]

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
  const [photographerUsername, setPhotographerUsername] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [caption, setCaption] = useState<string>('')

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

  const generateCaption = () => {
    const caption = getCaption()
    setCaption(caption)
    navigator.clipboard.writeText(caption);
    toast.success("Caption generated and copied to clipboard!");
  };

  const handleChangeInDescription = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(evt.target.value)
  }

  const getCaption = ()=>{
    const exifDataText = Object.entries(exifData)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const caption = `
${description}

📷 @${photographerUsername}

${exifDataText}

#portrait #travelphotography #landscape #fotografia #summer #comment #selfie #portraitphotography #photographylovers #ifestyle #explore #sky #streetphotography #music #sonyalpha #sonya6400 #sonya6000 #sonya7iii #sonyalphasclub #sonyportraits #sony #nikon #sonyphotography #nikonphotography #canonphotography #lumix
    `
    return caption
  }
  return (
    <div>
      <div className="container">
        <h1>Pixel 360 caption generator</h1>
        <div>
          <input placeholder="Enter short description" onChange={handleChangeInDescription} />
          <select onChange={(e) => setPhotographerUsername(e.target.value)}>
          <option >Select photographer</option>
            {PHOTOGRAPHERS.map((photographer)=>{
              return <option 
                key={photographer.userName}
                id={photographer.userName}
                value={photographer.userName}
              >
                {photographer.name}
              </option>
            })}
          </select>
          <input type="file" onChange={handleFileInputChange} />
        </div>
        <div>
          {Object.entries(exifData).length > 0 &&
            <button
             id="generate-btn-cta"
             onClick={generateCaption}
            >
              Generate & copy caption
            </button>
          }
          <ToastContainer position="top-center" />
        </div>
        <p id="caption">
          {caption}
        </p>
        <div className="preview-container">
          {previewUrl && <img src={previewUrl} alt="Preview" ref={imageRef} />}
        </div>
      </div>
    </div>
  );
}

export default App;
