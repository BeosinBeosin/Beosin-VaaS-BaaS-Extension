// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import { Container, Aside, Header, Main, Tabs, TabPane, Input, InputNumber, Button, Select, Option, Switch } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import router from './router';
import {vscode, storage} from './utils/vscode.web/web.index';

// vscode
Vue.prototype.vscode = vscode;
Vue.prototype.storage = storage;

Vue.component(Container.name, Container);
Vue.component(Aside.name, Aside);
Vue.component(Header.name, Header);
Vue.component(Main.name, Main);
Vue.component(Tabs.name, Tabs);
Vue.component(TabPane.name, TabPane);
Vue.component(Input.name, Input);
Vue.component(InputNumber.name, InputNumber);
Vue.component(Button.name, Button);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Switch.name, Switch);

/* 或写为
 * Vue.use(Button)
 * Vue.use(Select)
 */

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
