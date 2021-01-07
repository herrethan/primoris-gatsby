import React, { useState, useEffect } from "react";

const ImageSlider = ({ interval=4000, images }) => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * images.length));
  const [isAuto, setIsAuto] = useState(true);

  const goForward = () => setIndex(curr => curr + 1 >= images.length ? 0 : curr + 1);
  const goBackward = () => setIndex(curr => curr - 1 < 0 ? images.length - 1 : curr - 1);

  const handleForward = () => {
    setIsAuto(false);
    goForward();
  }

  const handleBackward = () => {
    setIsAuto(false);
    goBackward();
  }

  useEffect(() => {
    const autoAdvancer = setInterval(goForward, interval);
    if (!isAuto) {
      clearInterval(autoAdvancer);
    }
    return () => clearInterval(autoAdvancer);
  }, [isAuto, interval]);

  console.log(index)

  return (
    <>
      <div className="slideshow">
        {images.map((image, i) => (
          <div 
            className="background-img"
            key={image.thumbnail}
            style={{ 
              backgroundImage: `url(${image.thumbnail})`,
              opacity: i === index ? 1 : 0
            }}> 
          </div>
        ))}
      </div>
      <button className="slideshow-arrow-left" onClick={handleBackward}>←</button>
      <button className="slideshow-arrow-right" onClick={handleForward}>→</button>
    </>
  )
}

export default ImageSlider
