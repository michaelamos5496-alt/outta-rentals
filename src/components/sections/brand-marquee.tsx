/**
 * A slowly sliding strip of the brands OUTTA rents out — the same endless
 * slide as the hero's equipment thumbnails. The list is rendered twice back
 * to back and the track slides exactly one copy's width, so the loop point
 * is invisible. Pauses on hover; stands still for people who prefer reduced motion.
 */
const brandLogos = [
  { file: "arri.svg", name: "ARRI" },
  { file: "aputure.svg", name: "Aputure" },
  { file: "amaran.png", name: "Amaran" },
  { file: "blackmagic-design.svg", name: "Blackmagic Design" },
  { file: "canon.svg", name: "Canon" },
  { file: "dji.svg", name: "DJI" },
  { file: "dzofilm.png", name: "DZOFilm" },
  { file: "freefly.svg", name: "Freefly" },
  { file: "godox.svg", name: "Godox" },
  { file: "hollyland.jpeg", name: "Hollyland" },
  { file: "laowa.svg", name: "Laowa" },
  { file: "manfrotto.svg", name: "Manfrotto" },
  { file: "nanlite.webp", name: "Nanlite" },
  { file: "nanlux.png", name: "Nanlux" },
  { file: "red.jpeg", name: "RED" },
  { file: "sachtler.svg", name: "Sachtler" },
  { file: "sennheiser.svg", name: "Sennheiser" },
  { file: "sigma.svg", name: "Sigma" },
  { file: "smallhd.png", name: "SmallHD" },
  { file: "smallrig.png", name: "SmallRig" },
  { file: "sony.svg", name: "Sony" },
  { file: "teradek.webp", name: "Teradek" },
  { file: "tiffen.webp", name: "Tiffen" },
  { file: "tilta.svg", name: "Tilta" },
  { file: "zoom.svg", name: "Zoom" },
];

function BrandMarquee() {
  return (
    <section aria-label="Brands we rent" className="border-y border-border bg-background py-8 sm:py-10">
      <p className="text-label text-center text-muted-foreground">Brands we rent</p>
      <div
        className="mt-6 overflow-hidden bg-background"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <ul
          className="animate-marquee flex w-max items-center bg-background motion-reduce:animate-none"
          style={{ animationDuration: "60s" }}
        >
          {[...brandLogos, ...brandLogos].map((brand, i) => (
            <li
              key={`${brand.file}-${i}`}
              aria-hidden={i >= brandLogos.length}
              className="flex h-12 w-36 shrink-0 items-center justify-center px-5 sm:h-14 sm:w-44 sm:px-7"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static logo files, mixed SVG/PNG/WebP */}
              <img
                src={`/brands/${brand.file}`}
                alt={i < brandLogos.length ? brand.name : ""}
                loading="lazy"
                className="max-h-full max-w-full object-contain opacity-70 mix-blend-multiply grayscale contrast-125 transition duration-300 hover:opacity-100 hover:grayscale-0 hover:contrast-100"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { BrandMarquee };
