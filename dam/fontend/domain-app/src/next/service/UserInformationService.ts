// @ts-ignore
import _ from 'lodash'
// @ts-ignore
const vThis = window.vueThis
interface UserInfo {
  firstName ?: string;
  id: number;
  username: string;
}
interface UserInfoMap {
  username: string;
  userInfo: UserInfo;
}
class UserInformationService {
  private static UsernameToInformationMap: Map<string, string> = new Map()
  public static getUsernames(usernames: Array<string>): Promise<Map<string, string>> {
    return new Promise(resolve => {
      const usersNeedRequest = usernames.filter(username => {
        return !UserInformationService.UsernameToInformationMap.has(username)
      })
      if (usersNeedRequest.length > 0) {
        UserInformationService.getInfoByUsername(usersNeedRequest).then((users: Array<UserInfo>) => {
          users.forEach(user => {
            UserInformationService.UsernameToInformationMap.set(user.username, user.firstName? user.firstName : user.username)
          })
          resolve(UserInformationService.UsernameToInformationMap)
        })
      } else {
        resolve(UserInformationService.UsernameToInformationMap)
      }
    })
  }

  // 没有应用价值，仅为自测使用
  private static removeUsername(usernames: Array<string>): void {
    usernames.forEach(username => {
      UserInformationService.UsernameToInformationMap.delete(username)
    })
  }

  public static clearUsername(): void {
    UserInformationService.UsernameToInformationMap.clear()
  }

  private static getInfoByUsername(usernames: Array<string>): Promise<Array<UserInfo>> {
    return new Promise((resolve) => {
      // @ts-ignore
      const vThis = window.vueThis
      vThis.$http.post(`/user/usermanagement/user/getUsersByUsernames`, _.uniq(usernames)).then((res: { data: UserInfo[] | PromiseLike<UserInfo[]> }) => {
        resolve(res.data)
      })
    })
  }
}
export default UserInformationService
