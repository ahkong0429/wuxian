// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyHeroClass extends cc.Component {
  @property(cc.Node)
  subPageNode: cc.Node = null;

  // 道具列表
  list: any[] = [];
  page: number = 1;
  size: number = 20;
  total: number = 1;
  nodeList: cc.Node[] = [];

  // 道具预置
  @property(cc.Prefab)
  itemPrefab: cc.Prefab = null;

  // 道具容器
  @property(cc.Node)
  itemBoxNode: cc.Node = null;

  // 描述
  @property(cc.Label)
  remarkNode: cc.Label = null;

  //   英雄面板
  @property(cc.Node)
  heroPanelNode: cc.Node = null;
  heroData: any = null;
  heroSkillData1: any = null;
  heroSkillData2: any = null;
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
  }

  async open() {
    this.subPageNode.active = true;
    cc.tween(this.subPageNode)
      .to(0.18, { y: 0 }, { easing: "quartIn" })
      .start();
    await this.reloadItemList();
    try {
      cc.find("Canvas/player_guide/mask").getComponent("Guide").nextStep();
    } catch (error) {
      cc.log(error);
    }
  }

  async reloadItemList(noloading?: boolean) {
    try {
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "heromine",
          data: { page: this.page, size: this.size },
          noloading: noloading,
        });
      this.lastNode = null;
      this.activeKey = 0;
      this.list = res.list;
      this.total = Math.ceil(res.pagination.total / this.size);
      this.itemBoxNode.destroyAllChildren();
      this.nodeList = [];
      this.renderItemList();
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("我的英雄获取失败，请重新尝试~");
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

  chooseItem(event: any, index: string) {
    if (this.lastNode) {
      this.lastNode
        .getChildByName("item")
        .getChildByName("btn")
        .getChildByName("Selected").active = false;
    }
    this.activeKey = Number(index);
    this.nodeList[this.activeKey]
      .getChildByName("item")
      .getChildByName("btn")
      .getChildByName("Selected").active = true;
    const item = this.list[this.activeKey];
    this.activeItem = item;
    // this.remarkNode.string = `商品名称：${item.name}（剩余${item.bag_num}个）\r\n描述：${item.introduce}`;
    this.lastNode = this.nodeList[this.activeKey];
    this.openPanel();
  }

  close() {
    this.subPageNode.y = cc.winSize.height;
    this.itemBoxNode.destroyAllChildren();
    this.lastNode = null;
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
            name: "heromine",
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
          .show("我的英雄获取失败，请重新尝试~");
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
    itemNode
      .getChildByName("item")
      .getChildByName("btn")
      .getChildByName("icon")
      .getComponent(cc.Sprite).spriteFrame = cc
      .find("Icon")
      .getComponent("Iconmap")
      .getIconsf(item.race);
    const propTotal =
      item.agi +
      item.ang +
      item.cha +
      item.end +
      item.luc +
      item.men +
      item.pow +
      item.str;
    itemNode
      .getChildByName("remark")
      .getComponent(
        cc.Label
      ).string = `${item.name}\r\n种族：${item.raceName}，性别：${item.sexName}，年龄：${item.age}，性格：${item.characterName}\r\n可装备技能数：${item.shape}，总属性：${propTotal}，强化等级：${item.lv}`;
    // 添加点击事件
    const clickEventHandler = new cc.Component.EventHandler();
    clickEventHandler.target = cc.find("Canvas").getChildByName("my_hero_page");
    clickEventHandler.component = "MyHero";
    clickEventHandler.handler = "chooseItem";
    clickEventHandler.customEventData = key;
    itemNode.getComponent(cc.Button).clickEvents.push(clickEventHandler);
    itemNode.active = true;
    this.nodeList.push(itemNode);
  }

  async openPanel(noloading?: boolean) {
    try {
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "herodetail",
          data: { id: this.activeItem.id },
          noloading: noloading,
        });
      cc.log(res);
      this.heroData = res.hero;
      this.heroSkillData1 = res.skill1;
      this.heroSkillData2 = res.skill2;
      this.renderPanel();
      this.heroPanelNode.active = true;
      try {
        cc.find("Canvas/player_guide/mask").getComponent("Guide").nextStep();
      } catch (error) {
        cc.log(error);
      }
    } catch (error) {
      cc.log(error);
      cc.find("Tip").getComponent("Tip").show("英雄数据获取失败，请重新尝试~");
    }
  }

  async openDetail(id: number) {
    try {
      const res = await cc.find("Network").getComponent("Network").request({
        name: "herodetail",
        data: { id },
      });
      cc.log(res);
      this.activeItem = res.hero;
      this.heroData = res.hero;
      this.heroSkillData1 = res.skill1;
      this.heroSkillData2 = res.skill2;
      this.renderPanel();
      this.heroPanelNode.active = true;
    } catch (error) {
      cc.log(error);
      cc.find("Tip").getComponent("Tip").show("英雄数据获取失败，请重新尝试~");
    }
  }

  renderPanel() {
    //   祝福状态
    this.actUseluck.node
      .getChildByName("Background")
      .getChildByName("Label")
      .getComponent(cc.Label).string =
      cc.find("Canvas").getComponent("Main").user.lucky == 1
        ? `祝福中！`
        : "使用 [ 祝福卡 ]";
    const hero = this.heroData;
    // 加载骨骼
    const myRes = cc
      .find("Icon")
      .getComponent("Iconmap")
      .getBoneAsset(hero.race);
    const beforeName = this.myHeroBoxNode
      .getChildByName("hero")
      .getComponent(dragonBones.ArmatureDisplay).armatureName;
    if (beforeName != myRes.Name) {
      this.myHeroBoxNode.destroyAllChildren();
      const node = cc.instantiate(this.heroPref);
      this.myHeroBoxNode.addChild(node);
      node.setScale(-myRes.Scale, Math.abs(myRes.Scale));
      // cc.tween(node).then(cc.flipX(true)).start();
      node.getComponent(dragonBones.ArmatureDisplay).dragonAsset = myRes.Asset;
      node.getComponent(dragonBones.ArmatureDisplay).dragonAtlasAsset =
        myRes.AtlasAsset;
      node.getComponent(dragonBones.ArmatureDisplay).armatureName = myRes.Name;
      node.getComponent(dragonBones.ArmatureDisplay).playAnimation("Idle", 0);
    }
    // 属性信息
    const proparr = [
      `力量 ${hero.pow}`,
      `体力 ${hero.str}`,
      `耐力 ${hero.end}`,
      `敏捷 ${hero.agi}`,
      `精神 ${hero.men}`,
      `幸运 ${hero.luc}`,
      `魅力 ${hero.cha}`,
      `愤怒 ${hero.ang}`,
    ];
    // 技能列表
    this.skillBox.destroyAllChildren();
    const skill1 = this.heroSkillData1;
    this.appendSkills(skill1, true);
    const skill2 = this.heroSkillData2;
    this.appendSkills(skill2);
    this.heroPropNode.string = `${hero.name} + ${hero.lv}\r\n装备技能：${
      skill1.length
    } / ${hero.shape}\r\n${proparr.join("\r\n")}`;
    // 设定常用
    this.actTotopBtn.node
      .getChildByName("Background")
      .getChildByName("Label")
      .getComponent(cc.Label).string =
      hero.totop == 1 ? `取消常用英雄` : "设定为常用英雄";
  }

  appendSkills(skills: any[], selected?: boolean) {
    if (skills.length > 0) {
      for (const key in skills) {
        const skill = skills[key];
        const item = cc.instantiate(this.skillItemPref);
        item
          .getChildByName("skill2")
          .getChildByName("Background")
          .getChildByName("Label")
          .getComponent(cc.Label).string = `[${
          skill.type == 1 ? "主" : "被"
        }] ${skill.name} LV.${skill.level} +${skill.lv}\r\n${skill.remark}\r\n${
          skill.type == 2
            ? ""
            : `施法${Number(skill.needtime)}s/冷却${Number(skill.coldtime)}s`
        }`;
        if (selected) {
          item
            .getChildByName("select")
            .getComponent(cc.Toggle).isChecked = true;
          item
            .getChildByName("select")
            .getComponent(cc.Toggle).interactable = false;
        } else {
          // 添加事件
          const clickEventHandler = new cc.Component.EventHandler();
          clickEventHandler.target = cc
            .find("Canvas")
            .getChildByName("my_hero_page");
          clickEventHandler.component = "MyHero";
          clickEventHandler.handler = "saveHeroSkill";
          clickEventHandler.customEventData = skill.id;
          item
            .getChildByName("select")
            .getComponent(cc.Toggle)
            .checkEvents.push(clickEventHandler);
        }
        item.parent = this.skillBox;
        // this.skillBox.addChild(item);
      }
      this.goToTop = 0.1;
    }
  }

  saveHeroSkill(event: any, skill_id: string) {
    const node: cc.Node = event.target;
    // cc.log("选择技能", node, skill_id);
    if (this.heroSkillData1.length >= this.heroData.shape) {
      node.parent.getComponent(cc.Toggle).isChecked = false;
      cc.find("Tip").getComponent("Tip").show("装备位置不足~");
      return;
    }
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content: "确定装备该技能吗？",
        confirmFn: async () => {
          try {
            await cc
              .find("Network")
              .getComponent("Network")
              .request({
                name: "herosaveSetting",
                data: { heroid: this.heroData.id, skillids: skill_id },
              });
            cc.find("Tip").getComponent("Tip").show("装备成功~");
            this.openPanel(true);
          } catch (error) {
            cc.find("Tip").getComponent("Tip").show(error);
          }
        },
        closeFn: () => {
          node.parent.getComponent(cc.Toggle).isChecked = false;
        },
      });
  }

  closePanel() {
    this.heroPanelNode.active = false;
  }

  async actTotop() {
    let top = 0;
    if (this.heroData.totop) {
      //   to cancel
      top = 0;
    } else {
      //   to top
      top = 1;
    }
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "herosetTop",
          data: { id: this.heroData.id, totop: top },
        });
      this.openPanel(true);
      this.reloadItemList(true);
      cc.find("Tip").getComponent("Tip").show("设置成功~");
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("设置失败，请重新尝试~");
    }
  }
  async actRename() {
    await cc
      .find("Modal")
      .getComponent("Modal")
      .alert({
        title: "给英雄取个新名字吧",
        inputMode: true,
        confirmFn: async (content: string) => {
          try {
            await cc
              .find("Network")
              .getComponent("Network")
              .request({
                name: "herorename",
                data: { id: this.heroData.id, name: content },
              });
            cc.find("Tip").getComponent("Tip").show("重命名成功~");
            this.openPanel(true);
            this.reloadItemList(true);
          } catch (error) {
            cc.find("Tip").getComponent("Tip").show("重命名失败~");
          }
        },
      });
  }
  //   遣散
  async actBuyQiang() {
    await cc
      .find("Modal")
      .getComponent("Modal")
      .alert({
        title: "慎重提示！",
        content: "英雄遣散后不可恢复，请慎重操作！请慎重操作！请慎重操作！",
        confirmFn: async (content: string) => {
          try {
            await cc
              .find("Network")
              .getComponent("Network")
              .request({
                name: "heroqiansan",
                data: { id: this.heroData.id },
              });
            await this.reloadItemList(true);
            cc.find("Tip")
              .getComponent("Tip")
              .show("青山不改绿水长流，后会有期~");
            this.closePanel();
            await cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
          } catch (error) {
            cc.find("Tip").getComponent("Tip").show("遣散失败~");
          }
        },
      });
  }
  async actChai() {
    await cc
      .find("Modal")
      .getComponent("Modal")
      .alert({
        content: "是否拆卸该英雄的全部技能",
        confirmFn: async () => {
          try {
            await cc
              .find("Network")
              .getComponent("Network")
              .request({
                name: "herodownall",
                data: { id: this.activeItem.id },
              });
            cc.find("Tip").getComponent("Tip").show("拆卸成功~");
            this.openPanel(true);
            this.reloadItemList(true);
          } catch (error) {
            //   cc.find("Tip").getComponent("Tip").show("拆卸失败~");
          }
        },
      });
  }
  async actUseLuck(event: any, ItemId: string) {
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "itemuse",
          data: { id: Number(ItemId) },
        });
      cc.find("Tip").getComponent("Tip").show("祝福状态已加持~");
      await cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
      this.openPanel(true);
      this.reloadItemList(true);
    } catch (error) {
      //   cc.find("Tip").getComponent("Tip").show("祝福失败~");
    }
  }
  async actUseQiang() {
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "heroqlvup",
          data: { id: Number(this.activeItem.id) },
        });
      //   cc.find("Tip").getComponent("Tip").show("强化成功~");
      await cc.find("Canvas").getComponent("Main").reloadUserInfo(true);
      this.openPanel(true);
      this.reloadItemList(true);
    } catch (error) {
      //   cc.find("Tip").getComponent("Tip").show("强化失败~");
    }
  }

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
