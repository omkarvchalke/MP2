import axios from "axios";
import type { PokemonBasic, PokemonListItem, PokeType } from "../types";

const api = axios.create({ baseURL: "https://pokeapi.co/api/v2" });

const mem = new Map<string, any>();
let lsWritable = true;

function getCache<T>(key: string): T | null {
  if (mem.has(key)) return mem.get(key);
  if (!lsWritable) return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    mem.set(key, parsed);
    return parsed as T;
  } catch {
    lsWritable = false;
    return null;
  }
}

function setCache(key: string, val: any) {
  mem.set(key, val); // always keep session copy
  if (!lsWritable) return;

  try {
    const json = JSON.stringify(val);
    if (json.length > 100_000) return;
    localStorage.setItem(key, json);
  } catch {
    lsWritable = false;
  }
}

/* List first N Pokémon */
export async function listPokemon(limit = 151, offset = 0): Promise<PokemonListItem[]> {
  const key = `list:${limit}:${offset}`;
  const cached = getCache<PokemonListItem[]>(key);
  if (cached) return cached;

  const { data } = await api.get(`/pokemon?limit=${limit}&offset=${offset}`);
  const items: PokemonListItem[] = data.results.map((r: any) => {
    const id = Number(r.url.split("/").filter(Boolean).pop());
    return { name: r.name, url: r.url, id } as PokemonListItem;
  });
  setCache(key, items);
  return items;
}

/* Get full details for a Pokémon */
export async function getPokemon(nameOrId: string | number): Promise<PokemonBasic> {
  const key = `pk:${nameOrId}`;
  const cached = getCache<PokemonBasic>(key);
  if (cached) return cached;

  const { data } = await api.get(`/pokemon/${nameOrId}`);
  setCache(key, data);
  return data;
}

/** List all types (minus 'unknown' and 'shadow') */
export async function listTypes(): Promise<PokeType[]> {
  const key = `types`;
  const cached = getCache<PokeType[]>(key);
  if (cached) return cached;

  const { data } = await api.get(`/type`);
  const types = data.results.filter((t: PokeType) => !["unknown", "shadow"].includes(t.name));
  setCache(key, types);
  return types;
}

export async function listByType(typeName: string): Promise<string[]> {
  const key = `type:${typeName}`;
  const cached = getCache<string[]>(key);
  if (cached) return cached;

  const { data } = await api.get(`/type/${typeName}`);
  const names: string[] = (data.pokemon || []).map((p: any) => p.pokemon.name);
  setCache(key, names);
  return names;
}

/* Helper for official artwork URL */
export function imageFor(p: PokemonBasic | PokemonListItem): string {
  const id =
    (p as any).id ?? Number((p as PokemonListItem).url.split("/").filter(Boolean).pop());
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/* Track the last navigation list for Detail */
export function saveNavList(order: string[]) {
  try {
    sessionStorage.setItem("navList", JSON.stringify(order));
  } catch {
  }
}
export function loadNavList(): string[] | null {
  try {
    return JSON.parse(sessionStorage.getItem("navList") || "null");
  } catch {
    return null;
  }
}
