// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

interface Api {
  path: string;
  method: "GET" | "POST";
}
interface ApiDist {
  [key: string]: Api;
}
interface RequestParam {
  name: string;
  noloading?: boolean;
  data?: any;
}

@ccclass
export default class NetworkClass extends cc.Component {
  //   @property(cc.Label)
  //   label: cc.Label = null;

  //   @property
  //   text: string = "hello";

  apiBaseHost: string = "http://game.stone2020.com";

  apiPath: string = "/app/";

  api: ApiDist = {
    version: { path: this.apiPath + "user/version", method: "GET" },
    tryplay: { path: this.apiPath + "comm/tryplay", method: "POST" },
    login: { path: this.apiPath + "comm/signin", method: "POST" },
    personUpdate: { path: this.apiPath + "user/personUpdate", method: "POST" },
    qiandao: { path: this.apiPath + "user/qiandao", method: "POST" },
    signout: { path: this.apiPath + "user/signout", method: "POST" },

    userperson: { path: this.apiPath + "user/person", method: "GET" },
    itemuse: { path: this.apiPath + "item/use", method: "POST" },
    itemlist: { path: this.apiPath + "item/list", method: "GET" },
    itembuy: { path: this.apiPath + "item/buy", method: "POST" },
    itemmine: { path: this.apiPath + "item/mine", method: "GET" },
    roomfuben: { path: this.apiPath + "room/fuben", method: "GET" },
    roomfbcreate: { path: this.apiPath + "room/fbcreate", method: "POST" },
    heromylist: { path: this.apiPath + "hero/mylist", method: "GET" },
    roominfo: { path: this.apiPath + "room/info", method: "GET" },
    roomcreate: { path: this.apiPath + "room/create", method: "POST" },
    roomquick: { path: this.apiPath + "room/quick", method: "POST" },
    roomrank: { path: this.apiPath + "room/rank", method: "POST" },
    heroprecreate: { path: this.apiPath + "hero/precreate", method: "GET" },
    herocreate: { path: this.apiPath + "hero/create", method: "POST" },
    skillcreate: { path: this.apiPath + "skill/create", method: "POST" },
    heromine: { path: this.apiPath + "hero/mine", method: "GET" },
    herodetail: { path: this.apiPath + "hero/detail", method: "GET" },
    herosetTop: { path: this.apiPath + "hero/setTop", method: "POST" },
    herorename: { path: this.apiPath + "hero/rename", method: "POST" },
    heroqiansan: { path: this.apiPath + "hero/qiansan", method: "POST" },
    heroqlvup: { path: this.apiPath + "hero/qlvup", method: "POST" },
    herodownall: { path: this.apiPath + "hero/downall", method: "POST" },
    herosaveSetting: {
      path: this.apiPath + "hero/saveSetting",
      method: "POST",
    },
    skillgetMap: { path: this.apiPath + "skill/getMap", method: "GET" },
    skillmine: { path: this.apiPath + "skill/mine", method: "GET" },
    skillinfo: { path: this.apiPath + "skill/info", method: "GET" },
    skilllvup: { path: this.apiPath + "skill/lvup", method: "POST" },
    skillrename: { path: this.apiPath + "skill/rename", method: "POST" },
    skillsetTop: { path: this.apiPath + "skill/setTop", method: "POST" },
    skillreset: { path: this.apiPath + "skill/reset", method: "POST" },
    skillqlvup: { path: this.apiPath + "skill/qlvup", method: "POST" },
    skillrecycle: { path: this.apiPath + "skill/recycle", method: "POST" },
    userfightpage: { path: this.apiPath + "user/fightpage", method: "GET" },
    userduan: { path: this.apiPath + "user/duan", method: "GET" },
    userbang: { path: this.apiPath + "user/bang", method: "GET" },
    commreadme: { path: this.apiPath + "comm/readme", method: "GET" },
    userupdateInfo: { path: this.apiPath + "user/updateInfo", method: "POST" },
  };

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    // 设置常驻节点
    cc.game.addPersistRootNode(this.node);
  }

  async request(param: RequestParam) {
    if (!param.noloading) {
      cc.find("Loading").getComponent("Loading").show(param.name);
    }
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const apiObj = this.api[param.name];
      if (!apiObj) {
        cc.log("请求接口异常", param.name);
        cc.find("Loading").getComponent("Loading").hide(param.name);
        cc.find("Modal").getComponent("Modal").alert({
          content: "请求服务异常~",
          hideClose: true,
        });
        return;
      }
      cc.log("请求地址", this.apiBaseHost + apiObj.path);
      if (param.data) {
        cc.log("请求参数", param.data);
      }
      xhr.onreadystatechange = () => {
        // cc.log(`响应状态 [ ${xhr.readyState} ]`, xhr.status);
        const response = xhr.responseText;
        if (xhr.readyState == 4) {
          cc.find("Loading").getComponent("Loading").hide(param.name);
          try {
            // 请求异常
            if (xhr.status == 400) {
              cc.find("Modal").getComponent("Modal").alert({
                content: "请求异常~",
                hideClose: true,
              });
              return reject(response);
            }
            const data = JSON.parse(response);
            cc.log(`[ ${param.name} ] network返回结果`, data);
            if (xhr.status >= 200 && xhr.status < 400) {
              if (data.code == 1000) {
                return resolve(data.data);
              } else {
                cc.find("Modal").getComponent("Modal").alert({
                  content: data.message,
                  hideClose: true,
                });
                reject(data.message);
              }
            }
            // 登录超时，无权访问
            if (xhr.status == 401) {
              cc.sys.localStorage.removeItem("token");
              cc.find("Modal")
                .getComponent("Modal")
                .alert({
                  content: data.message,
                  hideClose: true,
                  confirmFn: () => {
                    cc.director.loadScene("login");
                  },
                });
              return resolve(data);
            }
            reject(data.message);
          } catch (error) {
            cc.log(`解析返回数据错误`, error);
            reject(response);
          }
        }
      };
      // GET参数拼接
      let extendstr: string = "";
      if (apiObj.method == "GET") {
        let params = [];
        for (const key in param.data) {
          const element = param.data[key];
          params.push(`${key}=${element}`);
        }
        if (params.length > 0) {
          extendstr = extendstr + "?" + params.join("&");
        }
      }
      xhr.open(apiObj.method, this.apiBaseHost + apiObj.path + extendstr, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      const token = cc.sys.localStorage.getItem("token");
      if (token) {
        xhr.setRequestHeader("Authorization", token);
      }
      xhr.timeout = 30000;
      xhr.withCredentials = true;
      if (param.data) {
        xhr.send(JSON.stringify(param.data));
      } else {
        xhr.send();
      }
    })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        // return err;
        throw Error(err);
      });
  }

  //   start() {}

  // update (dt) {}
}
