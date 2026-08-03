import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { buildChartData } from "../../utils/emotions";

/* ----------------------------------------------------------------
   EmotionPieChart
   Animated, responsive pie chart of a user's emotion distribution.
   - Rounded slices (cornerRadius) + small gap (paddingAngle)
   - Smooth load animation (easeOut)
   - Hover enlarges the active slice outward
   - Custom tooltip:  emoji + Name / Percentage% / N Entries
   - Custom legend:   emoji dot + label + count (always visible)
   Pure component — driven entirely by the `data` prop.
---------------------------------------------------------------- */

// ---- Custom hover tooltip ----
function EmotionTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="emotion-tooltip">
      <div className="emotion-tooltip-head">
        <span className="emotion-tooltip-emoji">{d.emoji}</span>
        <span className="emotion-tooltip-name">{d.emotion}</span>
      </div>
      <div className="emotion-tooltip-row">
        <strong>{d.percent}%</strong>
      </div>
      <div className="emotion-tooltip-row muted">
        {d.count} {d.count === 1 ? "Entry" : "Entries"}
      </div>
    </div>
  );
}

// ---- Active (hovered) slice: same shape, slightly larger radius ----
function renderActiveSlice(props) {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    cornerRadius,
  } = props;
  // Lift the slice outward along its mid-angle on hover.
  const midAngle = (startAngle + endAngle) / 2;
  const offset = 8;
  const dx = Math.cos(-midAngle * RADIAN) * offset;
  const dy = Math.sin(-midAngle * RADIAN) * offset;

  return (
    <g>
      <path
        d={`M ${cx + dx + (innerRadius + 6) * Math.cos(-startAngle * RADIAN)} ${
          cy + dy + (innerRadius + 6) * Math.sin(-startAngle * RADIAN)
        }
        L ${cx + dx + (outerRadius + 6) * Math.cos(-startAngle * RADIAN)} ${
          cy + dy + (outerRadius + 6) * Math.sin(-startAngle * RADIAN)
        }
        A ${(outerRadius + 6)} ${(outerRadius + 6)} 0 ${
          endAngle - startAngle <= 180 ? 0 : 1
        } 0 ${cx + dx + (outerRadius + 6) * Math.cos(-endAngle * RADIAN)} ${
          cy + dy + (outerRadius + 6) * Math.sin(-endAngle * RADIAN)
        }
        L ${cx + dx + (innerRadius + 6) * Math.cos(-endAngle * RADIAN)} ${
          cy + dy + (innerRadius + 6) * Math.sin(-endAngle * RADIAN)
        }
        A ${(innerRadius + 6)} ${(innerRadius + 6)} 0 ${
          endAngle - startAngle <= 180 ? 0 : 1
        } 1 ${cx + dx + (innerRadius + 6) * Math.cos(-startAngle * RADIAN)} ${
          cy + dy + (innerRadius + 6) * Math.sin(-startAngle * RADIAN)
        }
        Z`}
        fill={fill}
        cornerRadius={cornerRadius}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
}

export default function EmotionPieChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const { rows } = buildChartData(data);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="emotion-pie-wrap">
      <div className="emotion-pie">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="count"
              nameKey="emotion"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              paddingAngle={2}
              cornerRadius={6}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              activeIndex={activeIndex}
              activeShape={renderActiveSlice}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {rows.map((row) => (
                <Cell
                  key={row.emotion}
                  fill={row.color}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={<EmotionTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label: total count */}
        <div className="emotion-pie-center" aria-hidden="true">
          <span className="emotion-pie-center-num">
            {rows.reduce((s, r) => s + r.count, 0)}
          </span>
          <span className="emotion-pie-center-label">Journals</span>
        </div>
      </div>

      {/* Custom legend — always visible, not just on hover */}
      <ul className="emotion-legend">
        {rows.map((row) => (
          <li
            key={row.emotion}
            className={`emotion-legend-item${
              activeIndex !== null && activeIndex === rows.indexOf(row)
                ? " is-active"
                : ""
            }`}
            onMouseEnter={() => setActiveIndex(rows.indexOf(row))}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              className="emotion-legend-dot"
              style={{ backgroundColor: row.color }}
            />
            <span className="emotion-legend-emoji">{row.emoji}</span>
            <span className="emotion-legend-name">{row.emotion}</span>
            <span className="emotion-legend-count">
              {row.percent}% · {row.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
