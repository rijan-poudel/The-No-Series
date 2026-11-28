import assert from "node:assert/strict";
import { test } from "node:test";
import {
  extractEverestGeneralSavingsMinimum,
  extractLaxmiSunriseSavingsMinimum,
  extractNmbGoGreenMinimum,
} from "../src/editorial/savings-extraction.ts";

test("savings minimum extractors require each bank's exact published wording", () => {
  assert.deepEqual(
    extractEverestGeneralSavingsMinimum(
      "<h2>Minimum balance:</h2><p>Rs. 500</p>",
    ),
    { minimumNpr: "500" },
  );
  assert.deepEqual(
    extractNmbGoGreenMinimum(
      '<div aria-label="Rendered block content">Minimum Balance: Rs. 1,000</div>',
    ),
    { minimumNpr: "1000" },
  );
  assert.deepEqual(
    extractLaxmiSunriseSavingsMinimum(
      "<small>No minimum balance is required to open the account.</small>",
    ),
    { minimumNpr: "0" },
  );
  assert.equal(
    extractEverestGeneralSavingsMinimum("Minimum amount: Rs. 500"),
    null,
  );
  assert.equal(extractNmbGoGreenMinimum("Minimum Balance: NPR 1,000"), null);
  assert.equal(extractLaxmiSunriseSavingsMinimum("No minimum balance."), null);
});
