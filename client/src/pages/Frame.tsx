import React from "react";

const typographyData = [
  {
    px: "68px",
    rem: "4.250rem",
    text: "Simulador",
    fontClass:
      "font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] [font-style:var(--title-font-style)]",
  },
  {
    px: "42px",
    rem: "2.625rem",
    text: "Simulador",
    fontClass:
      "font-h-1 font-[number:var(--h-1-font-weight)] text-[length:var(--h-1-font-size)] tracking-[var(--h-1-letter-spacing)] leading-[var(--h-1-line-height)] [font-style:var(--h-1-font-style)]",
  },
  {
    px: "26px",
    rem: "1.625rem",
    text: "Simulador",
    fontClass:
      "font-h-2 font-[number:var(--h-2-font-weight)] text-[length:var(--h-2-font-size)] tracking-[var(--h-2-letter-spacing)] leading-[var(--h-2-line-height)] [font-style:var(--h-2-font-style)]",
  },
  {
    px: "16px",
    rem: "1.000rem",
    text: "Simulador",
    fontClass:
      "font-body font-[number:var(--body-font-weight)] text-[length:var(--body-font-size)] tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] [font-style:var(--body-font-style)]",
  },
  {
    px: "10px",
    rem: "0.625rem",
    text: "Simulador",
    fontClass:
      "font-small-body font-[number:var(--small-body-font-weight)] text-[length:var(--small-body-font-size)] tracking-[var(--small-body-letter-spacing)] leading-[var(--small-body-line-height)] [font-style:var(--small-body-font-style)]",
  },
  {
    px: "6px",
    rem: "0.375rem",
    text: "Simulador",
    fontClass:
      "font-caption font-[number:var(--caption-font-weight)] text-[length:var(--caption-font-size)] tracking-[var(--caption-letter-spacing)] leading-[var(--caption-line-height)] [font-style:var(--caption-font-style)]",
  },
];

export const Frame = (): JSX.Element => {
  return (
    <main className="inline-flex flex-col items-start gap-12 p-16 bg-white">
      <header className="inline-flex items-end gap-3 pl-24 pr-0 py-0 flex-[0_0_auto] bg-white">
        <div className="w-fit mt-[-1.00px] opacity-40 [font-family:'Inter',Helvetica] font-normal text-black text-xs tracking-[0] leading-[normal]">
          Base Value: 16
        </div>

        <div className="w-fit mt-[-1.00px] opacity-40 [font-family:'Inter',Helvetica] font-normal text-black text-xs tracking-[0] leading-[normal]">
          Scale: 1.618
        </div>
      </header>

      {typographyData.map((item, index) => (
        <section
          key={index}
          className="inline-flex items-center gap-8 flex-[0_0_auto] bg-white"
        >
          <div className="flex flex-col w-16 items-end gap-1 bg-white">
            <div className="w-fit mt-[-1.00px] opacity-40 [font-family:'Inter',Helvetica] font-normal text-black text-xs tracking-[0] leading-[normal]">
              {item.px}
            </div>

            <div className="w-fit opacity-40 [font-family:'Inter',Helvetica] font-normal text-black text-xs tracking-[0] leading-[normal]">
              {item.rem}
            </div>
          </div>

          <div
            className={`w-fit ${index === 0 ? "mt-[-1.00px]" : index === 1 ? "mt-[-1.00px]" : index === 2 ? "mt-[-1.00px]" : ""} text-black whitespace-nowrap ${item.fontClass}`}
          >
            {item.text}
          </div>
        </section>
      ))}
    </main>
  );
};
