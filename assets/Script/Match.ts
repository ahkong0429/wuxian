// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MatchClass extends cc.Component {
  @property(cc.Node)
  subPageNode: cc.Node = null;

  // @property
  // text: string = "hello";

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.subPageNode.getComponent(cc.Widget).bottom = cc.winSize.height;
  }

  async open() {
    this.subPageNode.active = true;
    cc.tween(this.subPageNode)
      .to(0.18, { y: 0 }, { easing: "quartIn" })
      .start();
  }

  close() {
    this.subPageNode.y = cc.winSize.height;
    this.subPageNode.active = false;
  }

  async createroom() {
    try {
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "roomcreate",
          data: { name: "匹配赛" + Date.now().toString().substr(-9) },
        });
      cc.find("Tip").getComponent("Tip").show("创建成功~");
    } catch (err) {
      cc.find("Tip").getComponent("Tip").show("创建失败~");
    }
  }

  async quick() {
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({ name: "roomquick" });
      cc.find("Tip").getComponent("Tip").show("匹配成功~");
    } catch (err) {
      cc.find("Tip").getComponent("Tip").show("匹配失败~");
    }
  }

  async rank() {
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({ name: "roomrank" });
      cc.find("Tip").getComponent("Tip").show("匹配成功~");
    } catch (err) {
      cc.find("Tip").getComponent("Tip").show("匹配失败~");
    }
  }
}
