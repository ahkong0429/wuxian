// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroClass extends cc.Component {
  // @property(cc.Label)
  // 特征编码 boss为uid 玩家为种族
  code: string = null;
  // @property
  // text: string = 'hello';
  // 动作后回归站立姿态
  // timer: number = 0;
  // 龙骨资源
  bassets: any;
  // 玩家位置
  playerIndex: number = 0;
  // 对话框组件
  dialog: cc.Node = null;
  // 对话持续时间
  timeouttime: number = 1500;
  // 对话框清除器
  counter: number = null;
  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.idle();
    // 动作完成后默认idle姿态
    this.listenComplateStop();
  }
  init(code: string, playerIndex: number) {
    this.code = code;
    this.playerIndex = playerIndex;
    this.bassets = cc
      .find("Icon")
      .getComponent("Iconmap")
      .getBoneAsset(this.code);
    if (this.playerIndex == 0) {
      this.dialog = this.node.parent.parent.getChildByName("myDialog");
    } else {
      this.dialog = this.node.parent.parent.getChildByName("emyDialog");
    }
    this.dialog.active = false;
  }
  say(content: string) {
    this.dialog.getChildByName("text").getComponent(cc.Label).string = content;
    this.dialog.active = true;
    this.dialog.opacity = 255;
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      cc.tween(this.dialog)
        .sequence(
          cc.fadeOut(1),
          cc.callFunc(() => {
            this.dialog.active = false;
          }, this)
        )
        .start();
    }, this.timeouttime);
  }
  attack() {
    this.node
      .getComponent(dragonBones.ArmatureDisplay)
      .playAnimation(this.bassets.ATK, 1);
  }
  damage() {
    this.node
      .getComponent(dragonBones.ArmatureDisplay)
      .playAnimation(this.bassets.DMG, 1);
  }
  skill() {
    this.node
      .getComponent(dragonBones.ArmatureDisplay)
      .playAnimation(this.bassets.SKL, 1);
  }
  listenComplateStop() {
    this.node
      .getComponent(dragonBones.ArmatureDisplay)
      .addEventListener(dragonBones.EventObject.COMPLETE, () => {
        this.idle();
      });
  }
  idle() {
    this.node
      .getComponent(dragonBones.ArmatureDisplay)
      .playAnimation("Idle", 0);
  }
  //   start() {}
  // update(dt) {}
  onDestroy() {
    clearTimeout(this.counter);
  }
}
