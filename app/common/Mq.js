import {throttle} from "./common.js";

class MessageQueue {

    constructor() {
        this.queue = [];
        this.starting = false;
        this.t_run = throttle(this._run, 500);
    }

    add(task) {
        this.queue.push(task);
        if (!this.starting) {
            this.starting = true;
            this.t_run();
        }
    }

    async _run() {

        /* 消费队列 */
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            try {
                await task();
            } catch (err) {
                console.log('执行异常', err);
            }
        }

        this.starting = false;

    }
}

const mq = new MessageQueue()
export default mq;