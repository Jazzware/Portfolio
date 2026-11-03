// Genera los PDF del CV (una hoja) desde las versiones de impresión.
// Uso: desde la raíz del repo, `npm run cv`. Los PDF quedan en public/cv/
// y el sitio los sirve en /cv/.
const puppeteer = require("puppeteer");
const path = require("path");

const jobs = [
  ["cv_print_es.html", "../public/cv/CV_SEIII_Ivan_Lopez_Villegas_ES.pdf"],
  ["cv_print_en.html", "../public/cv/CV_SEIII_Ivan_Lopez_Villegas_EN.pdf"],
];

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  for (const [src, out] of jobs) {
    const page = await browser.newPage();
    const file = path.resolve(__dirname, src).replace(/\\/g, "/");
    await page.goto("file:///" + file.replace(/^\//, ""), { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await page.pdf({
      path: path.resolve(__dirname, out),
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log("wrote", out);
    await page.close();
  }
  await browser.close();
})();
