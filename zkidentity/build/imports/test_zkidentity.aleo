import zkidentity.aleo;
program test_zkidentity.aleo;

struct Credential:
    attribute as u64;
    signature_r as scalar;
    signature_s as scalar;

function test_age_verification:
    output true as boolean.private;

constructor:
    assert.eq edition 0u16;
