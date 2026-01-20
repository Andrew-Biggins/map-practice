export const parsePoisQuery = (q) => {
  const lat = Number(q.lat);
  const lng = Number(q.lng);
  const radius = q.radius == null ? 500 : Number(q.radius);

  if (!Number.isFinite(lat)) throw new Error("Invalid lat");
  if (!Number.isFinite(lng)) throw new Error("Invalid lng");
  if (!Number.isFinite(radius) || radius <= 0) throw new Error("Invalid radius");

  const types =
    q.types == null || q.types === ""
      ? []
      : String(q.types)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

  return { lat, lng, radius, types };
};
