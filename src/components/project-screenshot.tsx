import Image from "next/image";
import { JSX } from "react";

interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ProjectScreenshotsProps {
  images: ProjectImage[];
  className?: string;
  withShadow?: boolean;
}

const ProjectScreenshots = ({
  images,
  withShadow = false,
}: ProjectScreenshotsProps): JSX.Element => {
  return (
    <div className="h-full max-w mx-auto relative max-sm:max-w-full max-sm:px-0 justify-center">
      <div className="mx-auto relative w-full h-full">
        {images.length === 1 ? (
          // Single image layout - takes full space
          <div className="flex justify-center items-center h-full">
            <div
              className={`${
                withShadow ? "shadow-2xl" : ""
              } rounded-3xl`}
            >
              <Image
                src={images[0].src}
                alt={images[0].alt}
                className="max-w-full max-h-full h-auto object-contain"
                width={images[0].width}
                height={images[0].height}
              />
            </div>
          </div>
        ) : (
          // Multiple images layout - grid
          <div className="grid grid-cols-2 gap-2 max-sm:gap-3 h-full">
            {images?.map((image, index) => (
              <div
                key={index}
                className={`flex ${
                  index === 0 ? "justify-center items-center" : "justify-start items-end"
                } overflow-hidden`}
              >
                <div
                  className={`${
                    withShadow ? "shadow-2xl" : ""
                  } rounded-3xl`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    className="w-72 h-auto"
                    width={image.width}
                    height={image.height}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectScreenshots;
