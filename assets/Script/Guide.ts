// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideClass extends cc.Component {
  guideStep: number = 1;
  maxStep: number = 17;

  //   引导相关组件
  @property(cc.Node)
  maskNode: cc.Node = null;
  @property(cc.Node)
  frame: cc.Node = null;
  @property(cc.Node)
  text: cc.Node = null;
  @property(cc.Node)
  hand: cc.Node = null;

  //   目标组件
  //   创建英雄
  @property(cc.Node)
  createHero1: cc.Node = null;
  @property(cc.Node)
  createHero2: cc.Node = null;
  createHero3: cc.Node = null;
  createHero4: cc.Node = null;
  // 创建技能
  @property(cc.Node)
  createSkill1: cc.Node = null;
  @property(cc.Node)
  createSkill2: cc.Node = null;
  createSkill3: cc.Node = null;
  createSkill4: cc.Node = null;
  //   装备技能
  @property(cc.Node)
  myHero1: cc.Node = null;
  // 副本
  @property(cc.Node)
  fuben1: cc.Node = null;
  @property(cc.Node)
  fuben2: cc.Node = null;
  @property(cc.Node)
  fuben3: cc.Node = null;

  @property(cc.EditBox)
  createHeroName: cc.EditBox = null;
  @property(cc.EditBox)
  createSkillName: cc.EditBox = null;
  @property(cc.Node)
  heroPanelClose: cc.Node = null;
  @property(cc.Node)
  heroListClose: cc.Node = null;

  targetBtn: cc.Node = null;
  // @property(cc.Label)
  // label: cc.Label = null;
  // @property
  // text: string = 'hello';
  // LIFE-CYCLE CALLBACKS:
  onLoad() {
    this.node.parent.active = false;
    this.guideStep = 0;
    // 触摸监听
    this.node.on("touchstart", this.onTouchStart, this);
    // this.guide();
  }

  onTouchStart(event: any) {
    if (this.guideStep > 0) {
      //   const pos = this.node.convertToNodeSpaceAR(event.getLocation());
      //   if (this.guideStep == 1) {
      //     this.targetBtn = this.createHero1;
      //   }

      // 获取相应按钮的大小范围
      const rect = this.targetBtn.getBoundingBox();
      // 获取触摸点，转为Canvas画布上的坐标
      const pos = this.targetBtn.parent.convertToNodeSpaceAR(
        event.getLocation()
      );
      cc.log("是否击中", rect.contains(pos));
      // 判断触摸点是否在按钮上
      if (rect.contains(pos)) {
        // 允许触摸事件传递给按钮(允许冒泡)
        (this.node as any)._touchListener.setSwallowTouches(false);
        if (
          this.guideStep == 2 ||
          this.guideStep == 5 ||
          this.guideStep == 6 ||
          this.guideStep == 11 ||
          this.guideStep == 12 ||
          this.guideStep == 13 ||
          this.guideStep == 14
        ) {
          this.nextStep();
        }
        // this.guideStep++;
        // 如果按钮都点击了，则将guideStep设置为0，并隐藏所有相关节点
        if (this.guideStep >= this.maxStep) {
          this.guideStep = 0;
          this.node.parent.active = false;
          //   this.node.destroyAllChildren();
          //   this.node.destroy();
          //   教程完成
          cc.sys.localStorage.setItem("pGuide", "1");
          return;
        }
        // this.guide();
      } else {
        // 吞噬触摸，禁止触摸事件传递给按钮(禁止冒泡)
        (this.node as any)._touchListener.setSwallowTouches(true);
      }
    }
  }

  guide() {
    if (this.guideStep == 0) {
      this.guideStep = 1;
    }
    this.node.parent.active = true;
    if (this.guideStep == 1) {
      this.targetBtn = this.createHero1;
      // 引导文本
      this.showInfo("首先创建一个你的英雄角色！请点击 [ 创建英雄 ]");
    }
    if (this.guideStep == 2) {
      this.targetBtn = this.createHero2;
      // 引导文本
      this.showInfo("创建英雄将消耗 1000 积分，请点击 [ 创建 ]");
      //   输入英雄名称
      this.createHeroName.string = "新手";
    }
    if (this.guideStep == 3) {
      this.createHero3 = cc.find("Modal/main/box/btns/confirm");
      this.targetBtn = this.createHero3;
      // 引导文本
      this.showInfo("请点击 [ 确定 ]");
    }
    if (this.guideStep == 4) {
      this.createHero4 = cc.find("Modal/main/box/btns/cancel");
      this.targetBtn = this.createHero4;
      // 引导文本
      this.showInfo("请点击 [ 关闭 ]");
    }
    if (this.guideStep == 5) {
      this.targetBtn = this.createSkill1;
      // 引导文本
      this.showInfo("接下来为你的英雄打造技能吧，请点击[ 打造技能 ]");
    }
    if (this.guideStep == 6) {
      this.targetBtn = this.createSkill2;
      this.createSkillName.string = "新手专属";
      // 引导文本
      this.showInfo("打造技能需要消耗 2500 积分，请点击[ 开始打造 ]");
    }
    if (this.guideStep == 7) {
      this.targetBtn = cc.find("Modal/main/box/btns/confirm");
      // 引导文本
      this.showInfo("请点击 [ 确定 ]");
    }
    if (this.guideStep == 8) {
      this.targetBtn = cc.find("Modal/main/box/btns/cancel");
      // 引导文本
      this.showInfo("请点击 [ 关闭 ]");
    }
    if (this.guideStep == 9) {
      this.targetBtn = this.myHero1;
      // 引导文本
      this.showInfo("接下来为英雄装备刚打造好的技能，请点击[ 我的英雄 ]");
    }
    if (this.guideStep == 10) {
      try {
        const list = cc.find(
          "Canvas/my_hero_page/background/box/scroll/view/content"
        );
        this.targetBtn = list.children[0];
        // 引导文本
        this.showInfo("请选择新手英雄");
      } catch (error) {}
    }
    if (this.guideStep == 11) {
      try {
        const list = cc.find(
          "Canvas/hero_show/oprate/skills_box/scroll/view/skills"
        );
        this.targetBtn = list.children[0].getChildByName("select");
        // this.hand.rotation = 0;
        this.hand.scaleX = -this.hand.scaleX;
        // 引导文本
        this.showInfo("为英雄勾选技能进行装备");
      } catch (error) {}
    } else {
      //   this.hand.rotation = 80;
      //   this.hand.scaleX = 0.7;
      //   this.hand.rotation = 0;
      //   this.hand.scaleX = -this.hand.scaleX;
    }
    if (this.guideStep == 12) {
      this.hand.scaleX = -this.hand.scaleX;
      this.targetBtn = cc.find("Modal/main/box/btns/confirm");
      // 引导文本
      this.showInfo("请点击 [ 确定 ]");
    }
    if (this.guideStep == 13) {
      this.targetBtn = this.heroPanelClose;
      // 引导文本
      this.showInfo("请点击 [ 关闭面板 ]");
    }
    if (this.guideStep == 14) {
      this.targetBtn = this.heroListClose;
      // 引导文本
      this.showInfo("请关闭 [ 我的英雄 ]");
    }
    if (this.guideStep == 15) {
      this.targetBtn = this.fuben1;
      // 引导文本
      this.showInfo("现在用我们的英雄去参加一场副本战吧");
    }
    if (this.guideStep == 16) {
      this.targetBtn = this.fuben2;
      // 引导文本
      this.showInfo("请点击 [ 挑战 ]");
    }
    if (this.guideStep == 17) {
      this.targetBtn = this.fuben3;
      // 引导文本
      this.showInfo("请点击 [ 准备 ]");
    }
    this.setHand();
  }

  showInfo(str: string) {
    // 显示引导文本
    this.unscheduleAllCallbacks();

    this.text.getComponent(cc.Label).string = "";
    let i = 0;

    this.schedule(
      () => {
        this.text.getComponent(cc.Label).string += str[i];
        i++;
      },
      0.2,
      str.length - 1
    );
  }

  setHand() {
    // 设置引导手
    this.hand.removeFromParent();
    const pos = cc.v2({
      x: 0,
      y: 0,
    });
    this.hand.setPosition(pos);
    this.targetBtn.addChild(this.hand);
    this.hand.stopAllActions(); // 记得停止之前的动作
    cc.tween(this.hand)
      .repeatForever(
        cc.sequence(
          cc.moveBy(0.8, cc.v2(5, 10)),
          cc.moveBy(0.8, cc.v2(-5, -10))
        )
      )
      .start();
  }

  nextStep() {
    if (this.guideStep > 0) {
      this.guideStep++;
      cc.log(`第${this.guideStep}步`);
      this.guide();
    }
  }

  onDestroy() {
    // 取消监听
    this.node.off("touchstart", this.onTouchStart, this);
  }
  // start () {
  // }
  // update (dt) {}
}
