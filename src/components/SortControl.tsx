import styles from "../styles/list.module.css";


export type SortKey = "name" | "id";
export type SortDir = "asc" | "desc";


export default function SortControl({ sortKey, sortDir, onChange }:{
sortKey: SortKey; sortDir: SortDir; onChange: (key: SortKey, dir: SortDir)=>void;
}){
const nextDir = sortDir === "asc"? "desc":"asc";
return (
<div className={styles.sortWrap}>
<label>Sort by</label>
<select value={sortKey} onChange={e=> onChange(e.target.value as SortKey, sortDir)}>
<option value="name">Name</option>
<option value="id">ID</option>
</select>
<button className="button" onClick={()=> onChange(sortKey, nextDir)}>{sortDir.toUpperCase()}</button>
</div>
);
}