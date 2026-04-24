import {
    _decorator,
    Component,
    EventTouch,
    Input,
    input,
    Node,
    Vec3,
    Vec2,
    RigidBody2D,
    view,
    Sprite,
    Color,
    tween,
    director,
} from 'cc'
import { Enemy } from './Enemy'
import { Heart } from './Heart'
import { PowerUp } from './PowerUp'
import { GameController } from './GameController'
const { ccclass, property } = _decorator

@ccclass('Player')
export class Player extends Component {
    @property({ type: Heart })
    private heart: Heart = null

    @property(GameController)
    private gameController: GameController

    @property
    private baseSpeed: number = 3

    @property(Color)
    private powerUpColor: Color = new Color(255, 255, 0, 255)

    private originalColor: Color = new Color(255, 255, 255, 255)
    private touchPos: Vec3 = new Vec3()
    public state: string = 'idle'
    public health: number = 3
    private isPoweredUp: boolean = false
    private isInvincible: boolean = false
    private currentDir: Vec2 = new Vec2(1, 0)

    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

        this.touchPos = this.node.getWorldPosition().clone();

        const sprite = this.getComponent(Sprite);
        if (sprite) {
            this.originalColor = sprite.color.clone();
        }

        const rb = this.getComponent(RigidBody2D);
        if (rb) {
            rb.enabledContactListener = false;
        }

        this.state = 'move';
    }

    setPowerUpEffect(active: boolean) {
        this.isPoweredUp = active
        this.updateVisualEffect()
    }

    private updateVisualEffect() {
        const sprite = this.getComponent(Sprite)
        if (!sprite || this.isInvincible) return
        sprite.color = this.isPoweredUp ? this.powerUpColor : this.originalColor
    }

    takeDamage() {
        if (this.isInvincible || this.state == 'die') return

        this.health--
        if (this.heart) this.heart.loseLife()

        if (this.health <= 0) {
            this.changeState('die')
            return
        }

        this.isInvincible = true
        const sprite = this.getComponent(Sprite)
        if (sprite) {
            tween(sprite)
                .to(0.1, { color: new Color(255, 255, 255, 0) })
                .to(0.1, { color: this.originalColor })
                .union()
                .repeat(10)
                .call(() => {
                    this.isInvincible = false
                    this.updateVisualEffect()
                })
                .start()
        } else {
            this.scheduleOnce(() => {
                this.isInvincible = false
            }, 2)
        }
    }

    changeState(nextState) {
        if (nextState == 'die') {
            this.state = nextState;
            input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
            const rb = this.getComponent(RigidBody2D);
            if (rb) rb.linearVelocity = Vec2.ZERO;
        } else {
            this.state = nextState;
        }
    }

    onTouchStart(event: EventTouch) {
        if (this.state == 'die') {
            return;
        }

        if (this.gameController && this.gameController.mode === "bot") {
            return;
        }

        let uiPos = event.getUILocation();
        let width = view.getVisibleSize().width;
        let height = view.getVisibleSize().height;

        this.touchPos = new Vec3(uiPos.x - width / 2, uiPos.y - height / 2, 0);

        let deltaPos = this.touchPos.clone().subtract(this.node.position)
        if (deltaPos.length() > 0) {
            this.currentDir = new Vec2(deltaPos.x, deltaPos.y).normalize()
        }

        this.changeState('move');
    }

    update(deltaTime: number) {
        if (this.state == 'move') {
            const rb = this.getComponent(RigidBody2D);
            if (rb) {
                if (this.gameController && this.gameController.mode === "bot") {
                    let closestFood:Node = null;
                    let minDistance = Infinity;
                    const myPos = this.node.worldPosition;

                    for (let food of this.gameController.foodContainer.children) {
                        if (!food.active) {
                            continue;
                        }

                        let dist = Vec3.distance(myPos, food.worldPosition);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestFood = food;
                        }
                    }

                    if (closestFood) {
                        let targetDir = new Vec3();
                        Vec3.subtract(targetDir, closestFood.worldPosition, myPos);
                        targetDir.normalize();

                        this.currentDir.x = targetDir.x;
                        this.currentDir.y = targetDir.y;
                    }
                }

                rb.linearVelocity = this.currentDir
                    .clone()
                    .multiplyScalar(this.baseSpeed);
            }
        } else if (this.state == 'idle') {
            const rb = this.getComponent(RigidBody2D);
            if (rb) rb.linearVelocity = Vec2.ZERO;
        }

        const myPos = this.node.worldPosition;

        if (this.gameController && this.gameController.foodContainer) {
            for (let food of this.gameController.foodContainer.children) {
                if (!food.active) continue;

                if (Vec3.distance(myPos, food.worldPosition) < 40) {
                    this.gameController.onFoodEaten(food);
                }
            }
        }

        const powerUpContainer = this.gameController
            ? this.gameController.powerUpContainer ||
              this.gameController.foodContainer
            : null;

        if (powerUpContainer) {
            for (let powerUp of powerUpContainer.children) {
                if (!powerUp.active) continue;

                if (
                    powerUp.getComponent(PowerUp) ||
                    powerUp.name.toLowerCase().includes('powerup')
                ) {
                    if (Vec3.distance(myPos, powerUp.worldPosition) < 50) {
                        this.gameController.onPowerUpEaten(powerUp)
                    }
                }
            }
        }

        const scene = director.getScene();
        if (scene) {
            const enemies = scene.getComponentsInChildren(Enemy);
            for (let enemy of enemies) {
                if (!enemy.node.active) continue;

                let dist = Vec3.distance(myPos, enemy.node.worldPosition);

                if (dist < 80) {
                    if (enemy.state === 'vulnerable') {
                        this.gameController.onGhostEaten(enemy.node);
                    } else {
                        this.takeDamage();
                    }
                }
            }
        }
    }
}
