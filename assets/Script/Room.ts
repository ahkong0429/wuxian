// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomClass extends cc.Component {
  @property(cc.Node)
  roomPageNode: cc.Node = null;

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

  @property(cc.Label)
  readmeNode: cc.Label = null;

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

  //   当前房间号
  roomCode: string = null;

  // 滚动条
  @property(cc.ScrollView)
  scrollNode: cc.ScrollView = null;

  // 准备按钮
  @property(cc.Button)
  readyButton: cc.Button = null;

  roomInfo: any = null;

  // @property
  // text: string = "hello";

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.roomPageNode.getComponent(cc.Widget).bottom = -cc.winSize.height;
  }

  async open(roomCode?: string) {
    this.setRoomCode(roomCode);
    this.roomPageNode.active = true;
    // 加入到房间
    cc.find("Socket")
      .getComponent("Socket")
      .getClient()
      .emit("joinroom", this.roomCode);
    cc.tween(this.roomPageNode)
      .to(0.18, { y: 0 }, { easing: "quartIn" })
      .start();
    // 关闭副本 匹配
    cc.find("Canvas")
      .getChildByName("fuben_page")
      .getComponent("Fuben")
      .close();
    cc.find("Canvas")
      .getChildByName("match_page")
      .getComponent("Match")
      .close();
    await this.reloadItemList();
    try {
      cc.find("Canvas/player_guide/mask").getComponent("Guide").nextStep();
    } catch (error) {
      cc.log(error);
    }
  }

  async reloadItemList() {
    try {
      const res = await cc
        .find("Network")
        .getComponent("Network")
        .request({
          name: "roominfo",
          data: {
            code: this.roomCode,
          },
        });
      this.roomInfo = res;
      this.updateLayout();
    } catch (error) {
      cc.log(error);
      cc.find("Tip").getComponent("Tip").show("获取房间数据失败，请重新尝试~");
    }
    try {
      const res = await cc.find("Network").getComponent("Network").request({
        name: "heromylist",
      });
      this.list = res;
      this.itemBoxNode.destroyAllChildren();
      this.nodeList = [];
      this.renderItemList();
    } catch (error) {
      cc.find("Tip").getComponent("Tip").show("获取玩家英雄失败，请重新尝试~");
    }
  }

  updateLayout() {
    const playerStatusMap = {
      1: "未进入",
      2: "准备中",
      3: "已准备",
      4: "战斗中",
    };
    // 敌方状态
    const emyStatusTxt =
      this.roomInfo.playerIndex == 0
        ? playerStatusMap[this.roomInfo.bluestatus]
        : playerStatusMap[this.roomInfo.redstatus];
    //  我方
    // const myStatus = res.playerIndex == 0 ? res.redstatus : res.bluestatus;
    //   房间信息
    this.readmeNode.string = `房间名称：${this.roomInfo.name}\r\n房间编号：${
      this.roomInfo.code
    }\r\n对方状态：${
      this.roomInfo.playerIndex == 0
        ? this.roomInfo.bluestatus > 1
          ? this.roomInfo.bluePlayer.nickname
          : ""
        : this.roomInfo.redPlayer.nickname
    } ( ${emyStatusTxt} )\r\n己方状态：${
      this.roomInfo.heroSelected
        ? `已选择英雄 [ ${this.roomInfo.selectedHeroName} ]`
        : "选择英雄中"
    }`;
    // 是否已准备 准备按钮禁用
    this.readyButton.getComponent(cc.Button).interactable =
      this.roomInfo.playerReadyStatus == 1 ? false : true;
    this.readyButton.node.active =
      this.roomInfo.playerReadyStatus == 1 ? false : true;
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
          .getIconsf(item.hero_race); //种族+性别决定形象
        // 添加点击事件
        const clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = cc
          .find("Canvas")
          .getChildByName("room_page");
        clickEventHandler.component = "Room";
        clickEventHandler.handler = "chooseItem";
        clickEventHandler.customEventData = key;
        itemNode
          .getChildByName("btn")
          .getComponent(cc.Button)
          .clickEvents.push(clickEventHandler);
        itemNode.active = true;
        this.nodeList.push(itemNode);
      }
      // 滚动条默认置顶
      this.scrollNode.getComponent(cc.ScrollView).scrollToTop(0.1);
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
    this.remarkNode.string = `英雄名称：${item.hero_name}\r\n技能数量：${item.skillCount}`;
    this.lastNode = this.nodeList[this.activeKey];
  }

  close() {
    this.roomPageNode.y = -cc.winSize.height;
    this.itemBoxNode.destroyAllChildren();
    this.lastNode = null;
    this.roomPageNode.active = false;
    this.roomInfo = null;
    this.roomCode = "";
    // cc.tween(this.roomPageNode)
    //   .to(0.1, { y: -cc.winSize.height })
    //   .start()
    //   .call(() => {
    //     this.itemBoxNode.destroyAllChildren();
    //     this.lastNode = null;
    //     this.roomPageNode.active = false;
    //     this.reset();
    //   });
  }

  leave() {
    cc.find("Modal")
      .getComponent("Modal")
      .alert({
        content: "确定要离开当前房间吗？",
        confirmFn: async () => {
          if (this.roomInfo.playerIndex == 0) {
            cc.find("Socket")
              .getComponent("Socket")
              .getClient()
              .emit("closeRoom", this.roomCode);
          } else {
            cc.find("Socket")
              .getComponent("Socket")
              .getClient()
              .emit("leaveRoom", this.roomCode);
          }
        },
      });
  }

  async useItem() {
    try {
      // 发起准备请求
      if (this.activeItem.skillCount == 0) {
        cc.find("Tip")
          .getComponent("Tip")
          .show("该英雄的已装备技能数( 0 )，暂时不可参与战斗~");
        return;
      }
      // cc.log("选择英雄", this.activeItem);
      cc.find("Loading").getComponent("Loading").show("setready");
      cc.find("Socket")
        .getComponent("Socket")
        .getClient()
        .emit(
          "setready",
          this.roomCode,
          this.activeItem.hero_id,
          this.roomInfo.playerIndex
        );
      cc.find("Tip").getComponent("Tip").show("玩家已准备~");
    } catch (error) {}
  }

  setRoomCode(code: string) {
    if (code) {
      this.roomCode = code;
    }
  }

  reset() {
    this.readmeNode.string = ``;
    this.remarkNode.string = ``;
  }
}
