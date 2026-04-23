import {
    _decorator,
    CCInteger,
    Component,
    instantiate,
    Label,
    Node,
    Prefab,
    view,
} from 'cc'
import { Enemy } from './Enemy'
import { Player } from './Player'
const { ccclass, property } = _decorator

@ccclass('GameController')
export class GameController extends Component {
    @property({ type: CCInteger })
    private foodSpawnInterval: number = 2

    @property({ type: Label })
    private scoreLabel: Label

    @property({ type: CCInteger })
    private maxFood: number = 10

    @property({ type: Prefab })
    private foodPrefab: Prefab

    @property(Node)
    public foodContainer: Node

    @property({ type: Prefab })
    private powerUpPrefab: Prefab

    @property(Node)
    public powerUpContainer: Node

    @property({ type: CCInteger })
    private powerUpSpawnInterval: number = 15

    @property({ type: CCInteger })
    private maxPowerUp: number = 2

    private currFood: number = 0
    private currPowerUp: number = 0
    private score: number = 0

    start() {
        this.schedule(this.spawnFood, this.foodSpawnInterval)
        this.schedule(this.spawnPowerUp, this.powerUpSpawnInterval)
        this.updateScoreUI()
    }

    spawnFood() {
        if (this.currFood >= this.maxFood || !this.foodPrefab) return

        let food: Node = instantiate(this.foodPrefab)
        food.setParent(this.foodContainer)

        let width = view.getVisibleSize().width
        let height = view.getVisibleSize().height
        let randX = (Math.random() - 0.5) * (width - 100)
        let randY = (Math.random() - 0.5) * (height - 100)

        food.setPosition(randX, randY, 0)
        this.currFood++
    }

    onFoodEaten(foodNode: Node) {
        if (!foodNode || !foodNode.active) return

        foodNode.active = false
        foodNode.destroy()

        this.currFood--
        this.score += 10
        this.updateScoreUI()
    }

    onPowerUpEaten(powerUpNode: Node) {
        if (!powerUpNode || !powerUpNode.active) return

        powerUpNode.active = false
        powerUpNode.destroy()

        this.currPowerUp--

        const canvas = this.node.parent || this.node
        const enemies = canvas.getComponentsInChildren(Enemy)
        enemies.forEach((enemy) => {
            enemy.setVulnerable(true)
        })

        const player = canvas.getComponentInChildren(Player)
        if (player) {
            player.setPowerUpEffect(true)
            this.unschedule(this.resetPlayerEffect)
            this.scheduleOnce(this.resetPlayerEffect, 10)
        }
    }

    resetPlayerEffect() {
        const canvas = this.node.parent || this.node
        const player = canvas.getComponentInChildren(Player)
        if (player) {
            player.setPowerUpEffect(false)
        }
    }

    spawnPowerUp() {
        if (!this.powerUpPrefab || this.currPowerUp >= this.maxPowerUp) return

        let powerUp: Node = instantiate(this.powerUpPrefab)
        let container = this.powerUpContainer || this.foodContainer
        if (container) powerUp.setParent(container)

        let width = view.getVisibleSize().width
        let height = view.getVisibleSize().height
        let randX = (Math.random() - 0.5) * (width - 100)
        let randY = (Math.random() - 0.5) * (height - 100)

        powerUp.setPosition(randX, randY, 0)
        this.currPowerUp++
    }

    updateScoreUI() {
        if (this.scoreLabel) {
            this.scoreLabel.string = this.score.toString()
        }
    }

    onGhostEaten(enemyNode: Node) {
        if (!enemyNode || !enemyNode.isValid) return
        const enemy = enemyNode.getComponent(Enemy)
        if (enemy && enemy.state === 'vulnerable') {
            enemy.respawn()
            this.score += 200
            this.updateScoreUI()
        }
    }
}
