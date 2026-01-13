program zkidentity.aleo;

struct Credential:
    attribute as u64;
    signature_r as scalar;
    signature_s as scalar;

function verify_age_over_threshold:
    input r0 as Credential.private;
    input r1 as address.private;
    input r2 as u64.private;
    gte r0.attribute r2 into r3;
    output r3 as boolean.private;

function verify_citizenship:
    input r0 as Credential.private;
    input r1 as address.private;
    is.eq r0.attribute 1u64 into r2;
    output r2 as boolean.private;

function verify_citizen_over_18:
    input r0 as Credential.private;
    input r1 as Credential.private;
    input r2 as address.private;
    gte r0.attribute 18u64 into r3;
    is.eq r1.attribute 1u64 into r4;
    and r3 r4 into r5;
    output r5 as boolean.private;

constructor:
    assert.eq edition 0u16;
