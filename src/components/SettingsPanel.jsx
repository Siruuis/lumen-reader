import { useSettings } from '../store/useSettings'
import { THEMES, FONTS } from '../lib/themes'
import { useT } from '../lib/i18n'
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

const LANGS = ['auto', 'fr', 'en']

export default function SettingsPanel({ onClose }) {
  const s = useSettings()
  const t = useT()

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel panel-right fade-in">
        <div className="panel-head">
          <h3>{t('settings.title')}</h3>
          <button className="icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="panel-body">
          <div className="group">
            <label className="group-label">{t('set.language')}</label>
            <div className="seg">
              {LANGS.map((id) => (
                <button
                  key={id}
                  className={s.lang === id ? 'active' : ''}
                  onClick={() => s.set({ lang: id })}
                >
                  {t(`set.lang.${id}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label className="group-label">{t('set.ambiance')}</label>
            <div className="theme-grid">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  className={`theme-chip ${s.theme === th.id ? 'active' : ''}`}
                  onClick={() => s.setTheme(th.id)}
                  title={t(`theme.${th.id}.hint`)}
                >
                  <span className="theme-swatch">
                    {th.swatch.map((c, i) => (
                      <i key={i} style={{ background: c }} />
                    ))}
                  </span>
                  <span className="theme-name">{t(`theme.${th.id}.name`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label className="group-label">{t('set.font')}</label>
            <div className="seg">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  className={s.font === f.id ? 'active' : ''}
                  onClick={() => s.setFont(f.id)}
                  style={{ fontFamily: f.css }}
                >
                  {t(`font.${f.id}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="group">
            <label className="group-label">{t('set.reading')}</label>
            <Slider
              label={t('set.fontSize')}
              value={s.fontSize}
              min={14}
              max={30}
              onChange={(v) => s.set({ fontSize: v })}
              suffix="px"
            />
            <Slider
              label={t('set.lineHeight')}
              value={s.lineHeight}
              min={1.3}
              max={2.4}
              step={0.05}
              onChange={(v) => s.set({ lineHeight: v })}
            />
            <Slider
              label={t('set.width')}
              value={s.contentWidth}
              min={520}
              max={1000}
              step={20}
              onChange={(v) => s.set({ contentWidth: v })}
              suffix="px"
            />
            <Slider
              label={t('set.letter')}
              value={s.letterSpacing}
              min={0}
              max={2}
              step={0.1}
              onChange={(v) => s.set({ letterSpacing: v })}
              suffix="px"
            />
          </div>

          <div className="group">
            <label className="group-label">{t('set.comfort')}</label>
            <Slider
              label={t('set.warmth')}
              value={s.warmth}
              min={0}
              max={100}
              onChange={(v) => s.set({ warmth: v })}
              suffix="%"
            />
            <Slider
              label={t('set.brightness')}
              value={s.brightness}
              min={50}
              max={100}
              onChange={(v) => s.set({ brightness: v })}
              suffix="%"
            />
            <p className="hint">{t('set.hint')}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
