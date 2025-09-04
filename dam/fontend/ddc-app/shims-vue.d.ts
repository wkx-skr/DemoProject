import Vue from 'vue';
import { Message } from 'element-ui';
import VueRouter from 'vue-router';
import { Route } from 'vue-router';
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
// 扩充
declare module 'vue/types/vue' {
    interface Vue {
        $router: VueRouter;
        $route: Route;
    }
    interface VueConstructor {
    	entryName: string;
  	}
}
