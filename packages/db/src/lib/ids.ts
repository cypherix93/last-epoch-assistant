/**
 * LE Tools compact string ids (docs/data-sources/ids.md section 2).
 *
 * A compact id is a kind letter followed by lz-string `compressToEncodedURIComponent` of a
 * decimal string:
 *   'MIzDMQ'       -> { kind: 'M', value: '113' }            monster mod 113
 *   'AKwDgnEA'     -> { kind: 'A', value: '589' }            affix 589
 *   'UAzCMwZgJiA'  -> { kind: 'U', value: '001032' }         unique 32 on sub type 1
 *   'SAzDMQ'       -> { kind: 'S', value: '003' }            set 3
 *   'IIwBjIVnEg'   -> { kind: 'I', value: '1000050000' }     base 0, sub 50 (Falconry Helm), implicit 0
 * Encoding is deterministic, so encode(decode(id)) == id for every id in the data.
 */
import { createRequire } from "node:module";

type LZ = typeof import("lz-string");
const LZString = createRequire(import.meta.url)("lz-string") as LZ;

export type CompactKind = "A" | "U" | "S" | "I" | "M";
export const COMPACT_KINDS: readonly CompactKind[] = ["A", "U", "S", "I", "M"];

export interface DecodedCompactId {
  /** The compact id itself. */
  id: string;
  kind: CompactKind;
  /** Decompressed decimal string. */
  value: string;
  /** Table the id points at. */
  targetTable: "affixes" | "uniques" | "sets" | "item_subtypes" | "monster_mods";
  /** Key in targetTable: affix_id / unique_id / set_id / '<base>:<sub>' / mod_id (as text). */
  targetKey: string;
  /** U: leading 3 digits = the unique's base sub type id (uniques.sub_type_id). I: trailing 3 digits (implicit index). */
  subIndex: number | null;
  /** I: base type id. */
  baseTypeId?: number;
  /** I: sub type id. */
  subTypeId?: number;
}

/** Raw decode: kind letter + decompressed value. Throws on an unknown kind or undecodable payload. */
export function decompressCompactId(id: string): { kind: CompactKind; value: string } {
  const kind = id[0] as CompactKind;
  if (!COMPACT_KINDS.includes(kind)) throw new Error(`unknown compact id kind '${id[0]}' in '${id}'`);
  const value = LZString.decompressFromEncodedURIComponent(id.slice(1));
  if (value === null || value === undefined || value === "" || !/^\d+$/.test(value)) {
    throw new Error(`cannot decode compact id '${id}'`);
  }
  return { kind, value };
}

/** Decode a compact id and resolve its layout (see ids.md table "kind / points at / decoded layout"). */
export function decodeCompactId(id: string): DecodedCompactId {
  const { kind, value } = decompressCompactId(id);
  switch (kind) {
    case "A":
      return { id, kind, value, targetTable: "affixes", targetKey: String(Number(value)), subIndex: null };
    case "M":
      return { id, kind, value, targetTable: "monster_mods", targetKey: String(Number(value)), subIndex: null };
    case "S":
      return { id, kind, value, targetTable: "sets", targetKey: String(Number(value)), subIndex: null };
    case "U": {
      // <sss><uuu>: last 3 digits = uniqueId, leading digits = the unique's sub type id (333 of 333 in 1.5.2).
      const uniqueId = Number(value.slice(-3));
      const sub = value.length > 3 ? Number(value.slice(0, -3)) : null;
      return { id, kind, value, targetTable: "uniques", targetKey: String(uniqueId), subIndex: sub };
    }
    case "I": {
      // '1' + bbb + sss + iii
      if (value.length !== 10 || value[0] !== "1") throw new Error(`unexpected implicit id layout '${value}' in '${id}'`);
      const baseTypeId = Number(value.slice(1, 4));
      const subTypeId = Number(value.slice(4, 7));
      const implicit = Number(value.slice(7, 10));
      return {
        id,
        kind,
        value,
        targetTable: "item_subtypes",
        targetKey: `${baseTypeId}:${subTypeId}`,
        subIndex: implicit,
        baseTypeId,
        subTypeId,
      };
    }
  }
}

/** Encode a kind letter + decimal string. */
export function encodeCompactId(kind: CompactKind, value: string): string {
  if (!/^\d+$/.test(value)) throw new Error(`compact id value must be decimal digits, got '${value}'`);
  return kind + LZString.compressToEncodedURIComponent(value);
}

const pad3 = (n: number) => String(n).padStart(3, "0");

/** 'A' id of an affix (e.g. 589 -> 'AKwDgnEA'). */
export const affixCompactId = (affixId: number): string => encodeCompactId("A", String(affixId));
/** 'M' id of a monster mod (e.g. 113 -> 'MIzDMQ'). */
export const monsterModCompactId = (modId: number): string => encodeCompactId("M", String(modId));
/** 'S' id of a set (3-digit, e.g. 3 -> 'SAzDMQ'). */
export const setCompactId = (setId: number): string => encodeCompactId("S", pad3(setId));
/** 'I' id of a sub type implicit (e.g. (0, 50, 0) -> 'IIwBjIVnEg'). */
export const implicitCompactId = (baseTypeId: number, subTypeId: number, implicitIndex = 0): string =>
  encodeCompactId("I", `1${pad3(baseTypeId)}${pad3(subTypeId)}${pad3(implicitIndex)}`);
/** 'U' id of a unique (3-digit sub type id + 3-digit unique id, e.g. (1, 32) -> 'UAzCMwZgJiA'). */
export const uniqueLineCompactId = (subTypeId: number, uniqueId: number): string =>
  encodeCompactId("U", `${pad3(subTypeId)}${pad3(uniqueId)}`);
