export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* Container with 16:9 aspect ratio (1920:1080) */}
      <div className="relative w-full aspect-video">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
