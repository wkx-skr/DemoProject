import UserPageType from "@/next/constant/UserPageType";

class UserPage {
  id: number;
  enName: string;
  chName: string;
  menuLevel1: Array<string>;
  pageType: UserPageType;
  iframeSrc: string;

  constructor(enName: string, chName: string, menuLevel1: Array<string>, pageType: UserPageType, iframeSrc: string) {
    this.id = (new Date()).getTime()
    this.enName = enName
    this.chName = chName
    this.menuLevel1 = menuLevel1
    this.pageType = pageType
    this.iframeSrc = iframeSrc
  }
}
export default UserPage
