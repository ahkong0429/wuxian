// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyBangClass extends cc.Component {
  @property(cc.Node)
  subPageNode: cc.Node = null;

  @property(cc.Label)
  contentLabel: cc.Label = null;

  onLoad() {
    if (this.subPageNode) {
      this.subPageNode.getComponent(cc.Widget).bottom = cc.winSize.height;
    }
  }

  start() {}

  async open() {
    this.subPageNode.active = true;
    cc.tween(this.subPageNode)
      .to(0.18, { y: 0 }, { easing: "quartIn" })
      .start();
    await this.reloadItemList();
  }

  async reloadItemList(noloading?: boolean) {
    try {
      const res = await cc.find("Network").getComponent("Network").request({
        name: "commreadme",
        noloading: noloading,
      });
      this.contentLabel.string = res;
    } catch (error) {}
  }

  close() {
    this.subPageNode.y = cc.winSize.height;
    this.subPageNode.active = false;
  }

  update(dt: any) {}
}
