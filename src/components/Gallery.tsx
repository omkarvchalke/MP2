import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  imageFor,
  listPokemon,
  listTypes,
  listByType,
  saveNavList,
} from "../api/pokeapi";
import type { PokemonListItem, PokeType } from "../types";
import styles from "../styles/gallery.module.css";

export default function Gallery() {
  const [items, setItems] = useState<PokemonListItem[]>([]);
  const [types, setTypes] = useState<PokeType[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<PokemonListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load base list and type metadata
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [l, t] = await Promise.all([listPokemon(151), listTypes()]);
        setItems(l);
        setTypes(t);
        setFiltered(l); // default (no filters)
        saveNavList(l.map((i) => i.name));
      } catch {
        setError("Some data failed to load. Try again or continue with cached content.");
      }
    })();
  }, []);

  const typeNames = useMemo(() => types.map((t) => t.name), [types]);

  // Filter using type
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (picked.length === 0 || items.length === 0) {
        setFiltered(items);
        saveNavList(items.map((i) => i.name));
        return;
      }

      setLoading(true);
      try {
        // Get the set of names for each picked type, then intersect.
        const allTypeLists = await Promise.all(picked.map((t) => listByType(t)));
        const intersection = allTypeLists.reduce<Set<string>>((acc, list, idx) => {
          const s = new Set(list);
          if (idx === 0) return s;
          return new Set([...acc].filter((n) => s.has(n)));
        }, new Set<string>());

        // Filter our first-151 list to those names
        const allowed = new Set(intersection);
        const result = items.filter((p) => allowed.has(p.name));

        if (!cancelled) {
          setFiltered(result);
          saveNavList(result.map((i) => i.name));
        }
      } catch {
        if (!cancelled) setError("Filtering failed. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
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
          <div className={styles.status}>Fetching matches…</div>
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
