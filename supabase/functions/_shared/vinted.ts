// Vinted-gegevens die overal gelijk zijn (id's van kleuren, staat en materiaal) en hulp voor de categorieboom.
// De boom zelf verschilt per gebruiker (Vinted test nieuwe indelingen); de extensie stuurt daarom de eigen boom
// van de gebruiker mee. Zonder die boom gebruiken we een Engelse momentopname (vinted.co.uk, 16-11-2026).
import snapshot from "./vinted-catalog-en.json" with { type: "json" };

export type CatalogNode = [id: number, parentId: number, title: string];

export interface CatalogTree {
  source: "client" | "snapshot";
  lang: string;
  byId: Map<number, { id: number; parent: number; title: string; children: number[] }>;
  roots: number[];
}

/** Vinted-staat: id's zijn in alle landen gelijk. */
export const CONDITIONS = {
  new_with_tags: { id: 6, legacy: "nieuw" },
  new_without_tags: { id: 1, legacy: "nieuw_zonder" },
  very_good: { id: 2, legacy: "zeer_goed" },
  good: { id: 3, legacy: "goed" },
  satisfactory: { id: 4, legacy: "redelijk" },
} as const;
export type ConditionKey = keyof typeof CONDITIONS;

/** Vinted-kleuren (code → id), zoals in /api/v2/item_upload/colors. */
export const COLORS: Record<string, number> = {
  BLACK: 1, GREY: 3, WHITE: 12, CREAM: 20, BEIGE: 4, APRICOT: 21, ORANGE: 11, CORAL: 22, RED: 7,
  BURGUNDY: 23, PINK: 5, ROSE: 24, PURPLE: 6, LILAC: 25, LIGHT_BLUE: 26, BLUE: 9, NAVY: 27,
  TURQUOISE: 17, MINT: 30, GREEN: 10, DARK_GREEN: 28, KHAKI: 16, BROWN: 2, MUSTARD: 29, YELLOW: 8,
  SILVER: 13, GOLD: 14, MULTI: 15, CLEAR: 32,
};

/** Kleurnamen voor de tekst in de popup ("Kleur: zwart"). */
export const COLOR_NAMES: Record<string, [nl: string, en: string]> = {
  BLACK: ["zwart", "black"], GREY: ["grijs", "grey"], WHITE: ["wit", "white"], CREAM: ["crème", "cream"],
  BEIGE: ["beige", "beige"], APRICOT: ["abrikoos", "apricot"], ORANGE: ["oranje", "orange"], CORAL: ["koraal", "coral"],
  RED: ["rood", "red"], BURGUNDY: ["bordeaux", "burgundy"], PINK: ["roze", "pink"], ROSE: ["oudroze", "rose"],
  PURPLE: ["paars", "purple"], LILAC: ["lila", "lilac"], LIGHT_BLUE: ["lichtblauw", "light blue"], BLUE: ["blauw", "blue"],
  NAVY: ["donkerblauw", "navy"], TURQUOISE: ["turquoise", "turquoise"], MINT: ["mintgroen", "mint"], GREEN: ["groen", "green"],
  DARK_GREEN: ["donkergroen", "dark green"], KHAKI: ["kaki", "khaki"], BROWN: ["bruin", "brown"], MUSTARD: ["mosterdgeel", "mustard"],
  YELLOW: ["geel", "yellow"], SILVER: ["zilver", "silver"], GOLD: ["goud", "gold"], MULTI: ["meerkleurig", "multicolour"],
  CLEAR: ["transparant", "clear"],
};

/** Vinted-materialen (naam → id). Welke er zichtbaar zijn hangt af van de categorie. */
export const MATERIALS: Record<string, number> = {
  Acrylic: 149, Alpaca: 122, Bamboo: 440, Canvas: 441, Cardboard: 442, Cashmere: 123, Ceramic: 443,
  Chiffon: 444, Corduroy: 299, Cotton: 44, Denim: 303, Down: 445, Elastane: 53, "Faux fur": 446,
  "Faux leather": 447, Felt: 448, Flannel: 451, Fleece: 120, Foam: 449, Glass: 452, Gold: 453, Jute: 454,
  Lace: 455, Latex: 302, Leather: 43, Linen: 146, Merino: 121, Mesh: 456, Metal: 457, Mohair: 152,
  Neoprene: 178, Nylon: 52, Paper: 458, "Patent leather": 305, Plastic: 300, Polyester: 45,
  Porcelain: 459, Rattan: 460, Rubber: 301, Satin: 311, Sequin: 226, Silicone: 470, Silk: 49, Silver: 461,
  Steel: 468, Stone: 462, Straw: 463, Suede: 298, Tulle: 464, Tweed: 465, Velour: 177, Velvet: 466,
  Viscose: 48, Wood: 467, Wool: 46,
};

const MAX_NODES = 8000;
const MAX_TITLE = 120;

function buildTree(nodes: unknown, source: CatalogTree["source"], lang: string): CatalogTree | null {
  if (!Array.isArray(nodes) || nodes.length === 0 || nodes.length > MAX_NODES) return null;
  const byId: CatalogTree["byId"] = new Map();
  for (const n of nodes) {
    if (!Array.isArray(n) || n.length < 3) return null;
    const [id, parent, title] = n;
    if (!Number.isInteger(id) || !Number.isInteger(parent) || typeof title !== "string") return null;
    if (id <= 0 || title.length === 0 || title.length > MAX_TITLE) return null;
    byId.set(id, { id, parent, title: title.replace(/\s+/g, " ").trim(), children: [] });
  }
  const roots: number[] = [];
  for (const node of byId.values()) {
    const p = node.parent ? byId.get(node.parent) : undefined;
    if (p) p.children.push(node.id);
    else roots.push(node.id);
  }
  if (roots.length === 0 || roots.length > 30) return null;
  return { source, lang, byId, roots };
}

let snapshotTree: CatalogTree | null = null;
export function snapshotCatalog(): CatalogTree {
  if (!snapshotTree) snapshotTree = buildTree((snapshot as { nodes: unknown }).nodes, "snapshot", "en")!;
  return snapshotTree;
}

/** De boom die de extensie meestuurt (de eigen boom van de gebruiker), of null als hij niet bruikbaar is. */
export function clientCatalog(raw: unknown): CatalogTree | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { v?: unknown; lang?: unknown; nodes?: unknown };
  if (r.v !== 1) return null;
  const lang = typeof r.lang === "string" ? r.lang.slice(0, 10) : "?";
  return buildTree(r.nodes, "client", lang);
}

export function pathOf(tree: CatalogTree, id: number): string[] {
  const parts: string[] = [];
  let cur = tree.byId.get(id);
  let guard = 0;
  while (cur && guard++ < 12) {
    parts.unshift(cur.title);
    cur = cur.parent ? tree.byId.get(cur.parent) : undefined;
  }
  return parts;
}

export function isLeaf(tree: CatalogTree, id: number): boolean {
  const n = tree.byId.get(id);
  return !!n && n.children.length === 0;
}

/** Hoofdcategorieën met hun eerste laag eronder, voor de eerste AI-stap. */
export function topLevelOverview(tree: CatalogTree): string {
  return tree.roots
    .map((id) => {
      const n = tree.byId.get(id)!;
      const kids = n.children.map((c) => tree.byId.get(c)!.title).slice(0, 14).join(", ");
      return `${id}: ${n.title} (${kids})`;
    })
    .join("\n");
}

/** Alle eindcategorieën onder de gekozen hoofdcategorieën, als "id: pad". */
export function leafLines(tree: CatalogTree, rootIds: number[]): { lines: string; ids: Set<number> } {
  const ids = new Set<number>();
  const lines: string[] = [];
  const walk = (id: number) => {
    const n = tree.byId.get(id);
    if (!n) return;
    if (n.children.length === 0) {
      ids.add(id);
      lines.push(`${id}: ${pathOf(tree, id).join(" > ")}`);
    } else n.children.forEach(walk);
  };
  rootIds.forEach(walk);
  return { lines: lines.join("\n"), ids };
}

function words(s: string): string[] {
  return s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N} ]+/gu, " ").split(/\s+/).filter((w) => w.length > 2);
}

/** Noodoplossing als de tweede AI-stap faalt: de eindcategorie waarvan het pad het meest lijkt op de gok. */
export function lexicalBestLeaf(tree: CatalogTree, candidateIds: Set<number>, guess: string): number | null {
  const g = new Set(words(guess));
  if (g.size === 0) return null;
  let best: number | null = null;
  let bestScore = 0;
  for (const id of candidateIds) {
    const p = pathOf(tree, id);
    const leafWords = words(p[p.length - 1]);
    const pathWords = words(p.join(" "));
    let score = 0;
    for (const w of pathWords) if (g.has(w)) score += 1;
    for (const w of leafWords) if (g.has(w)) score += 2;
    if (/^other|^overig|^autre|^sonstige/i.test(p[p.length - 1])) score -= 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}
