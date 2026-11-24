import { reviewDemo } from "../src/editorial/demo.ts";

const { candidate, before, after: published } = reviewDemo(3);
const { after: conflict } = reviewDemo(4);
function summarize(result: typeof before) {
  return {
    release: result.release,
    groups: result.groups.map(({ key, rows }) => [
      key,
      rows.map(({ offer }) => offer.id),
    ]),
    exclusions: result.exclusions,
  };
}
console.log(
  JSON.stringify(
    {
      fictional: true,
      candidate,
      before: summarize(before),
      after: summarize(published),
      conflict: summarize(conflict),
    },
    null,
    2,
  ),
);
