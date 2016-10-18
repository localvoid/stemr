/**
 * Snowball (Porter2) stemming algorithm.
 *
 * http://snowball.tartarus.org/algorithms/english/stemmer.html
 */

// Exceptional forms
const EXCEPTIONAL_FORMS: { [k: string]: string } = {
  "skis": "ski",
  "skies": "sky",
  "dying": "die",
  "lying": "lie",
  "tying": "tie",
  "idly": "idl",
  "gently": "gentl",
  "ugly": "ugli",
  "early": "earli",
  "only": "onli",
  "singly": "singl",
  "sky": "sky",
  "news": "news",
  "howe": "howe",
  "atlas": "atlas",
  "cosmos": "cosmos",
  "bias": "bias",
  "andes": "andes"
};

// Exceptional forms post 1a step
const EXCEPTIONAL_FORMS_POST_1A: { [k: string]: number } = {
  "inning": 0,
  "outing": 0,
  "canning": 0,
  "herring": 0,
  "earring": 0,
  "proceed": 0,
  "exceed": 0,
  "succeed": 0
};

const RANGE_RE = /[^aeiouy]*[aeiouy]+[^aeiouy](\w*)/;

function getR1(word: string): number {
  if (word.startsWith("gener") || word.startsWith("arsen")) {
    return 5;
  }
  if (word.startsWith("commun")) {
    return 6;
  }

  const match = RANGE_RE.exec(word);
  if (match) {
    return word.length - match[1].length;
  }

  return word.length;
}

function getR2(word: string): number {
  const match = RANGE_RE.exec(word.slice(getR1(word)));
  if (match) {
    return word.length - match[1].length;
  }

  return word.length;
}

const EWSS1_RE = /^[aeiouy][^aeiouy]$/;
const EWSS2_RE = /.*[^aeiouy][aeiouy][^aeiouywxY]$/;

function isEndsWithShortSyllable(word: string): boolean {
  if (word.length === 2) {
    return EWSS1_RE.test(word);
  }
  return EWSS2_RE.test(word);
}

function isShortWord(word: string): boolean {
  return (isEndsWithShortSyllable(word) && getR1(word) === word.length);
}

// Capitalize consonant regexp
const CCY_RE = /([aeiouy])y/g;

function capitalizeConsonantYs(word: string): string {
  if (word.charCodeAt(0) === 121) { // "y" === 121
    word = "Y" + word.slice(1);
  }
  return word.replace(CCY_RE, "$1Y");
}

function step0(word: string): string {
  if (word.endsWith("'s'")) {
    return word.slice(0, -3);
  }
  if (word.endsWith("'s")) {
    return word.slice(0, -2);
  }
  if (word.endsWith("'")) {
    return word.slice(0, -1);
  }
  return word;
}

const S1A_RE = /[aeiouy]./;

function step1a(word: string): string {
  if (word.endsWith("sses")) {
    return word.slice(0, -4) + "ss";
  }
  if (word.endsWith("ied") || word.endsWith("ies")) {
    return word.slice(0, -3) + ((word.length > 4) ? "i" : "ie");
  }
  if (word.endsWith("us") || word.endsWith("ss")) {
    return word;
  }
  if (word.endsWith("s")) {
    const preceding = word.slice(0, -1);
    if (S1A_RE.test(preceding)) {
      return preceding;
    }
  }
  return word;
}

const DOUBLE_RE = /(bb|dd|ff|gg|mm|nn|pp|rr|tt)$/;

function isEndsWithDouble(word: string): boolean {
  return DOUBLE_RE.test(word);
}

function step1bHelper(word: string): string {
  if (word.endsWith("at") || word.endsWith("bl") || word.endsWith("iz")) {
    return word + "e";
  }
  if (isEndsWithDouble(word)) {
    return word.slice(0, -1);
  }
  if (isShortWord(word)) {
    return word + "e";
  }
  return word;
}

const S1BSUFFIXES_RE = /(ed|edly|ing|ingly)$/;
const S1B_RE = /[aeiouy]/;

function step1b(word: string, r1: number): string {
  if (word.endsWith("eedly")) {
    if (word.length - 5 >= r1) {
      return word.slice(0, -3);
    }
    return word;
  }
  if (word.endsWith("eed")) {
    if (word.length - 3 >= r1) {
      return word.slice(0, -1);
    }
    return word;
  }
  const match = S1BSUFFIXES_RE.exec(word);
  if (match) {
    const preceding = word.slice(0, -match[0].length);
    if (S1B_RE.test(preceding)) {
      return step1bHelper(preceding);
    }
  }

  return word;
}

function step1c(word: string): string {
  if (word.endsWith("y") || word.endsWith("Y") && word.length > 1) {
    const c = word.charCodeAt(word.length - 2);
    if (word.length > 2) {
      // "a|e|i|o|u|y"
      if (c < 97 || c > 121 || (c !== 97 && c !== 101 && c !== 105 && c !== 111 && c !== 117 && c !== 121)) {
        return word.slice(0, -1) + "i";
      }
    }
  }
  return word;
}

function step2Helper(word: string, r1: number, end: string, repl: string, prev: string[] | null): string | null {
  if (word.endsWith(end)) {
    if ((word.length - end.length) >= r1) {
      const w = word.slice(0, -end.length);
      if (prev === null) {
        return w + repl;
      }
      for (let i = 0; i < prev.length; i++) {
        const p = prev[i];
        if (w.endsWith(p)) {
          return w + repl;
        }
      }
    }
    return word;
  }
  return null;
}

const S2_TRIPLES: Array<[string, string, Array<string> | null]> = [
  ["ization", "ize", null],
  ["ational", "ate", null],
  ["fulness", "ful", null],
  ["ousness", "ous", null],
  ["iveness", "ive", null],
  ["tional", "tion", null],
  ["biliti", "ble", null],
  ["lessli", "less", null],
  ["entli", "ent", null],
  ["ation", "ate", null],
  ["alism", "al", null],
  ["aliti", "al", null],
  ["ousli", "ous", null],
  ["iviti", "ive", null],
  ["fulli", "ful", null],
  ["enci", "ence", null],
  ["anci", "ance", null],
  ["abli", "able", null],
  ["izer", "ize", null],
  ["ator", "ate", null],
  ["alli", "al", null],
  ["bli", "ble", null],
  ["ogi", "og", ["l"]],
  ["li", "", ["c", "d", "e", "g", "h", "k", "m", "n", "r", "t"]]
];

function step2(word: string, r1: number): string {
  for (let i = 0; i < S2_TRIPLES.length; i++) {
    const trip = S2_TRIPLES[i];
    const attempt = step2Helper(word, r1, trip[0], trip[1], trip[2]);
    if (attempt !== null) {
      return attempt;
    }
  }
  return word;
}

function step3Helper(word: string, r1: number, r2: number, end: string, repl: string, r2_necessary: boolean)
  : string | null {

  if (word.endsWith(end)) {
    if (word.length - end.length >= r1) {
      if (!r2_necessary) {
        return word.slice(0, -end.length) + repl;
      } else if (word.length - end.length >= r2) {
        return word.slice(0, -end.length) + repl;
      }
    }
    return word;
  }
  return null;
}

const S3_TRIPLES: Array<[string, string, boolean]> = [
  ["ational", "ate", false],
  ["tional", "tion", false],
  ["alize", "al", false],
  ["icate", "ic", false],
  ["iciti", "ic", false],
  ["ative", "", true],
  ["ical", "ic", false],
  ["ness", "", false],
  ["ful", "", false]
];

function step3(word: string, r1: number, r2: number): string {
  for (let i = 0; i < S3_TRIPLES.length; i++) {
    const trip = S3_TRIPLES[i];
    const attempt = step3Helper(word, r1, r2, trip[0], trip[1], trip[2]);
    if (attempt !== null) {
      return attempt;
    }
  }
  return word;
}

const S4_DELETE_LIST = ["al", "ance", "ence", "er", "ic", "able", "ible", "ant", "ement", "ment", "ent", "ism", "ate",
  "iti", "ous", "ive", "ize"];

function step4(word: string, r2: number): string {
  for (let i = 0; i < S4_DELETE_LIST.length; i++) {
    const end = S4_DELETE_LIST[i];
    if (word.endsWith(end)) {
      if (word.length - end.length >= r2) {
        return word.slice(0, -end.length);
      }
      return word;
    }
  }

  if (word.endsWith("sion") || word.endsWith("tion")) {
    if (word.length - 3 >= r2) {
      return word.slice(0, -3);
    }
  }

  return word;
}

function step5(word: string, r1: number, r2: number): string {
  if (word.endsWith("l")) {
    if (word.length - 1 >= r2 && word.charCodeAt(word.length - 2) === 108) { // l === 108
      return word.slice(0, -1);
    }
    return word;
  }

  if (word.endsWith("e")) {
    if (word.length - 1 >= r2) {
      return word.slice(0, -1);
    }
    if (word.length - 1 >= r1 && !isEndsWithShortSyllable(word.slice(0, -1))) {
      return word.slice(0, -1);
    }
  }

  return word;
}

const NORMALIZE_YS_RE = /Y/g;

function normalizeYs(word: string): string {
  return word.replace(NORMALIZE_YS_RE, "y");
}

export function stem(word: string): string {
  if (word.length < 3) {
    return word;
  }

  // remove initial apostrophe
  if (word.charCodeAt(0) === 39) { // "'" === 39
    word = word.slice(1);
  }

  // handle exceptional forms
  if (EXCEPTIONAL_FORMS.hasOwnProperty(word)) {
    return EXCEPTIONAL_FORMS[word];
  }

  word = capitalizeConsonantYs(word);

  const r1 = getR1(word);
  const r2 = getR2(word);

  word = step0(word);
  word = step1a(word);

  // handle exceptional forms post 1a
  if (EXCEPTIONAL_FORMS_POST_1A.hasOwnProperty(word)) {
    return word;
  }

  word = step1b(word, r1);
  word = step1c(word);
  word = step2(word, r1);
  word = step3(word, r1, r2);
  word = step4(word, r2);
  word = step5(word, r1, r2);
  word = normalizeYs(word);

  return word;
}
