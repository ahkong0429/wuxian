// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TipClass extends cc.Component {
  @property(cc.Prefab)
  msgNode: cc.Prefab = null;

  //   @property(cc.Label)
  //   msg: cc.Label = null;

  //   消息列表
  list: cc.Node[] = [];

  //   停留多久
  hideTime: number = 3000; //ms
  timerList: any[] = [];

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    //  常驻节点
    cc.game.addPersistRootNode(this.node);
    this.node.active = false;
  }

  show(content: string) {
    // this.msg.string = content;
    const nowScene = cc.director.getScene();
    if (nowScene) {
      const newNode = cc.instantiate(this.msgNode);
      if (newNode) {
        newNode.parent = nowScene;
        newNode.getComponentInChildren(cc.Label).string = content;
        newNode.active = true;
        this.list.push(newNode);
        this.timerList.push(
          setTimeout(() => {
            this.deleteOneNode();
          }, this.hideTime)
        );
        // 定位
        this.renderMsgList();
      }
    }
  }

  // 遍历消息节点定位好位置开始显示，动作，隐藏，移除节点
  renderMsgList() {
    const maxHeight = this.list.length * 32 + 8;
    for (const key in this.list) {
      const node = this.list[key];
      //   console.log("当前要显示的节点", node);
      const y = maxHeight - (Number(key) + 1) * 32;
      node.setPosition(cc.v2(cc.winSize.width / 2, y));
    }
  }

  deleteOneNode() {
    if (this.list) {
      const node = this.list[0];
      if (node) {
        node.destroy();
        this.list.splice(0, 1);
        this.timerList.splice(0, 1);
      }
    }
  }

  onDestroy() {
    for (const key in this.timerList) {
      clearTimeout(this.timerList[key]);
    }
  }

  //   start() {}

  // update (dt) {}
}
