import { _decorator, Component, EventTouch, Input, input, Node, Vec3, Vec2, RigidBody2D, Collider, Contact2DType, Collider2D, IPhysics2DContact, Label, view } from 'cc';
import { Enemy } from './Enemy';
import { Heart } from './Heart';
import { Food } from './Food';
import { GameController } from './GameController';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {


    @property({ type: Heart })
    private heart: Heart = null;

    @property(GameController)
    private gameController: GameController;

    @property
    private baseSpeed: number = 3;

    private touchPos: Vec3 = new Vec3();
    public state: string = "idle";
    public health: number = 3;


    start() {
        //for clicking and dragging input
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);

        this.touchPos = this.node.getWorldPosition().clone();

        this.node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);

        //set score

    }


    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.getComponent(Enemy)) {
            if (otherCollider.node.getComponent(Enemy).state == "vulnerable") {
                //TODO: Kill enemy then respawn
                //GameController.enemyEaten();
            } else {
                this.health--;
                this.heart.loseLife();
                //TODO: pacman respawn code here

                if (this.health <= 0) {
                    this.changeState("die");
                }
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

    //click and drag to move
    onTouchStart(event: EventTouch) {
        let uiPos = event.getUILocation();

        let width = view.getVisibleSize().width;
        let height = view.getVisibleSize().height;

        this.touchPos = new Vec3(
            uiPos.x - width / 2,
            uiPos.y - height / 2,
            0
        );

        this.changeState("move");
    }

    //after finished dragging, reset back to idle
    onTouchEnd(event: EventTouch) {
        this.touchPos = new Vec3(event.getUILocation().x, event.getUILocation().y, 0);
        this.changeState("idle");
    }





    update(deltaTime: number) {
        if (this.state == "move") {
            let deltaPos = this.touchPos.clone().subtract(this.node.position);
            let hypotenuse = deltaPos.length();
            let speedX = deltaPos.x / hypotenuse;
            let speedY = deltaPos.y / hypotenuse;
            let speedVector = new Vec2(speedX, speedY);
            speedVector = speedVector.multiplyScalar(this.baseSpeed);
            this.node.getComponent(RigidBody2D).linearVelocity = speedVector;
        }

        for (let food of this.gameController.foodContainer.children) {
            if (!food.active) continue;

            let dist = Vec3.distance(this.node.position, food.position);

            if (dist < 30) {
                food.active = false; // prevent multiple triggers
                this.gameController.onFoodEaten(food);
            }
        }
    }
}
