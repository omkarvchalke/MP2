import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPokemon, imageFor, loadNavList } from "../api/pokeapi";
import type { PokemonBasic } from "../types";
import s from "../styles/detail.module.css";

const Detail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PokemonBasic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!name) return;
      try {
        setError(null);
        const d = await getPokemon(name);
        setData(d);
      } catch {
        setError("Failed to fetch Pokémon details. Try again.");
      }
    })();
  }, [name]);

  const navList = useMemo(() => loadNavList() || [], []);
  const index = useMemo(
    () => (name ? navList.findIndex((n) => n === name) : -1),
    [navList, name]
  );
  const prev = index > 0 ? navList[index - 1] : null;
  const next = index >= 0 && index < navList.length - 1 ? navList[index + 1] : null;

  if (!name) return <div className="container">Invalid route.</div>;

  return (
    <div className="container">
      <Link to="/" className="muted">← Back</Link>

      <div className={`card ${s.mt12}`}>
        {!data && !error && <div>Loading…</div>}
        {error && <div className="muted">{error}</div>}

        {data && (
          <div className={s.wrap}>
            <div>
              <div className={s.media}>
                <img src={imageFor(data)} alt={data.name} width={384} height={384} />
              </div>

              <div className={s.navBtns}>
                <button
                  className="button"
                  disabled={!prev}
                  onClick={() => prev && navigate(`/detail/${prev}`)}
                >
                  Prev
                </button>
                <button
                  className="button"
                  disabled={!next}
                  onClick={() => next && navigate(`/detail/${next}`)}
                >
                  Next
                </button>
              </div>
            </div>

            <div className={s.meta}>
              <h2 className={s.heading}>#{data.id} {data.name}</h2>

              <div className={s.kv}>
                <div>Types</div>
                <div>
                  {data.types.map((t) => (
                    <span key={t.type.name} className={`badge ${s.mr6}`}>
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className={s.kv}>
                <div>Height</div>
                <div>{(data.height / 10).toFixed(1)} m</div>
              </div>

              <div className={s.kv}>
                <div>Weight</div>
                <div>{(data.weight / 10).toFixed(1)} kg</div>
              </div>

              <div className={s.kv}>
                <div>Stats</div>
                <div className={s.statGrid}>
                  {data.stats.map((stat) => (
                    <div key={stat.stat.name} className="badge">
                      <span className={s.capitalize}>{stat.stat.name}</span>
                      <strong>{stat.base_stat}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Detail;