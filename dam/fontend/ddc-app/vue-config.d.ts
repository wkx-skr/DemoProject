import Vue from 'vue';
declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}
declare module "vue/types/vue" {
	interface VueConstructor {
    	entryName: string;
  	}
}
