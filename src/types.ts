//ts 
export type PokemonListItem = { name: string; url: string; id: number };
export type PokemonBasic = {
id: number;
name: string;
sprites: { other?: { [k: string]: { front_default?: string } }; front_default?: string };
types: { slot: number; type: { name: string; url: string } }[];
height: number; // decimeters
weight: number; // hectograms
stats: { base_stat: number; stat: { name: string } }[];
};
export type PokeType = { name: string; url: string };