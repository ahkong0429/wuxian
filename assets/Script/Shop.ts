// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopClass extends cc.Component {
  @property(cc.Node)
  shopPageNode: cc.Node = null;

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
  @property(cc.EditBox)
  numberNode: cc.EditBox = null;

  // 总价
  @property(cc.Label)
  totalPriceNode: cc.Label = null;

  // 当前商品
  activeItem: any = null;
  activeKey: number = 0;
  nowNode: cc.Node = null;
  lastNode: cc.Node = null;

  // @property
  // text: string = "hello";

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.shopPageNode.getComponent(cc.Widget).bottom = cc.winSize.height;
  }

  async open() {
    this.shopPageNode.active = true;
    cc.tween(this.shopPageNode)
      .to(0.18, { y: 0 }, { easing: "quartIn" })
      .start();
    await this.reloadItemList();
  }

  async reloadItemList() {
    try {
      const res = await cc.find("Network").getComponent("Network").request({
        name: "itemlist",
      });
      this.list = res;
      this.itemBoxNode.destroyAllChildren();
      this.nodeList = [];
      this.renderItemList();
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("商城道具获取失败，请重新尝试~");
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
        clickEventHandler.target = cc
          .find("Canvas")
          .getChildByName("shop_page");
        clickEventHandler.component = "Shop";
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
    this.remarkNode.string = `商品名称：${item.name}（剩余${item.num}个）${
      item.numLimit > 0 ? `每人限购${item.numLimit}个` : ""
    }\r\n单价：${item.price}${item.payType == 1 ? "积分" : "金钱"}\r\n描述：${
      item.introduce
    }`;
    let num = Number(this.numberNode.string);
    if (num <= 0) {
      num = 1;
      this.numberNode.string = "1";
    }
    this.totalPriceNode.string = `总价：${(
      item.price * Number(this.numberNode.string)
    ).toString()}${item.payType == 1 ? "积分" : "金钱"}`;
    this.lastNode = this.nodeList[this.activeKey];
  }

  close() {
    this.shopPageNode.y = cc.winSize.height;
    this.itemBoxNode.destroyAllChildren();
    this.lastNode = null;
    this.shopPageNode.active = false;
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
    let num = Number(this.numberNode.string);
    if (num <= 0) {
      num = 1;
      this.numberNode.string = "1";
    }
    const total = this.activeItem.price * num;
    const tips = `购买 [ ${
      this.activeItem.name
    } ] * ${num} \r\n总共需要${total}${
      this.activeItem.payType == 1 ? "积分" : "金钱"
    }`;
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content: tips,
        confirmFn: async () => {
          try {
            await cc
              .find("Network")
              .getComponent("Network")
              .request({
                name: "itembuy",
                data: { id: this.activeItem.id, num: num },
              });
            await this.reloadItemList();
            await cc.find("Canvas").getComponent("Main").reloadUserInfo();
            cc.find("Tip").getComponent("Tip").show("购买成功~");
          } catch (error) {}
        },
      });
  }

  // start() {}

  // update (dt) {}
}
