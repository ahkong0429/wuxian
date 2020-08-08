const { ccclass, property } = cc._decorator;

@ccclass
export default class EntranceClass extends cc.Component {
  // @property(cc.Label)
  // label: cc.Label = null;

  // @property
  // text: string = 'hello';

  // start() {
  // init logic
  // this.label.string = this.text;
  // }

  async onLoad() {
    cc.director.preloadScene("main");
    cc.director.preloadScene("login");
    cc.director.preloadScene("fighting");
    const token = cc.sys.localStorage.getItem("token");
    if (!token) {
      cc.director.loadScene("login");
      return;
    }
    try {
      const version = await cc
        .find("Network")
        .getComponent("Network")
        .request({ name: "version", noloading: true });
      if (version) {
        cc.sys.localStorage.setItem("version", version);
      }
      cc.find("Tip").getComponent("Tip").show("登录成功，正在进入游戏~");
      setTimeout(() => {
        // const inGame = cc.find("Game").getComponent("Game").isGameing();
        // if (inGame) {
        //   return;
        // }
        cc.director.loadScene("main");
      }, 2000);
    } catch (error) {}
  }
}
