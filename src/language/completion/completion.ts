import * as BaaS from "./baas/baas";
import * as ETH from "./eth/eth";

const CompletionKind = {
    functions: 'functions',
    variables: {
        global_: 'global_',
        block: 'block',
        msg: 'msg',
        tx: 'tx',
        abi: 'abi',
    },
    types: 'types'
}

export {
    CompletionKind,
    BaaS,
    ETH
}
