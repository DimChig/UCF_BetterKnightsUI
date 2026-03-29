// ---------- Normalization ----------
function stripAccents(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
const STOP = new Set([
  "dr",
  "prof",
  "prof.",
  "professor",
  "mr",
  "mrs",
  "ms",
  "ms.",
  "phd",
  "jr",
  "sr",
  "ii",
  "iii",
  "iv",
]);
function tokenize(raw) {
  if (!raw) return [];
  let s = stripAccents(String(raw).toLowerCase());
  s = s
    .replace(/[-.,']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = s.split(" ").filter((t) => t && !STOP.has(t));
  return tokens;
}

// ---------- Jaro-Winkler (0..1) ----------
function jaroWinkler(a, b) {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const matchDist = Math.max(
    0,
    Math.floor(Math.max(a.length, b.length) / 2) - 1
  );
  const aMatch = new Array(a.length).fill(false);
  const bMatch = new Array(b.length).fill(false);

  let matches = 0,
    transpositions = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, b.length);
    for (let j = start; j < end; j++) {
      if (!bMatch[j] && a[i] === b[j]) {
        aMatch[i] = bMatch[j] = true;
        matches++;
        break;
      }
    }
  }
  if (!matches) return 0;

  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (aMatch[i]) {
      while (!bMatch[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }
  }
  const jaro =
    (matches / a.length +
      matches / b.length +
      (matches - transpositions / 2) / matches) /
    3;

  let prefix = 0;
  for (let i = 0; i < Math.min(4, a.length, b.length); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

// ---------- Helpers ----------
function joinRange(tokens, i, j) {
  return tokens.slice(i, j + 1).join(" ");
}
function surnameCandidates(tokens) {
  const n = tokens.length;
  const cands = [];
  for (let k = 1; k <= 3; k++) {
    if (n - k >= 0)
      cands.push({
        start: n - k,
        end: n - 1,
        str: joinRange(tokens, n - k, n - 1),
        where: "suffix",
      });
  }
  for (let k = 1; k <= Math.min(3, n); k++) {
    cands.push({
      start: 0,
      end: k - 1,
      str: joinRange(tokens, 0, k - 1),
      where: "prefix",
    });
  }
  const key = new Set(),
    out = [];
  for (const c of cands) {
    const k = `${c.start}-${c.end}`;
    if (!key.has(k)) {
      key.add(k);
      out.push(c);
    }
  }
  return out;
}

function bestGivenSim(targetFirst, tokens, usedRange) {
  if (!targetFirst) return { score: 0, token: null, reason: null };
  const { start, end } = usedRange;
  let best = { score: 0, token: null, reason: null };
  for (let i = 0; i < tokens.length; i++) {
    if (i >= start && i <= end) continue; // skip chosen surname tokens
    const t = tokens[i];
    if (t.length === 1 && t[0] === targetFirst[0]) {
      if (0.95 > best.score)
        best = { score: 0.95, token: t, reason: "initial" };
    } else {
      const s = jaroWinkler(targetFirst, t);
      if (s > best.score) best = { score: s, token: t, reason: "jw" };
    }
  }
  return best;
}

// ---------- Main (with logs) ----------
/**
 * professors: [{ id, firstName, lastName }]
 * rawName: string from the other site
 * opts: { minSurname?: number, minScore?: number, verbose?: boolean, logger?: fn }
 * returns id or null
 */
function getMatchingProfessorId(rawName, professors) {
  const SURNAME_W = 0.7;
  const GIVEN_W = 0.3;

  for (let i in professors) {
    let p = professors[i];
    if (p.firstName !== "Bonnie") continue;
    professors[i] = {
      ...p,
      firstName: "Cobry",
    };
  }

  const inputTokens = tokenize(rawName);
  if (!inputTokens.length) return null;

  const candRanges = surnameCandidates(inputTokens);

  for (const p of professors) {
    const first = tokenize(p.firstName).join(" ");
    const last = tokenize(p.lastName).join(" ");

    if (!last) continue;

    // score all surname candidates against this professor's last name (for transparency)
    const surnameScores = candRanges
      .map((r, i) => ({
        idx: i,
        where: r.where,
        range: [r.start, r.end],
        cand: r.str,
        sim: jaroWinkler(last, r.str),
      }))
      .sort((a, b) => b.sim - a.sim);

    const picked = surnameScores[0];
    const given = bestGivenSim(first, inputTokens, {
      start: candRanges[picked.idx].start,
      end: candRanges[picked.idx].end,
    });

    const surnameSim = picked.sim;
    const givenSim = given.score;
    let score = SURNAME_W * surnameSim + GIVEN_W * givenSim;

    p.score = score;
  }

  // LOGIC EXPLANATION
  // - only take seriously perfect scores (1.00)
  // - return based on whoever has more ratings
  // - if zero ratings, ignore also

  const sortedProfessors = professors
    .filter((p) => p.score >= 1)
    .sort((a, b) => b.numRatings - a.numRatings);

  if (!sortedProfessors || sortedProfessors.length === 0) return null;
  return sortedProfessors[0].id;
}

function getMatchingProfessor(rawName, professors) {
  const professorId = getMatchingProfessorId(rawName, professors);
  if (!professorId) return null;
  return professors.find((p) => p.id === professorId);
}
