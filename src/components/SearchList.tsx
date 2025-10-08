import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listPokemon, saveNavList } from "../api/pokeapi";
import type { PokemonListItem } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import SortControl, { SortDir, SortKey } from "./SortControl";
import s from "../styles/list.module.css";


export default function SearchList(){
const [raw, setRaw] = useState<PokemonListItem[]>([]);
const [query, setQuery] = useState("");
const [sortKey, setSortKey] = useState<SortKey>("name");
const [sortDir, setSortDir] = useState<SortDir>("asc");
const [error, setError] = useState<string| null>(null);
const debounced = useDebounce(query, 200);


useEffect(()=>{ (async()=>{
try{ setError(null); const data = await listPokemon(151); setRaw(data);}catch(e){ setError("Unable to load Pokémon. Using cached if available."); }
})(); },[]);


const filtered = useMemo(()=>{
const q = debounced.trim().toLowerCase();
const f = q? raw.filter(p=> p.name.includes(q) || String(p.id).includes(q)) : raw.slice();
const sorted = f.sort((a,b)=>{
const vA = sortKey === "name"? a.name : a.id;
const vB = sortKey === "name"? b.name : b.id;
const cmp = vA < vB ? -1 : vA > vB ? 1 : 0;
return sortDir === "asc"? cmp : -cmp;
});
return sorted;
}, [raw, debounced, sortKey, sortDir]);


useEffect(()=>{ saveNavList(filtered.map(p=> p.name)); },[filtered]);


return (
<div className="container">
<div className="card">
<div className={s.controls}>
<div className={s.search}>
<input placeholder="Search by name or ID…" value={query} onChange={e=> setQuery(e.target.value)} />
</div>
<SortControl sortKey={sortKey} sortDir={sortDir} onChange={(k,d)=>{ setSortKey(k); setSortDir(d); }} />
</div>
{error && <div className={s.empty}>{error}</div>}
<table className={s.table}>
<tbody>
{filtered.map(p=> (
<tr key={p.name} className={s.row}>
<td className={s.cell}><span className={s.name}>{p.name}</span></td>
<td className={s.cell}>#{p.id}</td>
<td className={s.cell}><Link className="button" to={`/detail/${p.name}`}>Details</Link></td>
</tr>
))}
{filtered.length===0 && <tr><td className={s.empty}>No results. Try a different query.</td></tr>}
</tbody>
</table>
</div>
</div>
);
}