// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModalClass extends cc.Component {
  @property(cc.RichText)
  contentNode: cc.RichText = null;

  @property(cc.Label)
  titleNode: cc.Label = null;

  @property(cc.Button)
  confirmBtnNode: cc.Button = null;

  @property(cc.Button)
  cancelBtnNode: cc.Button = null;

  @property(cc.EditBox)
  editInputNode: cc.EditBox = null;

  //   @property
  //   text: string = "hello";

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    // 设置常驻节点
    cc.game.addPersistRootNode(this.node);
    this.node.active = false;
  }

  /**
   * 弹窗提示
   * @param param
   */
  alert(param: {
    content?: string;
    title?: undefined | string;
    hideClose?: undefined | boolean;
    closeText?: undefined | string;
    confirmText?: undefined | string;
    closeFn?: undefined | Function;
    confirmFn?: undefined | Function;
    inputMode?: undefined | boolean;
  }) {
    if (typeof param.title == "undefined") {
      param.title = "提  示";
    }
    if (typeof param.confirmText == "undefined") {
      param.confirmText = "确  定";
    }
    if (typeof param.closeText == "undefined") {
      param.closeText = "取  消";
    }
    if (param.inputMode) {
      this.editInputNode.node.active = true;
      this.contentNode.node.active = false;
    }
    if (typeof param.inputMode == "undefined" || !param.inputMode) {
      this.editInputNode.node.active = false;
      this.contentNode.node.active = true;
      this.contentNode.string = param.content;
    }
    this.node.active = true;
    this.titleNode.string = param.title;
    this.cancelBtnNode.node.active = !param.hideClose;
    this.cancelBtnNode.getComponentInChildren(cc.Label).string =
      param.closeText;
    this.confirmBtnNode.getComponentInChildren(cc.Label).string =
      param.confirmText;
    if (param.closeFn) {
      this.close = async () => {
        await param.closeFn();
        this.node.active = false;
      };
    } else {
      this.close = () => {
        this.node.active = false;
      };
    }
    if (param.confirmFn) {
      this.confirm = async () => {
        if (param.inputMode) {
          await param.confirmFn(this.editInputNode.string);
        } else {
          await param.confirmFn();
        }
        this.node.active = false;
      };
    } else {
      this.confirm = () => {
        this.node.active = false;
      };
    }
  }

  /**
   * 确认事件
   */
  confirm() {
    this.node.active = false;
  }

  /**
   * 关闭弹窗
   */
  close() {
    this.node.active = false;
  }

  // start () {

  // }

  // update (dt) {}
}
