import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GREETINGS, pickGreeting } from './greetings';

describe('pickGreeting', () => {
  it('has several lines for every partner', () => {
    for (const lines of Object.values(GREETINGS)) assert.ok(lines.length >= 3);
  });

  it('picks by the random value and never runs off the end of the list', () => {
    assert.equal(pickGreeting('fern', () => 0), GREETINGS.fern[0]);
    assert.equal(pickGreeting('stark', () => 0.999999), GREETINGS.stark[GREETINGS.stark.length - 1]);
    assert.equal(pickGreeting('robot', () => 1), GREETINGS.robot[GREETINGS.robot.length - 1]);
  });

  it('greets Frieren by name where the partner knows her', () => {
    for (const partner of ['fern', 'stark', 'robot'] as const) {
      assert.ok(GREETINGS[partner].every((line) => /Frieren/.test(line)));
    }
  });
});
