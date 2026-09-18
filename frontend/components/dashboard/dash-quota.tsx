'use client'

import { ArrowRight, KeyRound, Lock } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { FEATURES, FEATURE_LABEL, TIER_LABEL, QUOTA_RESET_NOTE, type FeatureKey } from '@/lib/tiers'
import {
  GlyphQuota,
  GlyphOrbit,
  GlyphPulseLive,
  GlyphInjector,
  GlyphInfinite,
  GlyphClockRing,
} from '@/components/dashboard/dash-glyphs'
import { GlyphOtcPrism, GlyphRealPulse } from '@/components/analyzer-glyphs'

type Glyph = ({ className }: { className?: string }) => React.ReactElement

const FEATURE_GLYPH: Record<FeatureKey, Glyph> = {
  'otc-chart-analyzer': GlyphOtcPrism,
  'real-chart-analyzer': GlyphRealPulse,
  'future-signals': GlyphOrbit,
  'live-signals': GlyphPulseLive,
  injector: GlyphInjector,
}

const FEATURE_TONE: Record<FeatureKey, { light: string; dark: string }> = {
  'otc-chart-analyzer': { light: '#b48cff', dark: '#6d3bff' },
  'real-chart-analyzer': { light: '#6ddcae', dark: '#189a72' },
  'future-signals': { light: '#f3c775', dark: '#c2820f' },
  'live-signals': { light: '#8fb8ff', dark: '#3b62d8' },
  injector: { light: '#f0a3ff', dark: '#b13fd6' },
}

export function DashQuota() {
  const { loading, tier, hasAccess, isUnlimited, limit, usage } = useAuth()

  return (
    <section className="dsh-quota" data-testid="dashboard-quota">
      <div className="dsh-panel-head">
        <span className="dsh-panel-icon">
          <GlyphQuota className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="coco-sub text-[17px] text-white sm:text-[19px]">Daily quota</h2>
          <p className="mt-0.5 text-[12.5px] text-white/50">
            {hasAccess ? `${TIER_LABEL[tier]} plan · ${isUnlimited ? 'unlimited' : `${limit} per tool`}` : 'Free plan · generation locked'}
          </p>
        </div>
        <span className="dsh-reset-chip" title={QUOTA_RESET_NOTE} data-testid="quota-reset-chip">
          <GlyphClockRing className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Resets</span> 6:00 AM BST
        </span>
      </div>

      {!hasAccess && !loading && (
        <a
          href="https://t.me/Ayan_Dead"
          target="_blank"
          rel="noopener noreferrer"
          className="dsh-unlock"
          data-testid="quota-unlock-link"
        >
          <span className="dsh-unlock-icon">
            <KeyRound className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold text-white">Unlock your licence</span>
            <span className="block text-[12px] text-white/55">Every tool below opens with a daily allowance.</span>
          </span>
          <ArrowRight className="h-4 w-4 flex-none text-[#c4a6ff]" />
        </a>
      )}

      <ul className="dsh-gauge-grid">
        {FEATURES.map((feature) => (
          <GaugeCard
            key={feature}
            feature={feature}
            used={usage[feature] || 0}
            limit={limit}
            unlimited={isUnlimited}
            locked={!hasAccess}
            loading={loading}
          />
        ))}
      </ul>
    </section>
  )
}

const ARC = 'M 20.2 83 A 46 46 0 1 1 99.8 83'

function GaugeCard({
  feature,
  used,
  limit,
  unlimited,
  locked,
  loading,
}: {
  feature: FeatureKey
  used: number
  limit: number | null
  unlimited: boolean
  locked: boolean
  loading: boolean
}) {
  const Glyph = FEATURE_GLYPH[feature]
  const tone = FEATURE_TONE[feature]
  const remaining = unlimited || limit === null ? null : Math.max(0, limit - used)
  const pct = loading || locked ? 0 : unlimited ? 100 : limit ? Math.round(((remaining ?? 0) / limit) * 100) : 0
  const depleted = !locked && remaining !== null && remaining <= 0
  const color = depleted ? '#ff6a7a' : tone.light
  const gid = `g-${feature}`

  return (
    <li
      className="dsh-gauge"
      style={{ '--t-light': tone.light, '--t-dark': tone.dark } as React.CSSProperties}
      data-testid={`quota-gauge-${feature}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="dsh-gauge-icon">
          <Glyph className="h-[16px] w-[16px]" />
        </span>
        <p className="truncate text-[12.5px] font-semibold text-white/85">{FEATURE_LABEL[feature]}</p>
      </div>

      <div className="dsh-gauge-arc">
        <svg viewBox="0 0 120 92" aria-hidden="true">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={depleted ? '#ff8a96' : tone.dark} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <path d={ARC} className="dsh-gauge-track" pathLength={100} />
          <path
            d={ARC}
            className="dsh-gauge-fill"
            pathLength={100}
            stroke={`url(#${gid})`}
            strokeDasharray={`${pct} 100`}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="dsh-gauge-center">
          {locked ? (
            <Lock className="h-6 w-6 text-white/45" />
          ) : unlimited ? (
            <GlyphInfinite className="h-8 w-8" />
          ) : (
            <span className="dsh-gauge-num" data-testid={`quota-remaining-${feature}`}>
              {loading ? '—' : remaining}
            </span>
          )}
          <span className="coco-mono text-[8.5px] uppercase tracking-[0.16em] text-white/40">
            {locked ? 'locked' : unlimited ? 'unlimited' : 'left'}
          </span>
        </div>
      </div>

      <p className="dsh-gauge-foot">
        {locked
          ? 'Upgrade to unlock'
          : unlimited
            ? 'No daily cap'
            : depleted
              ? 'Daily limit reached'
              : `${used} of ${limit} used today`}
      </p>
    </li>
  )
}
