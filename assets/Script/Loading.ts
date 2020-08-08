// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.Sprite)
  outsideNode: cc.Sprite = null;

  @property(cc.Sprite)
  middleNode: cc.Sprite = null;

  @property(cc.Sprite)
  insideNode: cc.Sprite = null;

  loadMap: any = {};

  timer: any = 0;
  wait: number = 30; //超时时间，秒
  timeout: any = 0;

  // @property
  // text: string = 'hello';

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    // 设置常驻节点
    cc.game.addPersistRootNode(this.node);
    this.node.active = false;
  }

  show(key?: string) {
    if (key) {
      this.loadMap[key] = new Date().getTime();
    }
    const time = this.wait;
    const zhuan1 = cc.repeatForever(cc.rotateBy(10 * time, 360 * time));
    this.outsideNode.node.runAction(zhuan1);
    const zhuan2 = cc.repeatForever(cc.rotateBy(8 * time, -360 * time));
    this.middleNode.node.runAction(zhuan2);
    const zhuan3 = cc.repeatForever(cc.rotateBy(6 * time, 360 * time));
    this.insideNode.node.runAction(zhuan3);
    this.node.active = true;
    // 设置兜底定时器
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      if (this.node.active) {
        this.close();
        cc.log("BUG!!!!", key);
        cc.find("Modal")
          .getComponent("Modal")
          .alert({
            content: "当前网络信号较弱~",
            // hideClose: true,
            confirmText: "重新载入",
            confirmFn: () => {
              cc.game.restart();
            },
          });
        // cc.find("Tip").getComponent("Tip").show("服务器断开连接~");
      }
    }, this.wait * 1000);
  }

  hide(key?: string) {
    const start = this.loadMap[key];
    if (key && start) {
      const now = new Date().getTime();
      const diff = now - start;
      if (diff < 300) {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.close();
          this.timer = 0;
        }, 300 - diff);
        return;
      }
      this.close();
    }
    this.close();
  }

  close() {
    this.outsideNode.node.stopAllActions();
    this.middleNode.node.stopAllActions();
    this.insideNode.node.stopAllActions();
    this.node.active = false;
    clearTimeout(this.timeout);
    this.timeout = 0;
  }

  onDestroy() {
    clearTimeout(this.timeout);
    clearTimeout(this.timer);
  }

  //   start() {}

  // update (dt) {}
}
