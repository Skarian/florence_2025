const baseCircle = (fill: string, stroke: string, r = 9) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='${r}' fill='${fill}' stroke='${stroke}' stroke-width='2'/></svg>`;

export const ICONS = {
  place: baseCircle("%235aa9ff", "%230b0b10", 7),
  active: baseCircle("%23ff6b35", "%230b0b10", 8),
  primary: baseCircle("%238a9a5b", "%230b0b10", 9),
  user: baseCircle("%2334d399", "%230b0b10", 8),
  routePointFrom: baseCircle("%233bd184", "%230b0b10", 7),
  routePointTo: baseCircle("%235aa9ff", "%230b0b10", 7),
};
