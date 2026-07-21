export interface FAQ {
  question: string;
  answer: string;
}

// General company FAQ — separate from the service-specific FAQs embedded in
// each /services/[slug] page.
export const generalFaqs: FAQ[] = [
  {
    question: "Is Top Choice HVAC licensed and insured?",
    answer:
      "Yes. We are fully licensed and insured.", // TODO: confirm exact license/TSSA number and insurance details before launch — see CONTENT-NEEDED.md
  },
  {
    question: "What areas do you serve?",
    answer:
      "We're based in Brampton and serve the surrounding GTA. See our Service Area page for the full list of cities.", // TODO: confirm complete service area list
  },
  {
    question: "How does your pricing work?",
    answer:
      "Every job gets a free in-home assessment and a written quote before any work begins — no surprise charges after the fact.", // TODO: confirm flat-rate vs. estimate-based pricing philosophy
  },
  {
    question: "Do you offer emergency service?",
    answer:
      "Yes — we offer 24/7 emergency response for no-heat and no-AC calls.", // TODO: confirm real emergency response time commitment
  },
  {
    question: "What warranty do you offer on repairs and installations?",
    answer:
      "We back our installations with a labour warranty, in addition to the manufacturer's equipment warranty.", // TODO: confirm exact labour warranty terms and how they interact with manufacturer warranties
  },
  {
    question: "Do you offer financing?",
    answer:
      "Yes — see our Financing page for details and an estimated monthly payment calculator.", // TODO: confirm real financing partner and terms
  },
  {
    question: "Can I get a quote without someone coming to my home?",
    answer:
      "Our instant estimate tool gives you a realistic price range in minutes — we'll confirm the exact price with a quick, free in-home assessment before any work is booked.",
  },
];
