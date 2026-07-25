import { fetchOllamaCatalogue } from "../utils/ollamaCatalogue";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const refresh = query.refresh === "1" || query.refresh === "true";

  return fetchOllamaCatalogue({ refresh });
});
