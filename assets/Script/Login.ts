// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginClass extends cc.Component {
  @property(cc.EditBox)
  usernameNode: cc.EditBox = null;

  @property(cc.EditBox)
  passwordNode: cc.EditBox = null;

  // @property
  // text: string = 'hello';

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    cc.director.preloadScene("main");
  }

  //   start() {}

  async submitLogin() {
    if (this.usernameNode.string == "" || this.passwordNode.string == "") {
      cc.find("Modal").getComponent("Modal").alert({
        content: "用户名或密码不能为空~",
      });
      // hideClose: true,
      //   closeFn: () => {
      //     cc.log("用户点击取消");
      //   },
      //   confirmFn: () => {
      //     cc.log("用户点击确定");
      //   },
      return;
    }
    // cc.log("开始登录...", this.usernameNode.string, this.passwordNode.string);
    try {
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "login",
          data: {
            username: this.usernameNode.string,
            password: this.passwordNode.string,
          },
        });
      // cc.log("登录返回", res);
      if (res.token) {
        cc.sys.localStorage.setItem("token", res.token);
        // cc.find("Socket").getComponent("Socket").connect();
        cc.find("Tip").getComponent("Tip").show("登录成功，正在进入游戏~");
        cc.director.loadScene("main");
      }
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("登录失败~");
    }
  }

  async tryPlay() {
    try {
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({ name: "tryplay" });
      // cc.log("试玩返回", res);
      if (res.token) {
        cc.sys.localStorage.setItem("token", res.token);
        // cc.find("Socket").getComponent("Socket").connect();
        cc.find("Tip").getComponent("Tip").show("登录成功，正在进入游戏~");
        cc.director.loadScene("main");
      }
    } catch (error) {}
  }

  // update (dt) {}
}
