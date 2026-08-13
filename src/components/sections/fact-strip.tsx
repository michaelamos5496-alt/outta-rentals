import { Container } from "@/components/ui/container";

// MCB-style fact row under the hero — real, verifiable facts only (no
// invented client counts or founding dates OUTTA hasn't confirmed).
export interface FactStripProps {
  equipmentCount: number;
  categoryCount: number;
}

function FactStrip({ equipmentCount, categoryCount }: FactStripProps) {
  const facts = [
    { value: `${equipmentCount}+`, label: "Real equipment items" },
    { value: `${categoryCount}`, label: "Equipment categories" },
    { value: "WhatsApp", label: "Book in minutes" },
    { value: "Ghana-Wide", label: "Delivery available" },
  ];

  return (
    <div className="border-b-2 border-foreground bg-background">
      <Container>
        <div className="grid grid-cols-2 divide-x-2 divide-y-2 divide-foreground border-x-2 border-foreground sm:grid-cols-4 sm:divide-y-0">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col items-center gap-1 px-4 py-6 text-center">
              <p className="font-heading text-2xl font-bold text-brand sm:text-3xl">{fact.value}</p>
              <p className="text-label">{fact.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

export { FactStrip };
