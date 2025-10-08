import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPokemon, imageFor, listPokemon, listTypes, saveNavList } from "../api/pokeapi";
import type { PokemonBasic, PokemonListItem, PokeType } from "../types";
import styles from "../styles/gallery.module.css";

export default function Gallery() {
  const [items, setItems] = useState<PokemonListItem[]>([]);
  const [types, setTypes] = useState<PokeType[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<PokemonListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load base data
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [l, t] = await Promise.all([listPokemon(151), listTypes()]);
        setItems(l);
        setTypes(t);
        setFiltered(l); // default view
      } catch {
        setError("Some data failed to load. Try again or continue with cached content.");
      }
    })();
  }, []);

  const typeNames = useMemo(() => types.map((t) => t.name), [types]);

  // Compute filtered list
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (picked.length === 0) {
        setFiltered(items);
        saveNavList(items.map((i) => i.name));
        return;
      }

      setLoading(true);
      const result: PokemonListItem[] = [];
      const chunkSize = 25;

      // Iterate over the list in small chunks to be nice to the API
      for (let i = 0; i < items.length && !cancelled; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);

        // Get details
        const details: Array<PokemonBasic | null> = await Promise.all(
          chunk.map((p) =>
            getPokemon(p.name).catch(() => null)
          )
        );

        // Keep only Pokémon whose types include *all* picked types
        chunk.forEach((p, idx) => {
          const d = details[idx];
          if (!d) return;
          const names = d.types.map((t) => t.type.name);
          if (picked.every((t) => names.includes(t))) result.push(p);
        });
      }

      if (!cancelled) {
        setFiltered(result);
        saveNavList(result.map((i) => i.name));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [picked, items]);

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
        {!loading && picked.length > 0 && filtered.length === 0 && (
          <div className={styles.status}>No Pokémon match those types.</div>
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
