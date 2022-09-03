import type algosdk from 'algosdk'

const LOGIC_ERROR = /TransactionPool.Remember: transaction ([A-Z0-9]+): logic eval error: (.*). Details: pc=([0-9]+), opcodes=.*/

interface LogicErrorDetails {
    txId: string
    pc: number
    msg: string
}

export function parseLogicError(errMsg: string): LogicErrorDetails {
    const res = LOGIC_ERROR.exec(errMsg)
    if(res === null || res.length<=4) return {} as LogicErrorDetails

    return {
        txId: res[1],
        msg: res[2],
        pc: parseInt(res[3]?res[3]:"0"),
    } as LogicErrorDetails
}

export class LogicError extends Error {
    led: LogicErrorDetails;
    program: string[];
    lines: number = 5;
    teal_line: number=0;
    override stack?: string;

    constructor(led: LogicErrorDetails, program: string[], map: algosdk.SourceMap){
        super()
        this.led = led
        this.program = program

        const line = map.getLineForPc(led.pc)
        this.teal_line = line === undefined?0:line

        this.message = `Logic Exception at line ${line}`

        if(this.teal_line>0){

            const start = this.teal_line>this.lines?this.teal_line-this.lines:0
            const stop = program.length>this.teal_line+this.lines?this.teal_line+this.lines:program.length

            const stack_lines = program.slice(start,stop)

            stack_lines[stack_lines.length/2] += " <--- Error"

            this.stack = stack_lines.join("\n")
        }
    }

}