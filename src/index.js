import component from "./DataTable.vue";

// export default {
//  install(Vue, options) {
//   // Let's register our component globally
//   // https://vuejs.org/v2/guide/components-registration.html
//   Vue.component("data-table", DataTable);
//  }
// };
function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('data-table', component);
}

// Create module definition for Vue.use()
const plugin = {
  install,
};

// To auto-install when vue is found
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
component.install = install;

// Export component by default
export default component;