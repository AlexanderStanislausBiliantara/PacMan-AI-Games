import {
    _decorator,
    Component,
    Node,
    RigidBody2D,
    Vec2,
    Vec3,
    Sprite,
    Color,
    view,
    Collider2D,
} from 'cc'
import { Player } from './Player'
const { ccclass, property } = _decorator

@ccclass('Enemy')
export class Enemy extends Component {
    @property({ type: Node })
    private player: Node

    @property
    private baseSpeed: number = 1

    @property
    public defaultCollisionGroup: number = 1

    @property
    public spawningCollisionGroup: number = 4

    public state: string = 'idle'
    private wanderTarget: Vec2 = new Vec2()
    private timer: number = 0
    private isChasing: boolean = false
    private vulnerableTimer: number = 0
    private startPos: Vec3 = new Vec3()
    private originalColor: Color = new Color(255, 255, 255, 255)

    start() {
        this.startPos = this.node.position.clone()
        const sprite = this.getComponent(Sprite)
        if (sprite) {
            this.originalColor = sprite.color.clone()
        }
    }

    public initSpawn(player: Node) {
        this.player = player
        this.state = 'entering'

        const collider = this.getComponent(Collider2D)
        if (collider) {
            collider.group = this.spawningCollisionGroup
        }
    }

    setVulnerable(active: boolean) {
        const sprite = this.getComponent(Sprite)
        if (active) {
            this.state = 'vulnerable'
            this.vulnerableTimer = 10
            if (sprite) {
                sprite.color = new Color(0, 0, 255, 255)
            }
        } else {
            this.state = 'idle'
            if (sprite) {
                sprite.color = this.originalColor
            }
        }
    }

    respawn() {
        this.node.setPosition(this.startPos)
        this.setVulnerable(false)

        const rb = this.getComponent(RigidBody2D)
        if (rb) rb.linearVelocity = Vec2.ZERO
    }

    update(deltaTime: number) {
        if (this.state == 'vulnerable') {
            this.vulnerableTimer -= deltaTime
            if (this.vulnerableTimer <= 0) {
                this.setVulnerable(false)
            }
        }

        if (this.state === 'entering') {
            this.handleEnteringState()
            return
        }

        if (!this.player || !this.player.isValid) return

        let playerDist = Vec3.distance(this.node.position, this.player.position)
        let rb = this.getComponent(RigidBody2D)
        if (!rb) return

        let finalVelocity = new Vec2()

        if (this.state == 'vulnerable') {
            let dir = new Vec2()
            dir.x = this.node.position.x - this.player.position.x
            dir.y = this.node.position.y - this.player.position.y
            dir.normalize().multiplyScalar(this.baseSpeed * 0.5)
            finalVelocity = dir
        } else if (
            this.player.getComponent(Player) &&
            this.player.getComponent(Player).state == 'move' &&
            playerDist <= 200
        ) {
            this.isChasing = true
            let dir = new Vec2()
            dir.x = this.player.position.x - this.node.position.x
            dir.y = this.player.position.y - this.node.position.y
            dir.normalize().multiplyScalar(this.baseSpeed)
            finalVelocity = dir
        } else {
            this.isChasing = false
            this.timer -= deltaTime

            if (this.timer <= 0) {
                this.wanderTarget.x = Math.random() * 500 - 250
                this.wanderTarget.y = Math.random() * 500 - 250
                this.timer = 6
            }

            let dir = new Vec2()
            dir.x = this.wanderTarget.x - this.node.position.x
            dir.y = this.wanderTarget.y - this.node.position.y
            dir.normalize().multiplyScalar(this.baseSpeed)
            finalVelocity = dir
        }

        rb.linearVelocity = finalVelocity
    }

    private handleEnteringState() {
        const rb = this.getComponent(RigidBody2D)
        if (!rb) return

        let center = new Vec2(0, 0)
        let currentPos = new Vec2(this.node.position.x, this.node.position.y)
        let dir = center
            .subtract(currentPos)
            .normalize()
            .multiplyScalar(this.baseSpeed)
        rb.linearVelocity = dir

        let visibleSize = view.getVisibleSize()
        let borderX = (visibleSize.width - 100) / 2
        let borderY = (visibleSize.height - 100) / 2

        if (
            Math.abs(this.node.position.x) < borderX &&
            Math.abs(this.node.position.y) < borderY
        ) {
            this.state = 'idle'
            const collider = this.getComponent(Collider2D)
            if (collider) {
                collider.group = this.defaultCollisionGroup
            }
        }
    }
}
