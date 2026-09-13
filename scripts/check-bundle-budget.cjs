const fs = require("node:fs");
const path = require("node:path");

const ASSET_DIRECTORY = path.join(__dirname, "..", "dist", "assets");
const BUDGETS = {
  largestJavaScriptBytes: 500 * 1024,
  totalCssBytes: 100 * 1024
};

function formatKilobytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function fail(message) {
  console.error(`Bundle budget failed: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(ASSET_DIRECTORY)) {
  fail("dist/assets does not exist. Run npm run build first.");
} else {
  const assets = fs.readdirSync(ASSET_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      name: entry.name,
      bytes: fs.statSync(path.join(ASSET_DIRECTORY, entry.name)).size
    }));
  const javascript = assets.filter((asset) => asset.name.endsWith(".js"));
  const css = assets.filter((asset) => asset.name.endsWith(".css"));
  const largestJavaScript = javascript.reduce((largest, asset) => (
    !largest || asset.bytes > largest.bytes ? asset : largest
  ), null);
  const totalCssBytes = css.reduce((total, asset) => total + asset.bytes, 0);

  if (!largestJavaScript) fail("no JavaScript bundle was found.");
  if (css.length === 0) fail("no CSS bundle was found.");
  if (largestJavaScript?.bytes > BUDGETS.largestJavaScriptBytes) {
    fail(`${largestJavaScript.name} is ${formatKilobytes(largestJavaScript.bytes)}; limit is ${formatKilobytes(BUDGETS.largestJavaScriptBytes)}.`);
  }
  if (totalCssBytes > BUDGETS.totalCssBytes) {
    fail(`combined CSS is ${formatKilobytes(totalCssBytes)}; limit is ${formatKilobytes(BUDGETS.totalCssBytes)}.`);
  }

  if (!process.exitCode) {
    console.log(JSON.stringify({
      status: "PASS",
      largestJavaScript: {
        file: largestJavaScript.name,
        size: formatKilobytes(largestJavaScript.bytes),
        budget: formatKilobytes(BUDGETS.largestJavaScriptBytes)
      },
      totalCss: {
        files: css.length,
        size: formatKilobytes(totalCssBytes),
        budget: formatKilobytes(BUDGETS.totalCssBytes)
      }
    }, null, 2));
  }
}
