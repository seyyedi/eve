import util from 'gulp-util';

export class Log {
    constructor(name){
        this.name = name;
    }

    info(text) {
        util.log(text);
    }

    error(text) {

    }
}

let log = new Log();
export default log;
