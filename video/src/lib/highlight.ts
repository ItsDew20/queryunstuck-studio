// Tiny, dependency-free tokenizer. Good enough for on-screen snippets (not a parser).
import type { CodeLang } from "../types";

export type TokenType =
  | "keyword"
  | "function"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "identifier"
  | "punctuation"
  | "space";

export interface Token {
  type: TokenType;
  text: string;
}

const SQL_KEYWORDS = new Set(
  `select from where group by having order limit offset join inner left right full outer cross on as and or not
  in is null like ilike between case when then else end distinct union all intersect except with insert into values
  update set delete create table view index drop alter add primary key foreign references asc desc over partition
  rows range preceding following current row unbounded exists true false cast interval qualify window filter
  using natural lateral returning materialized recursive if replace temp temporary default`
    .split(/\s+/)
    .filter(Boolean),
);

const SQL_FUNCTIONS = new Set(
  `count sum avg min max coalesce nullif row_number rank dense_rank lag lead first_value last_value ntile
  date_trunc extract round abs lower upper length substring concat now current_date string_agg array_agg
  percentile_cont median strftime date datediff dateadd`
    .split(/\s+/)
    .filter(Boolean),
);

const PY_KEYWORDS = new Set(
  `def return if elif else for while in not and or is None True False import from as class with try except finally
  raise lambda yield pass break continue global nonlocal assert async await del`
    .split(/\s+/)
    .filter(Boolean),
);

const BASH_KEYWORDS = new Set(`if then else fi for do done while case esac function in export local return`.split(" "));

const DAX_KEYWORDS = new Set(`var return evaluate define measure table column order by asc desc`.split(" "));

const keywordsFor = (lang: CodeLang): Set<string> => {
  switch (lang) {
    case "sql":
      return SQL_KEYWORDS;
    case "python":
      return PY_KEYWORDS;
    case "bash":
      return BASH_KEYWORDS;
    case "dax":
      return DAX_KEYWORDS;
    default:
      return new Set();
  }
};

const commentStart = (lang: CodeLang): RegExp | null => {
  if (lang === "sql" || lang === "dax") return /^--.*/;
  if (lang === "python" || lang === "bash" || lang === "yaml") return /^#.*/;
  return null;
};

const RULES: Array<[TokenType, RegExp]> = [
  ["space", /^\s+/],
  ["string", /^'(?:[^'\\]|\\.|'')*'?/],
  ["string", /^"(?:[^"\\]|\\.)*"?/],
  ["number", /^\d+(?:\.\d+)?\b/],
  ["identifier", /^[A-Za-z_][A-Za-z0-9_]*/],
  ["operator", /^(?:<=|>=|<>|!=|==|\|\||::|[=<>+\-*/%])/],
  ["punctuation", /^[(),.;:[\]{}]/],
];

/** Tokenize a single line. */
export const tokenizeLine = (line: string, lang: CodeLang): Token[] => {
  if (lang === "text") return [{ type: "identifier", text: line }];
  const out: Token[] = [];
  const kws = keywordsFor(lang);
  const cmt = commentStart(lang);
  let rest = line;
  while (rest.length > 0) {
    if (cmt) {
      const m = rest.match(cmt);
      if (m) {
        out.push({ type: "comment", text: m[0] });
        break;
      }
    }
    let matched = false;
    for (const [type, re] of RULES) {
      const m = rest.match(re);
      if (!m) continue;
      let t: TokenType = type;
      const text = m[0];
      if (type === "identifier") {
        const lower = text.toLowerCase();
        const next = rest.slice(text.length).trimStart();
        if (lang === "python" ? kws.has(text) : kws.has(lower)) t = "keyword";
        else if (SQL_FUNCTIONS.has(lower) && next.startsWith("(")) t = "function";
        else if (next.startsWith("(")) t = "function";
      }
      out.push({ type: t, text });
      rest = rest.slice(text.length);
      matched = true;
      break;
    }
    if (!matched) {
      out.push({ type: "punctuation", text: rest[0] });
      rest = rest.slice(1);
    }
  }
  return out;
};
