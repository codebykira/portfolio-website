import React from "react";
import Stack from './Stack';
import ClientOnly from './ClientOnly';

const PhotoGallery = () => {
  const images = [
    {
      id: 1,
      img: "/mikey.png",
    },
    {
      id: 2,
      img: "/north-korea.png",
    },
    {
      id: 3,
      img: "/kenya.png",
    },
    {
      id: 4,
      img: "/food.png",
    },
    {
      id: 5,
      img: "/painting.png",
    },
    {
      id: 6,
      img: "/haiway.png",
    },
  ];

  return (
    <div className="flex justify-center items-center w-full py-8">
      <ClientOnly fallback={<div style={{ width: 400, height: 500 }} />}>
        <Stack
          randomRotation={true}
          sensitivity={180}
          sendToBackOnClick={false}
          cardDimensions={{ width: 400, height: 500 }}
          cardsData={images}
        />
      </ClientOnly>
    </div>
  );
};

export default PhotoGallery;
