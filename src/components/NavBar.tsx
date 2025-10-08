import { NavLink } from "react-router-dom";
import { SiPokemon } from "react-icons/si";   // Pokéball logo
import s from "../styles/layout.module.css";

export default function NavBar() {
  return (
    <header className={s.navbar}>
      <div className={s.navInner}>
        <div className={s.brand}>
          <SiPokemon className={s.pokeballIcon} />
          PokeDex • <span className={s.brandAccent}>MP2</span>
        </div>

        <nav className={s.tabs}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? `${s.tab} ${s.tabActive}` : s.tab)}
          >
            List
          </NavLink>
          <NavLink
            to="/gallery"
            className={({ isActive }) => (isActive ? `${s.tab} ${s.tabActive}` : s.tab)}
          >
            Gallery
          </NavLink>
        </nav>
      </div>
    </header>
  );
}