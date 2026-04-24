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

    @property({ type: Label })
    private gameOverLabel: Label

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

    @property({ type: [Prefab] })
    private ghostPrefabs: Prefab[] = []

    @property(Node)
    public ghostContainer: Node

    @property({ type: CCInteger })
    private ghostSpawnInterval: number = 5

    @property({ type: CCInteger })
    private maxGhosts: number = 4

    private currFood: number = 0
    private currPowerUp: number = 0
    private currGhosts: number = 0
    private score: number = 0

    start() {
        this.gameOverLabel.onDisable();
        this.schedule(this.spawnFood, this.foodSpawnInterval)
        this.schedule(this.spawnPowerUp, this.powerUpSpawnInterval)
        this.schedule(this.spawnGhost, this.ghostSpawnInterval)
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

    spawnGhost() {
        if (this.ghostPrefabs.length === 0 || this.currGhosts >= this.maxGhosts)
            return

        let randomIndex = Math.floor(Math.random() * this.ghostPrefabs.length)
        let ghostPrefab = this.ghostPrefabs[randomIndex]

        let ghost: Node = instantiate(ghostPrefab)
        let container = this.ghostContainer || this.node.parent || this.node
        ghost.setParent(container)

        let visibleSize = view.getVisibleSize()
        let spawnDist = 100

        let side = Math.floor(Math.random() * 4)
        let spawnX = 0
        let spawnY = 0

        switch (side) {
            case 0: // Atas
                spawnX = (Math.random() - 0.5) * visibleSize.width
                spawnY = visibleSize.height / 2 + spawnDist
                break
            case 1: // Bawah
                spawnX = (Math.random() - 0.5) * visibleSize.width
                spawnY = -visibleSize.height / 2 - spawnDist
                break
            case 2: // Kiri
                spawnX = -visibleSize.width / 2 - spawnDist
                spawnY = (Math.random() - 0.5) * visibleSize.height
                break
            case 3: // Kanan
                spawnX = visibleSize.width / 2 + spawnDist
                spawnY = (Math.random() - 0.5) * visibleSize.height
                break
        }

        ghost.setPosition(spawnX, spawnY, 0)

        const enemyComp = ghost.getComponent(Enemy)
        if (enemyComp) {
            const canvas = this.node.parent || this.node
            const player = canvas.getComponentInChildren(Player)
            enemyComp.initSpawn(player ? player.node : null)
        }

        this.currGhosts++
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
            enemyNode.active = false
            enemyNode.destroy()
            this.currGhosts--

            this.score += 200
            this.updateScoreUI()
        }
    }

    gameOver() {
        if (this.gameOverLabel) {
            this.gameOverLabel.onEnable();
        }


    }
}
