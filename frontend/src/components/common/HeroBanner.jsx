const HeroBanner = ({ imageUrl }) => {
  const handleShopNow = () => {
    document
      .getElementById("shop-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-[250px] md:h-[400px] bg-[#6B0D5C] overflow-hidden">

      {/* Banner Image */}
      <img
        src={imageUrl}
        alt="Hero Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Text Container - Moved to right side */}
      <div
        className="
          absolute
          top-1/2
          right-[2%] sm:right-[5%] lg:right-[8%]
          -translate-y-1/2
          w-[90%] sm:w-[320px] lg:w-[360px]
          flex
          flex-col
          items-center
          text-center
          z-20
        "
      >
        <h1 className="text-white text-3xl md:text-[45px] font-bold leading-tight">
          Smart Shopping
        </h1>

        <h2 className="mt-2 text-white text-2xl md:text-[35px] font-bold leading-tight">
          Trusted by Millions
        </h2>

        <button
          onClick={handleShopNow}
          className="
            mt-4 md:mt-8
            w-[140px] md:w-[200px]
            h-[45px] md:h-[60px]
            rounded-lg md:rounded-2xl
            bg-white
            text-[#5b0b57]
            text-base md:text-[20px]
            font-semibold
            shadow-lg
            transition-all
            hover:scale-105
          "
        >
          Shop Now
        </button>
      </div>
    </section>
  );
};

export default HeroBanner;