// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class BagClass extends cc.Component {
  @property(cc.Node)
  bagPageNode: cc.Node = null;

  // 道具列表
  list: any[] = [];
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

  // @property
  // text: string = "hello";

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.bagPageNode.getComponent(cc.Widget).bottom = cc.winSize.height;
  }

  async open() {
    this.bagPageNode.active = true;
    cc.tween(this.bagPageNode)
      .to(0.18, { y: 0 }, { easing: "quartIn" })
      .start();
    await this.reloadItemList();
  }

  async reloadItemList() {
    try {
      const res = await cc.find("Network").getComponent("Network").request({
        name: "itemmine",
      });
      this.list = res;
      this.itemBoxNode.destroyAllChildren();
      this.nodeList = [];
      this.renderItemList();
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("背包道具获取失败，请重新尝试~");
    }
  }

  // 渲染道具列表
  renderItemList() {
    if (this.list.length > 0) {
      for (const key in this.list) {
        const item = this.list[key];
        const itemNode = cc.instantiate(this.itemPrefab);
        itemNode.parent = this.itemBoxNode;
        itemNode
          .getChildByName("btn")
          .getChildByName("icon")
          .getComponent(cc.Sprite).spriteFrame = cc
          .find("Icon")
          .getComponent("Iconmap")
          .getIconsf(item.code);
        // 添加点击事件
        const clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = cc.find("Canvas").getChildByName("bag_page");
        clickEventHandler.component = "Bag";
        clickEventHandler.handler = "chooseItem";
        clickEventHandler.customEventData = key;
        itemNode
          .getChildByName("btn")
          .getComponent(cc.Button)
          .clickEvents.push(clickEventHandler);
        itemNode.active = true;
        this.nodeList.push(itemNode);
      }
      this.chooseItem(null, this.activeKey.toString());
    }
  }

  chooseItem(event: any, index: string) {
    if (this.lastNode) {
      this.lastNode
        .getChildByName("btn")
        .getChildByName("Selected").active = false;
    }
    this.activeKey = Number(index);
    this.nodeList[this.activeKey]
      .getChildByName("btn")
      .getChildByName("Selected").active = true;
    const item = this.list[this.activeKey];
    this.activeItem = item;
    this.remarkNode.string = `商品名称：${item.name}（剩余${item.bag_num}个）\r\n描述：${item.introduce}`;
    this.lastNode = this.nodeList[this.activeKey];
  }

  close() {
    this.bagPageNode.y = cc.winSize.height;
    this.itemBoxNode.destroyAllChildren();
    this.lastNode = null;
    this.bagPageNode.active = false;
    // cc.tween(this.bagPageNode)
    //   .to(0.1, { y: cc.winSize.height })
    //   .start()
    //   .call(() => {
    //     this.itemBoxNode.destroyAllChildren();
    //     this.lastNode = null;
    //     this.bagPageNode.active = false;
    //   });
  }

  async useItem() {
    if (this.activeItem.jump && this.activeItem.jump == "hero") {
      cc.find("Tip")
        .getComponent("Tip")
        .show("请打开 [ 我的英雄 ] 界面进行操作~");
      return;
    }
    if (this.activeItem.jump && this.activeItem.jump == "skill") {
      cc.find("Tip")
        .getComponent("Tip")
        .show("请打开 [ 我的技能 ] 界面进行操作~");
      return;
    }
    try {
      await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "itemuse",
          data: { id: Number(this.activeItem.bag_itemId) },
        });
      await this.reloadItemList();
      await cc.find("Canvas").getComponent("Main").reloadUserInfo();
      cc.find("Tip").getComponent("Tip").show("使用道具成功~");
    } catch (error) {}
  }
}
