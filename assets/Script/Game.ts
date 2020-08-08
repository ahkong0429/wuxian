// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameClass extends cc.Component {
  //   @property(cc.Label)
  //   label: cc.Label = null;

  //   @property
  //   text: string = "hello";

  inGameing: boolean = false;

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    // 设置常驻节点
    cc.game.addPersistRootNode(this.node);
  }

  enterGame() {
    this.inGameing = true;
  }

  leaveGame() {
    this.inGameing = false;
  }

  isGameing() {
    return this.inGameing;
  }

  //   start() {}

  // update (dt) {}
}
