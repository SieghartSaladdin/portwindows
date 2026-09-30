import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRobotState, mouthOpenness, stepRobot, type RobotInput } from './robotRenderer';

const baseInput: RobotInput = {
  vx: 0,
  vy: 0,
  grounded: true,
  look: null,
  talkChar: null,
  thinking: false,
  active: false,
  u: 0.5,
};

function run(input: Partial<RobotInput>, seconds: number) {
  const state = createRobotState();
  const merged = { ...baseInput, ...input };
  for (let i = 0; i < seconds * 60; i++) stepRobot(state, merged, 1 / 60);
  return state;
}

describe('mouthOpenness', () => {
  it('opens wide on vowels, narrow on consonants, shut on spaces', () => {
    assert.equal(mouthOpenness('a'), 1);
    assert.equal(mouthOpenness('E'), 1);
    assert.equal(mouthOpenness('k'), 0.4);
    assert.equal(mouthOpenness(' '), 0.05);
    assert.equal(mouthOpenness('.'), 0.05);
    assert.equal(mouthOpenness(null), 0);
    assert.equal(mouthOpenness(''), 0);
  });
});

describe('stepRobot', () => {
  it('runs the walk cycle only while moving on the floor', () => {
    const walking = run({ vx: 50 }, 1);
    assert.ok(walking.ph > 0);
    assert.ok(walking.amp > 0.9);

    const standing = run({ vx: 0 }, 1);
    assert.equal(standing.ph, 0);
    assert.ok(standing.amp < 0.01);
  });

  it('turns to face the direction of travel, in both directions', () => {
    const left = run({ vx: -60 }, 1);
    assert.ok(left.fd < -0.9);
    const right = run({ vx: 60 }, 1);
    assert.ok(right.fd > 0.9);
  });

  it('faces the cursor when standing still', () => {
    const state = run({ look: { x: -200, y: 0 } }, 1);
    assert.ok(state.fd < -0.9);
  });

  it('lights the thrusters and tucks the legs when airborne', () => {
    const flying = run({ grounded: false, vx: 60 }, 1);
    assert.ok(flying.fl > 0.9);
    assert.ok(flying.amp < 0.01);
    assert.ok(flying.particles.length > 0);
  });

  it('keeps the thrusters off on the floor', () => {
    assert.ok(run({}, 1).fl < 0.01);
  });

  it('squashes when landing from the air', () => {
    const state = createRobotState();
    stepRobot(state, { ...baseInput, grounded: false, vy: 200 }, 1 / 60);
    stepRobot(state, { ...baseInput, grounded: true, vy: 200 }, 1 / 60);
    assert.ok(state.sv > 1);
  });

  it('opens the mouth while a vowel is typed and closes it afterward', () => {
    const talking = run({ talkChar: 'a' }, 1);
    assert.ok(talking.mouth > 0.9);
    const state = createRobotState();
    for (let i = 0; i < 60; i++) stepRobot(state, { ...baseInput, talkChar: 'a' }, 1 / 60);
    for (let i = 0; i < 60; i++) stepRobot(state, baseInput, 1 / 60);
    assert.ok(state.mouth < 0.05);
  });
});
