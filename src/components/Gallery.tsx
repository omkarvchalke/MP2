import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPokemon, imageFor, listPokemon, listTypes, saveNavList } from "../api/pokeapi";
import type { PokemonBasic, PokemonListItem, PokeType } from "../types";
import styles from "../styles/gallery.module.css";

export default function Gallery() {
  const [items, setItems] = useState<PokemonListItem[]>([]);
  const [types, setTypes] = useState<PokeType[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load base lists
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [l, t] = await Promise.all([listPokemon(151), listTypes()]);
        setItems(l);
        setTypes(t);
      } catch {
        setError("Some data failed to load. Try again or continue with cached content.");
      }
    })();
  }, []);

  // When filters are selected, fetch missing details in small chunks.
  useEffect(() => {
    if (picked.length === 0 || items.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        // Only fetch details for items we need and don't already have cached
        const toFetch = items.filter((p) => !localStorage.getItem(`pk:${p.name}`));

        const chunkSize = 25;
        for (let i = 0; i < toFetch.length && !cancelled; i += chunkSize) {
          const chunk = toFetch.slice(i, i + chunkSize);
          await Promise.all(chunk.map((p) => getPokemon(p.name)));
        }
      } catch {
        // Ignore individual fetch failures; UI will still filter what’s available
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [picked, items]);

  const typeNames = useMemo(() => types.map((t) => t.name), [types]);

  // Filtering logic based on cached details
  const filtered = useMemo(() => {
    if (picked.length === 0) return items;

    return items.filter((p) => {
      try {
        const raw = localStorage.getItem(`pk:${p.name}`);
        if (!raw) return false;
        const data: PokemonBasic = JSON.parse(raw);
        const names = data.types.map((t) => t.type.name);
        return picked.every((t) => names.includes(t));
      } catch {
        return false;
      }
    });
  }, [items, picked]);

  useEffect(() => {
    saveNavList(filtered.map((i) => i.name));
  }, [filtered]);

  function toggleType(t: string) {
    setPicked((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  return (
    <div className="container">
      <div className="card">
        <div className={styles.toolbar}>
          <div className={styles.chips}>
            {typeNames.map((t) => (
              <button
                key={t}
                className={styles.chipBtn}
                onClick={() => toggleType(t)}
                aria-pressed={picked.includes(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && <div className={styles.status}>{error}</div>}
        {loading && picked.length > 0 && (
          <div className={styles.status}>Fetching details for selected filters…</div>
        )}
    

        <div className={styles.grid}>
          {(picked.length ? filtered : items).map((p) => (
            <div key={p.name} className={styles.card}>
              <div className={styles.imgWrap}>
                <img src={imageFor(p)} alt={p.name} loading="lazy" width={256} height={256} />
              </div>
              <div className={styles.title}>
                #{p.id} {p.name}
              </div>
              <Link className="button" to={`/detail/${p.name}`}>
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}