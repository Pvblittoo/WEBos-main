// Compila los tests (JSX) a tests-dist/ para que Karma los ejecute en Chrome.
// Los archivos de la lista ARCHIVOS_A_MEDIR se instrumentan con Istanbul
// para obtener el reporte de cobertura (coverage/html).
import * as esbuild from "esbuild";
import { transformAsync } from "@babel/core";
import { readFile, mkdir, readdir, rm } from "node:fs/promises";

// Componentes y páginas que forman parte de la cobertura
const ARCHIVOS_A_MEDIR = [
  "src/components/Navbar.jsx",
  "src/components/MarcaCard.jsx",
  "src/pages/login.jsx",
  "src/pages/catalogo.jsx",
  "src/pages/carrito.jsx",
];

const normalizar = (ruta) => ruta.replace(/\\/g, "/");

const instrumentar = {
  name: "instrumentar-con-istanbul",

  setup(build) {
    build.onLoad({ filter: /\.jsx$/ }, async (args) => {
      const ruta = normalizar(args.path);

      // Solo se instrumentan los archivos a medir (no los tests)
      if (!ARCHIVOS_A_MEDIR.some((a) => ruta.endsWith(a))) {
        return undefined;
      }

      const codigo = await readFile(args.path, "utf8");

      const resultado = await transformAsync(codigo, {
        filename: args.path,
        babelrc: false,
        configFile: false,
        plugins: [
          ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
          ["babel-plugin-istanbul", { exclude: ["**/node_modules/**"] }],
        ],
      });

      if (!resultado?.code) {
        throw new Error(`No se pudo instrumentar ${ruta}`);
      }

      return {
        contents: resultado.code,
        loader: "js",
        resolveDir: args.path.substring(
          0,
          Math.max(args.path.lastIndexOf("/"), args.path.lastIndexOf("\\"))
        ),
      };
    });
  },
};

// Limpia compilaciones anteriores y busca todos los *.spec.jsx / *.spec.js
await rm("tests-dist", { recursive: true, force: true });
await mkdir("tests-dist", { recursive: true });

const specs = (await readdir("tests"))
  .filter((f) => /\.spec\.jsx?$/.test(f))
  .map((f) => `tests/${f}`);

try {
  await esbuild.build({
    entryPoints: specs,
    bundle: true,
    platform: "browser",
    format: "iife",
    outdir: "tests-dist",
    loader: { ".js": "jsx", ".jsx": "jsx", ".css": "empty" },
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"test"' },
    plugins: [instrumentar],
  });

  console.log(`Pruebas compiladas (${specs.length} archivos) con cobertura.`);
} catch (error) {
  console.error("Error al compilar las pruebas:", error);
  process.exitCode = 1;
}
