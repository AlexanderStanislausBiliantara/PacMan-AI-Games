import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Heart')
export class Heart extends Component {

    private heartLeft: Node;
    private heartMid: Node;
    private heartRight: Node;
    private lives: number = 3;
    start() {
        this.heartLeft = this.node.getChildByName("heartLeft");
        this.heartMid = this.node.getChildByName("heartMid");
        this.heartRight = this.node.getChildByName("heartRight");
    }

    update(deltaTime: number) {

    }

    loseLife() {
        if (this.lives > 0) {
            this.lives--
        }
        if (this.lives == 0) {
            this.heartLeft.active = false;
        } else if (this.lives == 1) {
            this.heartMid.active = false;
        } else if (this.lives == 2) {
            this.heartRight.active = false;
        }
    }
}


