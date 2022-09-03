

// Represents the global-state and global-state-delta we get back from
// AlgodClient requests, state-deltas will contain an action, state will 
// contain the type. In both cases 1 is for bytes, 2 is for ints. We use
// This to convert the array to a more friendly object 
interface StateValue {
    key: string
    value: {
        bytes: string
        uint: number
        type?: number
        action?: number
    }
}

// Generic object to hold state keys/values
interface State {
   [key: string] : string | number | Uint8Array
}

function strOrHex(v: Buffer): string {
    try{
        return v.toString('utf-8')
    } catch(e) {
        return v.toString('hex')
    }
}

// Converts an array of global-state or global-state-deltas to a more
// friendly generic object
export function decodeState(state: StateValue[], raw?:boolean): State {

    const obj = {} as State 

    // Start with empty set
    for(const stateVal of state){
        const keyBuff = Buffer.from(stateVal.key, 'base64')
        const key = raw?keyBuff.toString('hex'):strOrHex(keyBuff)
        const value = stateVal.value

        // In both global-state and state deltas, 1 is bytes and 2 is int
        const dataTypeFlag = value.action?value.action:value.type
        switch(dataTypeFlag){
            case 1:
                const valBuff = Buffer.from(value.bytes, 'base64')
                obj[key] = raw?new Uint8Array(valBuff):strOrHex(valBuff) 
                break;
            case 2:
                obj[key] = value.uint
                break;
            default: // ??
        }
    }

    return obj
} 

export type ApplicationState = State;
export type AccountState = State;