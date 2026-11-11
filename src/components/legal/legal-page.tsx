import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Divider } from "@/components/ui/divider";
import type { LegalDocument } from "@/lib/content/legal";

function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <Section className="pt-16 pb-24 sm:pt-20">
      <div className="max-w-2xl">
        <Heading level="display" eyebrow={document.eyebrow}>
          {document.title}
        </Heading>
        <p className="text-meta mt-4">Last updated {document.lastUpdated}</p>
        <p className="text-body mt-6">{document.intro}</p>
      </div>

      <Divider className="my-10" />

      <div className="flex max-w-2xl flex-col gap-10">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-h3">{section.heading}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="text-body">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Section>
  );
}

export { LegalPage };
