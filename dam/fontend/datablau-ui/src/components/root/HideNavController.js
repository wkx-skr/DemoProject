import $directory from "../../../public/conf/directory";

export default {
    data() {
        return {
            hideLeft: false,
            hideTop: false,
            isNavExtension: sessionStorage.getItem('isNavNotExtension') !== 'true',
        }
    },
    beforeMount() {

    },
    methods: {
        updateNavExtension(isNavExtension) {
            this.isNavExtension = isNavExtension
        },
        triggerHideNavController(routeName) {
            console.debug('===================')
            console.debug(routeName)
            if (routeName === true) {
                console.debug('blank===true')
                this.hideLeft = true
                this.hideTop = true
            } else if (routeName) {
                const Page = $directory.pagesMap[routeName]
                if (Page && Page.hideLeftNav && !Page.hidePageHeading) {
                    this.hideLeft = true
                    this.hideTop = false
                } else if (Page && Page.hidePageHeading) {
                    this.hideLeft = true
                    this.hideTop = true
                } else {
                    this.hideLeft = false
                    this.hideTop = false
                }
            } else {
                this.hideLeft = true
                this.hideTop = true
            }
        }
    },
}