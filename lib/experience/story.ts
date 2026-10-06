import type { Heading } from "@/design-system/demo/project-story";

type NodeCopy = { name: string; sub: string; analogy: string };

export interface EscaneoStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (level: number) => string; yes: string; no: string; levelLabel: string; level: (n: number) => string; checks: string[]; checking: string; nothing: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; mine: (level: number) => string; all: string; slipped: string; sentence: (mine: number, all: number) => string; verdict: (slipped: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; statusLabels: { active: string; danger: string; success: string }; tapeLabel: string; nodes: { receipts: NodeCopy; cashier: NodeCopy; accepted: NodeCopy; held: NodeCopy }; tape: { served: string; rerouted: string; lost: string }; slippedOf: (n: number) => string };
}

export const STORY: Record<"en" | "es", EscaneoStory> = {
  en: {
    name: "OCR validation",
    oneLiner: "The more things the cashier checks, the fewer receipts with errors get past.",
    chips: ["Document reading", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "A cashier who takes every banknote as it comes will end up with a fake one in the till. One who holds it to the light, feels the paper and checks the thread catches most of them.",
        "Here the banknotes are receipts read by a scanner, and the scanner sometimes misreads a digit. The slider decides how many checks the cashier runs before accepting a receipt.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "the banknotes", means: "receipts read by the scanner" },
        { term: "the cashier", means: "the validation step" },
        { term: "holding it to the light", means: "one check on the fields" },
        { term: "a fake in the till", means: "a receipt with an error accepted" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Twelve receipts read by a scanner. Six came out right and six have one field misread.",
      question: (n) => `Before you run it, place a bet: with ${n} ${n === 1 ? "check" : "checks"}, are all 6 receipts with errors held?`,
      yes: "Yes, all 6",
      no: "No, some get past",
      levelLabel: "Checks the cashier runs",
      level: (n) => `${n} of 5`,
      checks: ["each field's format", "an allowed currency", "a date that exists", "the reference check digit", "the account check digit"],
      checking: "Checking",
      nothing: "Checking nothing",
      note: "Each square is one receipt. The checks switch on in the order above, cheapest first.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The receipts could not be checked. Try another number of checks.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "Your checks", accent: "or all five" },
      lead: "Same receipts, same scanner. The only change is how many checks run.",
      mine: (n) => `Your checks (${n})`,
      all: "All 5 checks",
      slipped: "receipts with errors accepted",
      sentence: (mine, all) => {
        if (mine === all) return mine === 0 ? "Both caught every receipt with an error." : `Both let ${mine} ${mine === 1 ? "receipt" : "receipts"} with errors through.`;
        if (mine < all) return `This time fewer checks did better: ${mine} got past against ${all}.`;
        return `With your checks, ${mine} ${mine === 1 ? "receipt with an error was" : "receipts with errors were"} accepted. With all five, ${all === 0 ? "none" : all}.`;
      },
      verdict: (n) => n === 0 ? "No receipt with an error got past" : n === 1 ? "1 receipt with an error got past" : `${n} receipts with errors got past`,
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When scanned documents feed payments or accounting and a wrong digit sends money to the wrong place. I think of supplier receipts going into a payment run.",
      notLabel: "Not needed",
      not: "When a person already re-types every document, or when the data never drives a payment or a decision.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I stopped trusting the scanner's own accuracy and measured what reaches the next step. A scanner that reads 90% of fields right still sends half of these receipts out with an error if nobody checks them.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "Checks in order: format per field, currency allowlist, calendar date, reference check digit, account Luhn. The level switches on the first n.",
        "On these 12 receipts the last two checks add nothing: the three cheap ones already catch all six errors. They exist for one-digit swaps that keep the right format.",
        "No clean receipt is held at any level. The per-receipt outcome for every level is pinned in a fixture shared by TypeScript and Python.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "What the cashier did with each receipt",
      caption: "Watch the receipts come in four at a time.",
      statusLabels: { active: "checking", success: "in use", danger: "accepted errors" },
      tapeLabel: "Twelve scanned receipts, in order",
      nodes: {
        receipts: { name: "Receipts", sub: "12 scanned", analogy: "the banknotes" },
        cashier: { name: "Checks", sub: "before accepting", analogy: "the cashier" },
        accepted: { name: "Accepted", sub: "goes to payment", analogy: "the till" },
        held: { name: "Held", sub: "a person reviews", analogy: "set aside" },
      },
      tape: { served: "correct and accepted", rerouted: "held for review", lost: "error accepted" },
      slippedOf: (n) => `Receipts with errors accepted: ${n} of 6`,
    },
  },
  es: {
    name: "Escaneo",
    oneLiner: "Entre más cosas revisa el cajero, menos recibos con errores se le cuelan.",
    chips: ["Lectura de documentos", "2 min", "Demo en vivo"],
    analogy: {
      heading: { accent: "La analogía" },
      paragraphs: [
        "Un cajero que acepta cada billete como llega va a terminar con uno falso en la caja. Uno que lo revisa a contraluz, toca el papel y busca el hilo atrapa casi todos.",
        "Aquí los billetes son recibos leídos por un escáner, y el escáner a veces lee mal un dígito. El slider decide cuántas revisiones hace el cajero antes de aceptar un recibo.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "los billetes", means: "recibos leídos por el escáner" },
        { term: "el cajero", means: "el paso de validación" },
        { term: "revisar a contraluz", means: "una revisión de los campos" },
        { term: "un billete falso en la caja", means: "un recibo con error aceptado" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Doce recibos leídos por un escáner. Seis salieron bien y seis tienen un campo mal leído.",
      question: (n) => `Antes de correrlo, apuesta: con ${n} ${n === 1 ? "revisión" : "revisiones"}, ¿se detienen los 6 recibos con errores?`,
      yes: "Sí, los 6",
      no: "No, alguno pasa",
      levelLabel: "Revisiones que hace el cajero",
      level: (n) => `${n} de 5`,
      checks: ["el formato de cada campo", "una moneda permitida", "una fecha que existe", "el dígito verificador de la referencia", "el dígito verificador de la cuenta"],
      checking: "Revisa",
      nothing: "No revisa nada",
      note: "Cada cuadrito es un recibo. Las revisiones se activan en el orden de arriba, de la más sencilla a la más fina.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudieron revisar los recibos. Prueba con otro número de revisiones.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Tus revisiones", accent: "o las cinco" },
      lead: "Mismos recibos, mismo escáner. Lo único que cambia es cuántas revisiones se hacen.",
      mine: (n) => `Tus revisiones (${n})`,
      all: "Las 5 revisiones",
      slipped: "recibos con error aceptados",
      sentence: (mine, all) => {
        if (mine === all) return mine === 0 ? "Las dos formas detuvieron todos los recibos con error." : `Las dos formas dejaron pasar ${mine} ${mine === 1 ? "recibo" : "recibos"} con error.`;
        if (mine < all) return `Esta vez menos revisiones salieron mejor: pasaron ${mine} contra ${all}.`;
        return `Con tus revisiones se ${mine === 1 ? "aceptó 1 recibo con error" : `aceptaron ${mine} recibos con error`}. Con las cinco, ${all === 0 ? "ninguno" : all}.`;
      },
      verdict: (n) => n === 0 ? "No se coló ningún recibo con error" : n === 1 ? "Se coló 1 recibo con error" : `Se colaron ${n} recibos con error`,
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve", after: "?" },
      worthLabel: "Vale la pena",
      worth: "Cuando los documentos escaneados alimentan pagos o contabilidad y un dígito mal leído manda dinero al lugar equivocado. Pienso en recibos de proveedores que entran a una corrida de pagos.",
      notLabel: "No hace falta",
      not: "Cuando una persona ya vuelve a capturar cada documento, o cuando los datos nunca deciden un pago ni una decisión.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Dejé de fiarme de la precisión del escáner y medí lo que llega al siguiente paso. Un escáner que lee bien el 90% de los campos igual manda la mitad de estos recibos con un error si nadie los revisa.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Revisiones en orden: formato por campo, lista de monedas, fecha de calendario, dígito verificador de la referencia y Luhn de la cuenta. El nivel activa las primeras n.",
        "En estos 12 recibos las dos últimas no agregan nada: las tres sencillas ya detienen los seis errores. Existen para cambios de un dígito que conservan el formato.",
        "Ningún recibo correcto se detiene en ningún nivel. El resultado por recibo de cada nivel lo fija un fixture que comparten TypeScript y Python.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Lo que hizo el cajero con cada recibo",
      caption: "Mira cómo llegan los recibos de cuatro en cuatro.",
      statusLabels: { active: "revisando", success: "en uso", danger: "aceptó errores" },
      tapeLabel: "Doce recibos escaneados, en orden",
      nodes: {
        receipts: { name: "Recibos", sub: "12 escaneados", analogy: "los billetes" },
        cashier: { name: "Revisiones", sub: "antes de aceptar", analogy: "el cajero" },
        accepted: { name: "Aceptado", sub: "va a pago", analogy: "la caja" },
        held: { name: "Detenido", sub: "lo revisa una persona", analogy: "apartado" },
      },
      tape: { served: "correcto y aceptado", rerouted: "detenido para revisión", lost: "error aceptado" },
      slippedOf: (n) => `Recibos con error aceptados: ${n} de 6`,
    },
  },
};
