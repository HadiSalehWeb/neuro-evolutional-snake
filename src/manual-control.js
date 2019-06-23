class ManualControl extends Brain {
    static lastDirection = Direction.up
    constructor() {
        super();
        if (!window.onkeydown)
            window.onkeydown = function (ev) {
                switch (ev.key) {
                    case 'ArrowUp':
                        ManualControl.lastDirection = Direction.up;
                        break;
                    case 'ArrowRight':
                        ManualControl.lastDirection = Direction.right;
                        break;
                    case 'ArrowLeft':
                        ManualControl.lastDirection = Direction.left;
                        break;
                    case 'ArrowDown':
                        ManualControl.lastDirection = Direction.down;
                        break;
                    default: break;
                }
            };
    }
    nextDecision(_, snake) {
        if (ManualControl.lastDirection.equals(snake.direction) || ManualControl.lastDirection.equals(snake.direction.reverse()))
            return Decision.None;
        else if (snake.direction.rotateClockwise().equals(ManualControl.lastDirection))
            return Decision.RotateClockwise;
        else return Decision.RotateCounterClockwise;
    }
}