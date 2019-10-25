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
            "detail": "sha256(bytes data) returns (bytes32 result): compute the SHA-256 hash of the (tightly packed) arguments",
            "insertText": "sha256(${1:bytes})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "sha256"
        },
        {
            "detail": "ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (identity): recover the identity associated with the public key from elliptic curve signature or return zero on error",
            "insertText": "ecrecover(${1:hash}, ${2:v}, ${3:r}, ${4:s})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "ecrecover"
        },
        {
            "detail": "property_parse(string property_value, int property_type) returns(uint result);",
            "insertText": "property_parse(${1:string}, ${2:int})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_parse"
        },
        {
            "detail": "property_destroy(uint hanlder) returns(bool result);",
            "insertText": "property_destroy(${1:uint})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_destroy"
        },
        {
            "detail": "property_get_bool(uint hanlder, string path) returns(int result,bool data);",
            "insertText": "property_get_bool(${1:uint}, ${2:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_get_bool"
        },
        {
            "detail": "property_get_int(uint hanlder, string path) returns(int result,int data);",
            "insertText": "property_get_int(${1:uint}, ${2:path})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_get_int"
        },
        {
            "detail": "property_get_uint(uint hanlder, string path) returns(int result, uint data);",
            "insertText": "property_get_uint(${1:uint}, ${2:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_get_uint"
        },
        {
            "detail": "property_get_string(uint hanlder, string path) returns(int result,string m em or y);",
            "insertText": "property_get_string(${1:uint}, ${2:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_get_string"
        },
        {
            "detail": "property_get_list_count(uint hanlder, string path) returns(uint result);",
            "insertText": "property_get_list_count(${1:uint}, ${2:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_get_list_count"
        },
        {
            "detail": "property_set_bool(uint hanlder,string path, bool data) returns(bool result);",
            "insertText": "property_set_bool(${1:uint}, ${2:string}, ${3:bool})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_set_bool"
        },
        {
            "detail": "property_set_int(uint hanlder, string path, int data) returns(bool result);",
            "insertText": "property_set_int(${1:uint}, ${2:string}, ${3:int})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_set_int"
        },
        {
            "detail": "property_set_uint(uint hanlder, string path, uint data) returns(bool result);",
            "insertText": "property_set_uint(${1:uint}, ${2:string}, ${3:uint})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_set_uint"
        },
        {
            "detail": "property_set_string(uint hanlder, string path, string data) returns(bool result);",
            "insertText": "property_set_string(${1:uint}, ${2:string}, ${3:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_set_string"
        },
        {
            "detail": "property_remove(uint hanlder, string path) returns(bool result);",
            "insertText": "property_remove(${1:uint}, ${2:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_remove"
        },
        {
            "detail": "property_write(uint hanlder, int type) returns(string result);",
            "insertText": "property_write(${1:uint}, ${2:int})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "property_write"
        },
        {
            "detail": "VerifyCommitment(string name, uint index, identity to, const bytes value_enc) returns(bool result);",
            "insertText": "VerifyCommitment(${1:string}, ${2:uint}, ${3:identity}, ${4:bytes})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "VerifyCommitment"
        },
        {
            "detail": "VerifyRange(uint index, int min_value) returns(bool);",
            "insertText": "VerifyRange(${1:uint}, ${2:int})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "VerifyRange"
        },
        {
            "detail": "VerifyBalance(uint range) returns(bool);",
            "insertText": "VerifyBalance(${1:uint})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "VerifyBalance"
        },
        {
            "detail": "verify_sig_rsa(bytes msg, bytes pub, bytes sig) returns(bool result);",
            "insertText": "verify_sig_rsa(${1:bytes}, ${2:bytes}, ${3:bytes})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "verify_sig_rsa"
        },
        {
            "detail": "base64_decode(string data) returns(bool result, string memory data);",
            "insertText": "base64_decode(${1:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "base64_decode"
        },
        {
            "detail": "base64_encode(string data) returns(bool result, string memory data);",
            "insertText": "base64_encode(${1:string})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "base64_encode"
        },
        {
            "detail": "digest(bytes data, int type) returns(bool result, bytes32 data);",
            "insertText": "digest(${1:bytes}, ${2:int})",
            "insertTextFormat": 2,
            "kind": "Method",
            "label": "digest"
        }
    ];
};