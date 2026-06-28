import { useSettings } from '../store/useSettings'
import { THEMES, FONTS } from '../lib/themes'
import { IconClose } from './icons.jsx'

function Slider({ label, value, min, max, step = 1, onChange, suffix = '' }) {
  return (
    <div className="ctrl">
      <div className="ctrl-head">
        <span>{label}</span>
        <span className="ctrl-val">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}

export default function SettingsPanel({ onClose }) {
  const s = useSettings()

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel panel-right fade-in">
        <div className="panel-head">
          <h3>Apparence & confort</h3>
          <button className="icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="panel-body">
          <div className="group">
            <label className="group-label">Ambiance</label>
            <div className="theme-grid">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-chip ${s.theme === t.id ? 'active' : ''}`}
                  onClick={() => s.setTheme(t.id)}
                  title={t.hint}
                >
                  <span className="theme-swatch">
                    {t.swatch.map((c, i) => (
                      <i key={i} style={{ background: c }} />
                    ))}
                  </span>
                  <span className="theme-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label className="group-label">Police</label>
            <div className="seg">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  className={s.font === f.id ? 'active' : ''}
                  onClick={() => s.setFont(f.id)}
                  style={{ fontFamily: f.css }}
                >
                  {f.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label className="group-label">Lecture</label>
            <Slider
              label="Taille du texte"
              value={s.fontSize}
              min={14}
              max={30}
              onChange={(v) => s.set({ fontSize: v })}
              suffix="px"
            />
            <Slider
              label="Hauteur de ligne"
              value={s.lineHeight}
              min={1.3}
              max={2.4}
              step={0.05}
              onChange={(v) => s.set({ lineHeight: v })}
            />
            <Slider
              label="Largeur de page"
              value={s.contentWidth}
              min={520}
              max={1000}
              step={20}
              onChange={(v) => s.set({ contentWidth: v })}
              suffix="px"
            />
            <Slider
              label="Espacement des lettres"
              value={s.letterSpacing}
              min={0}
              max={2}
              step={0.1}
              onChange={(v) => s.set({ letterSpacing: v })}
              suffix="px"
            />
          </div>

          <div className="group">
            <label className="group-label">Confort des yeux</label>
            <Slider
              label="Chaleur (anti lumière bleue)"
              value={s.warmth}
              min={0}
              max={100}
              onChange={(v) => s.set({ warmth: v })}
              suffix="%"
            />
            <Slider
              label="Luminosité"
              value={s.brightness}
              min={50}
              max={100}
              onChange={(v) => s.set({ brightness: v })}
              suffix="%"
            />
            <p className="hint">
              Astuce : le soir, monte un peu la chaleur et baisse la luminosité
              pour réduire la fatigue visuelle.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
