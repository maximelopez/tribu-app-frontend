import type { LegalText } from '../legal';

// Affiche un texte légal (politique de confidentialité ou CGU) : titres et paragraphes
export default function LegalDocument({ text }: { text: LegalText }) {
  return (
    <article className="flex flex-col" style={{ gap: 20 }}>
      <p className="font-outfit m-0" style={{ fontSize: 14, color: '#777777' }}>
        Mis à jour le {text.updatedAt}
      </p>

      {text.sections.map(section => (
        <section key={section.title} className="flex flex-col" style={{ gap: 8 }}>
          <h2 className="font-outfit-bold font-normal m-0" style={{ fontSize: 18, color: '#161616' }}>
            {section.title}
          </h2>
          {section.paragraphs.map(paragraph => (
            <p key={paragraph} className="font-outfit text-base m-0" style={{ lineHeight: 1.45, color: '#3D3D3D' }}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
