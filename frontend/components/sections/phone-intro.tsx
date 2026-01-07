import React from "react";
import Image from "next/image";

const PhoneIntro: React.FC = () => {
  return (
    <section className="bg-[#0b0b0c] w-full overflow-hidden">
      <div className="pt-[120px] pb-[40px] md:pt-[160px] md:pb-[60px]">
        <div className="container mx-auto px-8 max-w-[1280px]">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-white font-display font-light leading-[1.1] tracking-[-0.02em] text-[40px] sm:text-[56px] md:text-[72px]">
              <em className="italic">Simplify</em> your money
            </h3>
          </div>
        </div>
      </div>

      <div className="pb-[80px] md:pb-[160px]">
        <div className="container mx-auto px-8 max-w-[1280px]">
          <div className="flex justify-center">
            <div className="relative w-full max-w-[960px] aspect-[16/10] sm:aspect-[16/9]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/aa857170-3070-42eb-a34a-feedce229158-useorigin-com/assets/images/68bb319d2327f0531c6d5b7f_phone1-1.png"
                alt="3D Mobile App Mockup"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 960px"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-white opacity-10" />
    </section>
  );
};

export default PhoneIntro;


