import React, { useState, useEffect } from "react";

const ImageSlider = ({ interval=4000, images }) => {
  const [index, setIndex] = useState(Math.floor(Math.random() * images.length));
  const [isAuto, setIsAuto] = useState(true);

  const goForward = () => index + 1 >= images.length ? setIndex(0) : setIndex(index + 1);
  const goBackward = () => index - 1 < 0 ? setIndex(images.length - 1) : setIndex(index - 1);

  const handleForward = () => {
    setIsAuto(false);
    goForward();
  }

  const handleBackward = () => {
    setIsAuto(false);
    goBackward();
  }

  useEffect(() => {
    const autoAdvancer = setTimeout(goForward, interval);
    if (!isAuto) {
      clearTimeout(autoAdvancer);
    }
    return () => clearTimeout(autoAdvancer);
  }, [index, isAuto])

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
