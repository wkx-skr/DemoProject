import HelloWorld from "@/components/HelloWorld.vue";
import HiThere from "@/components/HiThere.vue"
const components = [
    HelloWorld,
    HiThere
]
const install = function (Vue, opts = {}) {
    components.forEach(component => {
        if (component.entryName) {
            Vue.component(component.entryName, component)
        } else {
            Vue.component(component.name, component)
        }
    })
}
export default {
    install,
}