"use client";

import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function Gallery() {
  const [sliderRef] = useKeenSlider(
    {
      loop: true,
      mode: "free-snap",
      slides: {
        perView: 1.5,
        spacing: 0,
      },
      breakpoints: {
        "(min-width: 480px)": {
          slides: {
            perView: 2,
            spacing: 0,
          },
        },
        "(min-width: 640px)": {
          slides: {
            perView: 2.5,
            spacing: 0,
          },
        },
        "(min-width: 768px)": {
          slides: {
            perView: 3,
            spacing: 0,
          },
        },
        "(min-width: 1024px)": {
          slides: {
            perView: 3.5,
            spacing: 0,
          },
        },
        "(min-width: 1280px)": {
          slides: {
            perView: 4,
            spacing: 0,
          },
        },
      },
    },
    [
      (slider) => {
        let timeout;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            slider.prev();
          }, 1500);
        }
        slider.on("created", () => {
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  const images = [
    "/imagesInMainPage/image1.jpg",
    "/imagesInMainPage/image2.jpg",
    "/imagesInMainPage/image3.jpg",
    "/imagesInMainPage/image4.jpg",
    "/imagesInMainPage/image5.jpg",
    "/imagesInMainPage/image6.jpg",
    "/imagesInMainPage/image7.jpg",
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-black overflow-hidden">
      <div className="w-full">
        <div
          className="keen-slider"
          ref={sliderRef}
          style={{
            overflow: "hidden",
            width: "100%",
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="keen-slider__slide">
              <div className="relative h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 rounded-xl sm:rounded-2xl overflow-hidden mx-2">
                <Image
                  src={image}
                  alt={`Gallery Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
