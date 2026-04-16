import { _decorator, Component, EventTouch, Input, input, Node, Vec3, Vec2, RigidBody2D, Collider, Contact2DType, Collider2D, IPhysics2DContact } from 'cc';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {

    @property
    private baseSpeed:number = 3;

    private touchPos:Vec3 = new Vec3();
    public state:string = "idle";
    private health:number = 3;

    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        this.touchPos = this.node.getWorldPosition().clone();

        this.node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
    }

    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.getComponent(Enemy)) {
            this.health--;
            if (this.health <= 0) {
                this.changeState("die");
            }
        }
    }

    changeState(nextState) {
        if (nextState == "die") {
            this.state = nextState;
            return;
        } else {
            if (this.state == "idle") {
                if (nextState == "move") {
                    this.state = nextState;
                }
            } else if (this.state == "move") {
                if (nextState == "idle") {
                    this.state = nextState;
                }
            }
        }
    }

    onTouchStart(event:EventTouch) {
        this.touchPos = new Vec3(event.getUILocation().x, event.getUILocation().y, 0);
        this.changeState("move");
    }

    onTouchEnd(event:EventTouch) {
        this.touchPos = new Vec3(event.getUILocation().x, event.getUILocation().y, 0);
        this.changeState("idle");
    }

    update(deltaTime: number) {
        if (this.state == "move") {
            let deltaPos = this.touchPos.clone().subtract(this.node.getWorldPosition());
            let hypotenuse = deltaPos.length();
            let speedX = deltaPos.x/hypotenuse;
            let speedY = deltaPos.y/hypotenuse;
            let speedVector = new Vec2(speedX, speedY);
            speedVector = speedVector.multiplyScalar(this.baseSpeed);
            this.node.getComponent(RigidBody2D).linearVelocity = speedVector;
        }
    }
}


