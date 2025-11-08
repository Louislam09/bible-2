/**
 * ESBuild configuration for bundling Lexical into a single JS file
 * This creates a standalone bundle that can be used in WebViews without requiring
 * a build process or module system.
 */

const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

// Ensure assets directory exists
const assetsDir = path.join(__dirname, "assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const buildOptions = {
  entryPoints: ["lexical-bundle.js"],
  bundle: true,
  outfile: "assets/lexical-bundle.min.js",
  format: "iife", // Immediately Invoked Function Expression for browser
  globalName: "LexicalBundle",
  minify: true,
  sourcemap: true,
  target: ["es2015"], // Support older browsers
  platform: "browser",
  treeShaking: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  banner: {
    js: "/* Lexical Editor Bundle - All Lexical packages in one file */",
  },
  logLevel: "info",
};

// Build function
async function build() {
  try {
    console.log("🚀 Building Lexical bundle...");

    const result = await esbuild.build(buildOptions);

    // Get file size
    const stats = fs.statSync(buildOptions.outfile);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);

    console.log("✅ Build completed successfully!");
    console.log(`📦 Output: ${buildOptions.outfile}`);
    console.log(`📊 Size: ${fileSizeInKB} KB`);

    // Also create an unminified version for debugging
    await esbuild.build({
      ...buildOptions,
      outfile: "assets/lexical-bundle.js",
      minify: false,
      sourcemap: false,
    });

    console.log("✅ Debug version created: assets/lexical-bundle.js");

    // Create .txt version for easier React Native asset loading (like tailwind.txt)
    fs.copyFileSync(
      "assets/lexical-bundle.min.js",
      "assets/lexical-bundle.txt"
    );

    console.log("✅ Text version created: assets/lexical-bundle.txt");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Watch mode for development
async function watch() {
  console.log("👀 Watching for changes...");

  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();

  console.log("✅ Watch mode enabled. Press Ctrl+C to stop.");
}

// Run build or watch based on command line argument
const args = process.argv.slice(2);
if (args.includes("--watch") || args.includes("-w")) {
  watch();
} else {
  build();
}
