// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class EffectClass extends cc.Component {
  // @property(cc.Label)
  // label: cc.Label = null;
  // @property
  //   text: string = "hello";
  // LIFE-CYCLE CALLBACKS:
  //   onLoad() {
  //   }
  showDamage(text: string) {
    this.node.color = cc.color(255, 0, 0);
    this.node.getComponent(cc.Label).string = text;
    this.play();
  }
  showSpend(text: string) {
    this.node.color = cc.color(255, 230, 2);
    this.node.getComponent(cc.Label).string = text;
    this.play();
  }
  showHeal(text: string) {
    this.node.color = cc.color(148, 255, 240);
    this.node.getComponent(cc.Label).string = text;
    this.play();
  }
  play() {
    this.node.active = true;
    cc.tween(this.node)
      .sequence(
        cc.moveBy(2, cc.v2(0, 100)),
        cc.tween().parallel(cc.moveBy(1, cc.v2(0, 50)), cc.fadeOut(1))
      )
      .start()
      .call(() => {
        this.node.destroy();
      });
  }
  //   start() {}
  // update (dt) {}
}
