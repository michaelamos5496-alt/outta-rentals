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
  { file: "carl-zeiss.png", name: "Carl Zeiss" },
  { file: "dji.svg", name: "DJI" },
  { file: "dzofilm.png", name: "DZOFilm" },
  { file: "feelworld.png", name: "Feelworld" },
  { file: "freefly.svg", name: "Freefly" },
  { file: "godox.svg", name: "Godox" },
  { file: "hollyland.png", name: "Hollyland" },
  { file: "laowa.svg", name: "Laowa" },
  { file: "lilliput.png", name: "Lilliput" },
  { file: "manfrotto.svg", name: "Manfrotto" },
  { file: "nanlite.png", name: "Nanlite" },
  { file: "nanlux.png", name: "Nanlux" },
  { file: "portkeys.png", name: "PortKeys" },
  { file: "red.png", name: "RED" },
  { file: "sachtler.svg", name: "Sachtler" },
  { file: "sennheiser.svg", name: "Sennheiser" },
  { file: "sigma.svg", name: "Sigma" },
  { file: "smallhd.png", name: "SmallHD" },
  { file: "smallrig.png", name: "SmallRig" },
  { file: "sony.svg", name: "Sony" },
  { file: "teradek.png", name: "Teradek" },
  { file: "tiffen.png", name: "Tiffen" },
  { file: "tilta.svg", name: "Tilta" },
  { file: "zoom.svg", name: "Zoom" },
];

function BrandMarquee() {
  return (
    <section aria-label="Brands we rent" className="border-y border-brand/20 bg-[color-mix(in_oklch,var(--brand)_28%,var(--background))] py-10 sm:py-14">
      <p className="text-label text-center text-brand">Brands we rent</p>
      <div
        className="mt-8 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <ul
          className="animate-marquee flex w-max items-center motion-reduce:animate-none"
          style={{ animationDuration: "60s" }}
        >
          {[...brandLogos, ...brandLogos].map((brand, i) => (
            <li
              key={`${brand.file}-${i}`}
              aria-hidden={i >= brandLogos.length}
              className="flex h-20 w-48 shrink-0 items-center justify-center px-6 sm:h-28 sm:w-72 sm:px-9"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static logo files, mixed SVG/PNG/WebP */}
              <img
                src={`/brands/${brand.file}`}
                alt={i < brandLogos.length ? brand.name : ""}
                loading="lazy"
                className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { BrandMarquee };
