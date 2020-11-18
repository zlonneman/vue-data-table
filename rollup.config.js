import vue from 'rollup-plugin-vue';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import minimist from 'minimist';
import pkg from './package.json';

const argv = minimist(process.argv.slice(2));

const baseConfig = {
  input: 'src/index.js', // entry file for our components
  plugins: {
    preVue: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      commonjs(), // add support for CommonJS modules
    ],
    
    vue: {
      css: true, // include CSS in the output
      // css: {
      //   loaderOptions: {
      //     // pass options to sass-loader
      //     // @/ is an alias to src/
      //     // so this assumes you have a file named `src/variables.sass`
      //     // Note: this option is named as "data" in sass-loader v7
          
      //     // by default the `sass` option will apply to both syntaxes
      //     // because `scss` syntax is also processed by sass-loader underlyingly
      //     // but when configuring the `data` option
      //     // `scss` syntax requires an semicolon at the end of a statement, while `sass` syntax requires none
      //     // in that case, we can target the `scss` syntax separately using the `scss` option
      //     scss: {
      //       additionalData: `@import "~@/assets/_variables.scss";`
      //     },
      //   }
      // },
      template: {
        isProduction: true,
      },
    },
    postVue: [
      buble(), // use buble to transpile ES2015
    ],
  },
}
// Customize configs for individual targets
const buildFormats = [];
if (!argv.format || argv.format === 'es') {
  const esConfig = {
    ...baseConfig,
    output: {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [
      ...baseConfig.plugins.preVue,
      css({
        output: pkg.style,
      }),
      vue({
        ...baseConfig.plugins.vue,
        css: true,
      }),
      ...baseConfig.plugins.postVue,
      terser({
        output: {
          ecma: 6,
        },
      }),
      resolve(),
    ],
  };
  buildFormats.push(esConfig);
}

if (!argv.format || argv.format === 'cjs') {
  const umdConfig = {
    ...baseConfig,
    output: {
      compact: true,
      file: pkg.main,
      format: 'cjs',
      name: 'VueDataTable',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [
      ...baseConfig.plugins.preVue,
      css({
        output: pkg.style,
      }),
      vue({
        ...baseConfig.plugins.vue,
        template: {
          ...baseConfig.plugins.vue.template,
          optimizeSSR: true,
        },
        css: true,
      }),
      ...baseConfig.plugins.postVue,
      resolve(),
    ],
  };
  buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === 'iife') {
  const unpkgConfig = {
    ...baseConfig,
    output: {
      compact: true,
      file: pkg.unpkg,
      format: 'iife',
      name: 'VueDataTable',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [
      ...baseConfig.plugins.preVue,
      vue(baseConfig.plugins.vue),
      ...baseConfig.plugins.postVue,
      terser({
        output: {
          ecma: 5,
        },
      }),
      resolve(),
    ],
  };
  buildFormats.push(unpkgConfig);
}

// Export config
export default buildFormats;