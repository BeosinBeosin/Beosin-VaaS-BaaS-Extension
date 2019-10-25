export function global_():[] {
    return <any>[
        {
            "detail": 'Current block',
            "kind": "Variable",
            "label": 'block'
        },
        {
            "detail": 'Current Message',
            "kind": "Variable",
            "label": 'msg'
        },
        {
            "detail": '(uint): current block timestamp (alias for block.timestamp)',
            "kind": "Variable",
            "label": 'now'
        },
        {
            "detail": 'Current transaction',
            "kind": "Variable",
            "label": 'tx'
        },
        {
            "detail": 'ABI encoding / decoding',
            "kind": "Variable",
            "label": 'abi'
        },
    ]
}

export function block():[] {
    return <any>[
        {
            "detail": "(address): Current block miner’s address",
            "kind": "Property",
            "label": "coinbase"
        },
        {
            "detail": "(bytes32): DEPRICATED In 0.4.22 use blockhash(uint) instead. Hash of the given block - only works for 256 most recent blocks excluding current",
            "insertText": "blockhash(${1:blockNumber});",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "blockhash"
        },
        {
            "detail": "(uint): current block difficulty",
            "kind": "Property",
            "label": "difficulty"
        },
        {
            "detail": "(uint): current block gaslimit",
            "kind": "Property",
            "label": "gaslimit"
        },
        {
            "detail": "(uint): current block number",
            "kind": "Property",
            "label": "number"
        },
        {
            "detail": "(uint): current block timestamp as seconds since unix epoch",
            "kind": "Property",
            "label": "timestamp"
        }
    ]
}

export function msg():[] {
    return <any>[
        {
            "detail": "(bytes): complete calldata",
            "kind": "Property",
            "label": "data"
        },
        {
            "detail": "(uint): remaining gas DEPRICATED in 0.4.21 use gasleft()",
            "kind": "Property",
            "label": "gas"
        },
        {
            "detail": "(address): sender of the message (current call)",
            "kind": "Property",
            "label": "sender"
        },
        {
            "detail": "(bytes4): first four bytes of the calldata (i.e. function identifier)",
            "kind": "Property",
            "label": "sig"
        },
        {
            "detail": "(uint): number of wei sent with the message",
            "kind": "Property",
            "label": "value"
        }
    ]
}

export function tx():[] {
    return <any>[
        {
            "detail": "(uint): gas price of the transaction",
            "kind": "Property",
            "label": "gas"
        },
        {
            "detail": "(address): sender of the transaction (full call chain)",
            "kind": "Property",
            "label": "origin"
        }
    ]
}

export function abi():[] {
    return <any>[
        {
            "detail": "encode(..) returs (bytes): ABI-encodes the given arguments",
            "insertText": "encode(${1:arg});",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "encode"
        },
        {
            "detail": "encodePacked(..) returns (bytes): Performes packed encoding of the given arguments",
            "insertText": "encodePacked(${1:arg});",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "encodePacked"
        },
        {
            "detail": "encodeWithSelector(bytes4,...) returns (bytes): ABI-encodes the given arguments starting from the second and prepends the given four-byte selector",
            "insertText": "encodeWithSelector(${1:bytes4}, ${2:arg});",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "encodeWithSelector"
        },
        {
            "detail": "encodeWithSignature(string,...) returns (bytes): Equivalent to abi.encodeWithSelector(bytes4(keccak256(signature), ...)`",
            "insertText": "encodeWithSignature(${1:signatureString}, ${2:arg});",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "encodeWithSignature"
        }
    ];
};