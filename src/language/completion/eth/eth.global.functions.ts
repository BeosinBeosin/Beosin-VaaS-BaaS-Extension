export function GlobalFunctions():[] {
    return <any>[
        {
            "detail": "assert(bool condition): throws if the condition is not met - to be used for internal errors.",
            "insertText": "assert(${1:condition});",
            "insertTextFormat": 2,
            "kind": "Function",
            "label": "assert"
        },
        {
            "detail": "gasleft(): returns the remaining gas",
            "insertText": "gasleft();",
            "insertTextFormat": 2,
            "kind": "Function",
            "label": "gasleft"
        },
        {
            "detail": "blockhash(uint blockNumber): hash of the given block - only works for 256 most recent, excluding current, blocks",
            "insertText": "blockhash(${1:blockNumber});",
            "insertTextFormat": 2,
            "kind": "Function",
            "label": "blockhash"
        },
        {
            "detail": "require(bool condition): reverts if the condition is not met - to be used for errors in inputs or external components.",
            "insertText": "require(${1:condition});",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "require"
        },
        {
            "detail": "require(bool condition, string message): reverts if the condition is not met - to be used for errors in inputs or external components. Also provides an error message.",
            "insertText": "require(${1:condition}, ${2:message});",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "require"
        },
        {
            "detail": "revert(): abort execution and revert state changes",
            "insertText": "revert();",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "revert"
        },
        {
            "detail": "addmod(uint x, uint y, uint k) returns (uint): compute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256",
            "insertText": "addmod(${1:x}, ${2:y}, ${3:k})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "addmod"
        },
        {
            "detail": "mulmod(uint x, uint y, uint k) returns (uint): compute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256",
            "insertText": "mulmod(${1:x}, ${2:y}, ${3:k})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "mulmod"
        },
        {
            "detail": "keccak256(...) returns (bytes32): compute the Ethereum-SHA-3 (Keccak-256) hash of the (tightly packed) arguments",
            "insertText": "keccak256(${1:x})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "keccak256"
        },
        {
            "detail": "sha256(...) returns (bytes32): compute the SHA-256 hash of the (tightly packed) arguments",
            "insertText": "sha256(${1:x})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "sha256"
        },
        {
            "detail": "sha3(...) returns (bytes32): alias to keccak256",
            "insertText": "sha3(${1:x})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "sha3"
        },
        {
            "detail": "ripemd160(...) returns (bytes20): compute RIPEMD-160 hash of the (tightly packed) arguments",
            "insertText": "ripemd160(${1:x})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "ripemd160"
        },
        {
            "detail": "ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address): recover the address associated with the public key from elliptic curve signature or return zero on error",
            "insertText": "ecrecover(${1:hash}, ${2:v}, ${3:r}, ${4:s})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "ecrecover"
        }
    ]
}