import GraphType from "../types/GraphType";
import _ from 'lodash';
import moment from "moment";
import {VersionContent, VersionMessage} from "../types/Version";

// @ts-ignore
const vThis = window.vueThis

class Version {
  public static lineageId: number | string;

  private static versionList = new Array<VersionMessage>();

  public static currentVersion: number = 0;

  public static async getVersionList(): Promise<Array<VersionMessage>> {
    return new Promise(resolve => {
      this.getFromDatabase(`Lineage-Version-${this.lineageId}`).then(list => {
        // @ts-ignore 信任从数据库取出的信息
        this.versionList = list
        resolve(this.versionList)
      })
    })
  }

  public static async getVersion(versionId?: number): Promise<VersionContent> {
    return new Promise(resolve => {
      this.getFromDatabase(`Lineage-Version-${this.lineageId}-${versionId ? versionId : this.currentVersion}`).then(data => {
        // @ts-ignore 信任从数据库取出的信息
        resolve(data)
      })
    })
  }

  public static async createVersion(versionContent: VersionContent): Promise<void> {
    let nextVersionId = this.versionList.length + 1
    return new Promise(resolve => {
      console.log('save -------------------------------')
      console.log(versionContent)
      this.saveToDatabase(`Lineage-Version-${this.lineageId}-${nextVersionId}`, versionContent, () => {
        let versionList = _.clone(this.versionList);
        versionList.push({
          id: nextVersionId,
          title: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          time: new Date().getTime(),
        })
        this.saveToDatabase(`Lineage-Version-${this.lineageId}`, versionList, resolve);
      });
    })
  }

  public static async clearVersions(): Promise<void> {
    return new Promise(resolve => {
      this.versionList.forEach(version => {
        this.saveToDatabase(`Lineage-Version-${this.lineageId}-${version.id}`, null, () => {})
      })
      this.saveToDatabase(`Lineage-Version-${this.lineageId}`, [], () => {
        resolve()
      })
    })

  }
  public static async deleteVersion(): Promise<void> {
    return new Promise(resolve => {
      if (this.versionList && Array.isArray(this.versionList)) {
        const lastVersion = this.versionList.pop()
        if (lastVersion) {
          this.saveToDatabase(`Lineage-Version-${this.lineageId}-${lastVersion.id}`, null, () => {})
          this.saveToDatabase(`Lineage-Version-${this.lineageId}`, this.versionList, () => {
            resolve()
          })
        }
      }
    })
  }

  private static saveToDatabase(widgetId, json, resolve) {
    vThis.$http
      .post(vThis.$url + '/service/dashboard/widgets', {
        widgetId: widgetId,
        content: JSON.stringify(json),
      })
      .then(() => {
        resolve()
      })
      .catch(e => {
        vThis.showFailure(e)
      })
  }
  private static getFromDatabase(widgetId) {
    console.log('vThis', vThis)
    return new Promise(resolve => {
      vThis.$http
        .post(vThis.$url + `/widget/getWidgetConfig?id=${widgetId}`)
        .then(res => {
          if (res.data.content) {
            resolve(JSON.parse(res.data.content))
          } else {
            resolve([])
          }
        })
        .catch(e => {
          resolve([])
        })
    })
  }
}
export default Version;
