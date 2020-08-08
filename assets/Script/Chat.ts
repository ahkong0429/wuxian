// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChatClass extends cc.Component {
  @property(cc.Node)
  subPageNode: cc.Node = null;

  @property(cc.Prefab)
  msgPref: cc.Prefab = null;

  @property(cc.EditBox)
  editNode: cc.EditBox = null;

  @property(cc.Node)
  msgBoxNode: cc.Node = null;

  //   消息列表
  //   list: any[] = [];
  //   滚动条
  @property(cc.ScrollView)
  scroll: cc.ScrollView = null;

  client: SocketIOClient.Socket = null;

  init: boolean = false;

  goToBottom: number = 0;

  onLoad() {}

  async open() {
    if (!cc.find("Socket").getComponent("Socket").getClient()) {
      cc.find("Tip").getComponent("Tip").show("服务器连接中，请稍后再试~");
      return;
    }
    this.subPageNode.active = true;
    this.getRecentChat();
  }

  render(list: any[]) {
    // cc.log("消息", list);
    for (const key in list) {
      const msg = list[key];
      const node = cc.instantiate(this.msgPref);
      node.active = true;
      node.getComponent(
        cc.Label
      ).string = `${msg.time} ${msg.name}\r\n${msg.msg}`;
      this.msgBoxNode.addChild(node);
    }
  }

  close() {
    this.subPageNode.active = false;
  }

  chatSend() {
    function trim(str: string) {
      const reg = /^\s+|\s+$/g;
      return str.replace(reg, "");
    }
    if (trim(this.editNode.string) == "") {
      return;
    }
    cc.find("Socket")
      .getComponent("Socket")
      .getClient()
      .emit("chatSend", this.editNode.string);
    this.editNode.string = "";
  }

  getRecentChat() {
    if (!this.init) {
      cc.find("Socket")
        .getComponent("Socket")
        .getClient()
        .emit("getRecentChat");
      this.init = true;
    }
  }

  goToBot() {
    this.goToBottom = 0.1;
  }

  update(dt: any) {
    if (this.goToBottom > 0) {
      this.goToBottom -= dt;
      if (this.goToBottom <= 0) {
        this.scroll.scrollToBottom(0.1);
      }
    }
  }
}
