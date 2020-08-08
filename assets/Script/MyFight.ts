// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyFightClass extends cc.Component {
  @property(cc.Node)
  subPageNode: cc.Node = null;

  // 道具列表
  list: any[] = [];
  page: number = 1;
  size: number = 20;
  total: number = 1;
  nodeList: cc.Node[] = [];
  mapData: any = null;

  // 道具预置
  @property(cc.Prefab)
  itemPrefab: cc.Prefab = null;

  // 道具容器
  @property(cc.Node)
  itemBoxNode: cc.Node = null;

  // 描述
  //   @property(cc.Label)
  //   remarkNode: cc.Label = null;

  //   英雄面板
  @property(cc.Node)
  heroPanelNode: cc.Node = null;
  skillData: any = null;
  //   heroSkillData1: any = null;
  //   heroSkillData2: any = null;
  @property(cc.Prefab)
  skillItemPref: cc.Prefab = null;
  @property(cc.Node)
  skillBox: cc.Node = null;

  // 数量
  //   @property(cc.EditBox)
  //   numberNode: cc.EditBox = null;

  // 总价
  //   @property(cc.Label)
  //   totalPriceNode: cc.Label = null;

  // 当前商品
  activeItem: any = null;
  activeKey: number = 0;
  nowNode: cc.Node = null;
  lastNode: cc.Node = null;

  //   英雄信息节点
  @property(cc.Label)
  heroPropNode: cc.Label = null;
  @property(cc.Node)
  myHeroBoxNode: cc.Node = null;
  @property(cc.Prefab)
  heroPref: cc.Prefab = null;

  goToTop: number = 0;
  // @property
  // text: string = "hello";

  //   面板按钮组
  @property(cc.Button)
  actTotopBtn: cc.Button = null;
  @property(cc.Button)
  actUseluck: cc.Button = null;

  onLoad() {
    if (this.subPageNode) {
      this.subPageNode.getComponent(cc.Widget).bottom = cc.winSize.height;
      this.itemBoxNode.parent.parent.on(
        "scroll-to-bottom",
        this.scrollToBottom,
        this
      );
    }
    // const client = cc.find("Socket").getComponent("Socket").getClient();
    // client && client.off("alert");
    // client &&
    //   client.on("alert", (msg: string) => {
    //     cc.find("Tip").getComponent("Tip").show(msg);
    //   });
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
      //   const resMap = await cc
      //     .find("Network")
      //     .getComponent("Network")
      //     .request({
      //       name: "skillgetMap",
      //       data: { page: this.page, size: this.size },
      //       noloading: noloading,
      //     });
      //   this.mapData = resMap;
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "userfightpage",
          data: { page: this.page, size: this.size },
          noloading: noloading,
        });
      //   this.lastNode = null;
      //   this.activeKey = 0;
      this.list = res.list;
      this.total = Math.ceil(res.pagination.total / this.size);
      this.itemBoxNode.destroyAllChildren();
      this.nodeList = [];
      this.renderItemList();
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("近期战绩获取失败，请重新尝试~");
    }
  }

  // 渲染道具列表
  renderItemList() {
    if (this.list.length > 0) {
      for (const key in this.list) {
        const item = this.list[key];
        this.pushNode(item, key);
      }
      //   this.chooseItem(null, this.activeKey.toString());
    }
  }

  //   chooseItem(event: any, index: string) {
  //     // if (this.lastNode) {
  //     //   this.lastNode
  //     //     .getChildByName("item")
  //     //     .getChildByName("btn")
  //     //     .getChildByName("Selected").active = false;
  //     // }
  //     this.activeKey = Number(index);
  //     // this.nodeList[this.activeKey]
  //     //   .getChildByName("item")
  //     //   .getChildByName("btn")
  //     //   .getChildByName("Selected").active = true;
  //     const item = this.list[this.activeKey];
  //     this.activeItem = item;
  //     // this.remarkNode.string = `商品名称：${item.name}（剩余${item.bag_num}个）\r\n描述：${item.introduce}`;
  //     this.lastNode = this.nodeList[this.activeKey];
  //     // this.openPanel();
  //   }

  close() {
    this.subPageNode.y = cc.winSize.height;
    // this.itemBoxNode.destroyAllChildren();
    // this.lastNode = null;
    this.subPageNode.active = false;
    this.page = 1;
    // cc.tween(this.bagPageNode)
    //   .to(0.1, { y: cc.winSize.height })
    //   .start()
    //   .call(() => {
    //     this.itemBoxNode.destroyAllChildren();
    //     this.lastNode = null;
    //     this.bagPageNode.active = false;
    //   });
  }

  async scrollToBottom() {
    if (this.page < this.total) {
      this.page++;
      try {
        const res = await cc
          .find("Network")
          .getComponent("Network")
          .request({
            name: "userfightpage",
            data: { page: this.page, size: this.size },
          });
        // this.list.concat(res.list);
        this.total = Math.ceil(res.pagination.total / this.size);
        // this.itemBoxNode.destroyAllChildren();
        // this.nodeList = [];
        this.appendItemList(res.list);
      } catch (error) {
        cc.find("Tip")
          .getComponent("Tip")
          .show("技能仓库获取失败，请重新尝试~");
      }
    } else {
      cc.find("Tip").getComponent("Tip").show("已经到底啦~");
    }
  }

  appendItemList(list: any[]) {
    if (list.length > 0) {
      for (const key in list) {
        const item = list[key];
        this.pushNode(item, this.list.length + Number(key));
      }
      this.list.concat(list);
    }
  }

  pushNode(item: any, key: any) {
    const itemNode = cc.instantiate(this.itemPrefab);
    this.itemBoxNode.addChild(itemNode);
    // itemNode.parent = this.itemBoxNode;
    // itemNode
    //   .getChildByName("item")
    //   .getChildByName("btn")
    //   .getChildByName("icon")
    //   .getComponent(cc.Sprite).spriteFrame = cc
    //   .find("Icon")
    //   .getComponent("Iconmap")
    //   .getIconsf(item.race);
    // const propTotal =
    //   item.agi +
    //   item.ang +
    //   item.cha +
    //   item.end +
    //   item.luc +
    //   item.men +
    //   item.pow +
    //   item.str;
    itemNode
      .getChildByName("remark")
      .getComponent(
        cc.Label
      ).string = `参赛英雄：${item.name}\r\n战斗结果：${item.result} ( ${item.type} )\r\n开始时间：${item.createTime}，结束时间：${item.updateTime}`;
    if (item.color == 1) {
      itemNode.getChildByName("remark").color = cc.color(28, 166, 236);
    }
    if (item.color == 2) {
      itemNode.getChildByName("remark").color = cc.color(255, 0, 0);
    }
    if (item.color == 0) {
      itemNode.getChildByName("remark").color = cc.color(76, 217, 100);
    }
    // 添加点击事件
    // const clickEventHandler = new cc.Component.EventHandler();
    // clickEventHandler.target = cc
    //   .find("Canvas")
    //   .getChildByName("my_skill_page");
    // clickEventHandler.component = "MySkill";
    // clickEventHandler.handler = "chooseItem";
    // clickEventHandler.customEventData = key;
    // itemNode.getComponent(cc.Button).clickEvents.push(clickEventHandler);
    itemNode.active = true;
    this.nodeList.push(itemNode);
  }

  //   async openPanel(noloading?: boolean) {
  //     try {
  //       const res = await cc
  //         .find("Network")
  //         .getComponent("Network")
  //         .request({
  //           name: "skillinfo",
  //           data: { id: this.activeItem.id },
  //           noloading: noloading,
  //         });
  //       cc.log(res);
  //       this.skillData = res;
  //       //   this.heroSkillData1 = res.skill1;
  //       //   this.heroSkillData2 = res.skill2;
  //       this.renderPanel();
  //       this.heroPanelNode.active = true;
  //     } catch (error) {
  //       cc.log(error);
  //       cc.find("Tip").getComponent("Tip").show("技能数据获取失败，请重新尝试~");
  //     }
  //   }

  //   renderPanel() {
  //     //   祝福状态
  //     this.actUseluck.node
  //       .getChildByName("Background")
  //       .getChildByName("Label")
  //       .getComponent(cc.Label).string =
  //       cc.find("Canvas").getComponent("Main").user.lucky == 1
  //         ? `祝福中！`
  //         : "使用 [ 祝福卡 ]";
  //     const skill = this.skillData;

  //     this.heroPropNode.string = `${skill.name} ( ${skill.level} / ${
  //       skill.maxlevel
  //     } ) 强化 + ${skill.lv}\r\n类型：${
  //       this.mapData.typeMap[skill.type]
  //     }\r\n派系：${this.mapData.skilltypeMap[skill.skilltype]}\r\n评分：${
  //       skill.power
  //     }\r\n作用对象：${
  //       this.mapData.effecttargetMap[skill.effecttarget]
  //     }\r\n施放范围：${
  //       this.mapData.skillDistance[skill.effectdistance]
  //     }\r\n发动效果：${this.mapData.effecttypeMap[skill.effecttype]}${
  //       skill.effectinit
  //     }点${this.mapData.effectMap[skill.effecttargettype]}\r\n附加特殊状态：${
  //       this.mapData.statusplusMap[skill.statusplus]
  //     }\r\n状态持续时间：${skill.pluslasttime}s\r\n技能消耗：${
  //       skill.spendinit
  //     }点${this.mapData.spendMap[skill.spendtype]}\r\n施法时间：${
  //       skill.needtime
  //     }s\r\n冷却时间：${skill.coldtime}s`;
  //     // 设定常用
  //     this.actTotopBtn.node
  //       .getChildByName("Background")
  //       .getChildByName("Label")
  //       .getComponent(cc.Label).string =
  //       skill.totop == 1 ? `取消常用技能` : "设定为常用技能";
  //   }

  //   closePanel() {
  //     this.heroPanelNode.active = false;
  //   }

  //   async actTotop() {
  //     let top = 0;
  //     if (this.skillData.totop) {
  //       //   to cancel
  //       top = 0;
  //     } else {
  //       //   to top
  //       top = 1;
  //     }
  //     try {
  //       await cc
  //         .find("Network")
  //         .getComponent("Network")
  //         .request({
  //           name: "skillsetTop",
  //           data: { id: this.skillData.id, totop: top },
  //         });
  //       this.openPanel(true);
  //       this.reloadItemList(true);
  //       cc.find("Tip").getComponent("Tip").show("设置成功~");
  //     } catch (error) {
  //       cc.find("Tip").getComponent("Tip").show("设置失败，请重新尝试~");
  //     }
  //   }
  //   async actRename() {
  //     await cc
  //       .find("Modal")
  //       .getComponent("Modal")
  //       .alert({
  //         title: "给技能取个新名字吧",
  //         inputMode: true,
  //         confirmFn: async (content: string) => {
  //           try {
  //             await cc
  //               .find("Network")
  //               .getComponent("Network")
  //               .request({
  //                 name: "skillrename",
  //                 data: { id: this.skillData.id, name: content },
  //               });
  //             cc.find("Tip").getComponent("Tip").show("重命名成功~");
  //             this.openPanel(true);
  //             this.reloadItemList(true);
  //           } catch (error) {
  //             cc.find("Tip").getComponent("Tip").show("重命名失败~");
  //           }
  //         },
  //       });
  //   }
  //   //   遣散
  //   async actBuyQiang() {
  //     await cc
  //       .find("Modal")
  //       .getComponent("Modal")
  //       .alert({
  //         title: "慎重提示！",
  //         content:
  //           "技能回收按打造价和升级消耗的积分（不包含强化）总额的70%回收，回收后不可恢复，请慎重操作！请慎重操作！请慎重操作！",
  //         confirmFn: async (content: string) => {
  //           try {
  //             await cc
  //               .find("Network")
  //               .getComponent("Network")
  //               .request({
  //                 name: "skillrecycle",
  //                 data: { id: this.skillData.id },
  //               });
  //             await this.reloadItemList(true);
  //             cc.find("Tip")
  //               .getComponent("Tip")
  //               .show("该技能已回收，积分已到账~");
  //             this.closePanel();
  //             await cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
  //           } catch (error) {
  //             cc.find("Tip").getComponent("Tip").show(error);
  //           }
  //         },
  //       });
  //   }
  //   async actChai() {
  //     try {
  //       await cc
  //         .find("Network")
  //         .getComponent("Network")
  //         .request({
  //           name: "skilllvup",
  //           data: { id: this.activeItem.id },
  //         });
  //       cc.find("Tip").getComponent("Tip").show("升级成功~");
  //       this.openPanel(true);
  //       this.reloadItemList(true);
  //     } catch (error) {
  //       cc.find("Tip").getComponent("Tip").show(error);
  //     }
  //   }
  //   async actUseLuck(event: any, ItemId: string) {
  //     try {
  //       await cc
  //         .find("Network")
  //         .getComponent("Network")
  //         .request({
  //           name: "itemuse",
  //           data: { id: Number(ItemId) },
  //         });
  //       cc.find("Tip").getComponent("Tip").show("祝福状态已加持~");
  //       await cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
  //       this.openPanel(true);
  //       this.reloadItemList(true);
  //     } catch (error) {
  //       //   cc.find("Tip").getComponent("Tip").show("祝福失败~");
  //     }
  //   }
  //   async actUseQiang() {
  //     try {
  //       await cc
  //         .find("Network")
  //         .getComponent("Network")
  //         .request({
  //           name: "skillqlvup",
  //           data: { id: Number(this.activeItem.id) },
  //         });
  //       //   cc.find("Tip").getComponent("Tip").show("强化成功~");
  //       await cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
  //       this.openPanel(true);
  //       this.reloadItemList(true);
  //     } catch (error) {
  //       //   cc.find("Tip").getComponent("Tip").show("强化失败~");
  //     }
  //   }
  //   async actUseXilian() {
  //     try {
  //       await cc
  //         .find("Network")
  //         .getComponent("Network")
  //         .request({
  //           name: "skillreset",
  //           data: { id: Number(this.activeItem.id) },
  //         });
  //       //   cc.find("Tip").getComponent("Tip").show("强化成功~");
  //       await cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
  //       this.openPanel(true);
  //       this.reloadItemList(true);
  //     } catch (error) {
  //       //   cc.find("Tip").getComponent("Tip").show("强化失败~");
  //     }
  //   }

  //   async useItem() {
  //     if (this.activeItem.jump && this.activeItem.jump == "hero") {
  //       cc.find("Tip")
  //         .getComponent("Tip")
  //         .show("请打开 [ 我的英雄 ] 界面进行操作~");
  //       return;
  //     }
  //     if (this.activeItem.jump && this.activeItem.jump == "skill") {
  //       cc.find("Tip")
  //         .getComponent("Tip")
  //         .show("请打开 [ 我的技能 ] 界面进行操作~");
  //       return;
  //     }
  //     try {
  //       await cc
  //         .find("Network")
  //         .getComponent("Network")
  //         .request({
  //           name: "itemuse",
  //           data: { id: Number(this.activeItem.bag_itemId) },
  //         });
  //       await this.reloadItemList();
  //       await cc.find("Canvas").getComponent("Main").reloadUserInfo();
  //       cc.find("Tip").getComponent("Tip").show("使用道具成功~");
  //     } catch (error) {}
  //   }

  update(dt: any) {
    if (this.goToTop > 0) {
      this.goToTop -= dt;
      if (this.goToTop <= 0) {
        this.skillBox.parent.parent
          .getComponent(cc.ScrollView)
          .scrollToTop(0.1);
      }
    }
  }
}
