import { _decorator, Component, Node, RigidBody2D, Vec2, math, Vec3 } from 'cc';
import { Player } from './Player';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    @property({type:Node})
    private player:Node

    @property
    private baseSpeed:number = 1;

    public state:string = "idle";
    private wanderTarget:Vec2 = new Vec2();
    private timer:number = 0;
    private isChasing:boolean = false;

    start() {

    }

    update(deltaTime: number) {
        let playerDist = Vec3.distance(this.node.position, this.player.position);
        let rb = this.getComponent(RigidBody2D);
        let finalVelocity = new Vec2();

        if (this.player.getComponent(Player).state == "move" && playerDist <= 150) {
            this.isChasing = true;
            let dir = new Vec2();
            dir.x = this.player.position.x - this.node.position.x;
            dir.y = this.player.position.y - this.node.position.y;
            dir.normalize().multiplyScalar(this.baseSpeed);
            finalVelocity = dir;
            // let deltaPos = this.player.position.clone().subtract(this.node.position);
            // let hypotenuse = deltaPos.length();
            // let speedX = deltaPos.x/hypotenuse;
            // let speedY = deltaPos.y/hypotenuse;
            // let speedVector = new Vec2(speedX, speedY);
            // speedVector = speedVector.multiplyScalar(this.baseSpeed);
            // this.node.getComponent(RigidBody2D).linearVelocity = speedVector;
        } else {
            this.isChasing = false;
            this.timer -= deltaTime;

            if (this.timer <= 0) {
                this.wanderTarget.x = (Math.random() * 500) - 250;
                this.wanderTarget.y = (Math.random() * 500) - 250;
                this.timer = 6;
            }

            let dir = new Vec2();
            dir.x = this.wanderTarget.x - this.node.position.x;
            dir.y = this.wanderTarget.y - this.node.position.y;
            dir.normalize().multiplyScalar(this.baseSpeed);
            finalVelocity = dir;
            // let direction:Vec3 = new Vec3();
            // direction.x = Math.random() * 2 - 1;
            // direction.y = Math.random() * 2 - 1;
            // direction.z = 0;

            // let deltaPos = direction.clone().subtract(this.node.position);
            // let hypotenuse = deltaPos.length();
            // let speedX = deltaPos.x/hypotenuse;
            // let speedY = deltaPos.y/hypotenuse;
            // let speedVector = new Vec2(speedX, speedY);
            // speedVector = speedVector.multiplyScalar(this.baseSpeed);
            // this.node.getComponent(RigidBody2D).linearVelocity = speedVector;
        }

        if (this.state == "die") {
            this.node.destroy();
        }

        rb.linearVelocity = finalVelocity;
        //this.node.translate(deltaPos.multiplyScalar(deltaTime));
    }
}


