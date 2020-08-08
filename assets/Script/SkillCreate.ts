// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillCreateClass extends cc.Component {
  @property(cc.Node)
  subPageNode: cc.Node = null;

  // 道具列表
  //   list: any[] = [];
  //   nodeList: cc.Node[] = [];

  // 道具预置
  //   @property(cc.Prefab)
  //   itemPrefab: cc.Prefab = null;

  // 道具容器
  //   @property(cc.Node)
  //   itemBoxNode: cc.Node = null;

  // 描述
  //   @property(cc.Label)
  //   remarkNode: cc.Label = null;

  // 数量
  //   @property(cc.EditBox)
  //   numberNode: cc.EditBox = null;

  // 总价
  //   @property(cc.Label)
  //   totalPriceNode: cc.Label = null;

  // 当前商品
  //   activeItem: any = null;
  //   activeKey: number = 0;
  //   nowNode: cc.Node = null;
  //   lastNode: cc.Node = null;

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
    // await this.reloadItemList();
  }

  //   async reloadItemList() {
  //     try {
  //       const res = await cc.find("Network").getComponent("Network").request({
  //         name: "heroprecreate",
  //       });
  //       this.list = res.racecate;
  //       this.itemBoxNode.destroyAllChildren();
  //       this.nodeList = [];
  //       this.renderItemList();
  //     } catch (error) {
  //       cc.find("Tip").getComponent("Tip").show("英雄种族获取失败，请重新尝试~");
  //     }
  //   }

  // 渲染道具列表
  //   renderItemList() {
  //     if (this.list.length > 0) {
  //       for (const key in this.list) {
  //         const item = this.list[key];
  //         const itemNode = cc.instantiate(this.itemPrefab);
  //         itemNode.parent = this.itemBoxNode;
  //         itemNode
  //           .getChildByName("btn")
  //           .getChildByName("icon")
  //           .getComponent(cc.Sprite).spriteFrame = cc
  //           .find("Icon")
  //           .getComponent("Iconmap")
  //           .getIconsf(item.code);
  //         // 添加点击事件
  //         const clickEventHandler = new cc.Component.EventHandler();
  //         clickEventHandler.target = cc
  //           .find("Canvas")
  //           .getChildByName("skill_create_page");
  //         clickEventHandler.component = "HeroCreate";
  //         clickEventHandler.handler = "chooseItem";
  //         clickEventHandler.customEventData = key;
  //         itemNode
  //           .getChildByName("btn")
  //           .getComponent(cc.Button)
  //           .clickEvents.push(clickEventHandler);
  //         itemNode.active = true;
  //         this.nodeList.push(itemNode);
  //       }
  //       this.chooseItem(null, this.activeKey.toString());
  //     }
  //   }

  //   chooseItem(event: any, index: string) {
  //     if (this.lastNode) {
  //       this.lastNode
  //         .getChildByName("btn")
  //         .getChildByName("Selected").active = false;
  //     }
  //     this.activeKey = Number(index);
  //     this.nodeList[this.activeKey]
  //       .getChildByName("btn")
  //       .getChildByName("Selected").active = true;
  //     const item = this.list[this.activeKey];
  //     this.activeItem = item;
  //     this.remarkNode.string = `种族名称：${item.name}\r\n种族特性：${item.intro}\r\n创建需要2500积分`;
  //     this.lastNode = this.nodeList[this.activeKey];
  //   }

  close() {
    this.subPageNode.y = cc.winSize.height;
    // this.itemBoxNode.destroyAllChildren();
    // this.lastNode = null;
    this.subPageNode.active = false;
    // cc.tween(this.shopPageNode)
    //   .to(0.1, { y: cc.winSize.height })
    //   .start()
    //   .call(() => {
    //     this.itemBoxNode.destroyAllChildren();
    //     this.lastNode = null;
    //     this.shopPageNode.active = false;
    //   });
  }

  buy() {
    // let num = Number(this.numberNode.string);
    // if (num <= 0) {
    //   num = 1;
    //   this.numberNode.string = "1";
    // }
    // const total = this.activeItem.price * num;
    const name = cc
      .find("Canvas/skill_create_page/background/box/name_input")
      .getComponent(cc.EditBox).string;
    function trim(str: string) {
      const reg = /^\s+|\s+$/g;
      return str.replace(reg, "");
    }
    if (trim(name) == "") {
      cc.find("Tip").getComponent("Tip").show("先取个名字吧~");
      return;
    }
    const tips = `打造技能 [ ${name} ] \r\n总共需要 2500 积分`;
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content: tips,
        confirmFn: async () => {
          //   cc.find("Modal").getComponent("Modal").close();
          try {
            await cc
              .find("Network")
              .getComponent("Network")
              .request({
                name: "skillcreate",
                data: { name: name },
              });
            // await this.reloadItemList();
            cc
              .find("Canvas/skill_create_page/background/box/name_input")
              .getComponent(cc.EditBox).string = "";
            cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
            cc.find("Loading").getComponent("Loading").show("skillcreating");
          } catch (error) {
            cc.find("Tip")
              .getComponent("Tip")
              .show(error.message || error);
          }
        },
      });
  }

  // start() {}

  // update (dt) {}
}
