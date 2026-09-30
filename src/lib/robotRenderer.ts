// Canvas renderer for the HelperBot desktop pet.
//
// Everything is drawn in "robot units" with the origin at the feet (y = 0) and the
// antenna tip around y = -106. The caller scales the context so one unit = `u` pixels.
// The robot always faces +x locally and is mirrored when it walks or looks left.

const TAU = Math.PI * 2;

export interface RobotPalette {
  ink: string;
  paper: string;
  screen: string;
  eye: string;
  accent: string;
  /** Chest light while idle */
  glow: string;
  /** Antenna LED while idle */
  led: string;
  /** Antenna LED and chest light while chatting */
  ledActive: string;
  smoke: string;
}

export const LIGHT_PALETTE: RobotPalette = {
  ink: '#2d2a26',
  paper: '#fffdfa',
  screen: '#fef08a',
  eye: '#2d2a26',
  accent: '#bae6fd',
  glow: '#e11d48',
  led: '#facc15',
  ledActive: '#f43f5e',
  smoke: 'rgba(45,42,38,0.28)',
};

export const DARK_PALETTE: RobotPalette = {
  ink: '#6b6560',
  paper: '#202023',
  screen: '#0c0c0e',
  eye: '#38bdf8',
  accent: '#0c4a6e',
  glow: '#10b981',
  led: '#38bdf8',
  ledActive: '#f43f5e',
  smoke: 'rgba(255,255,255,0.18)',
};

interface RobotParticle {
  kind: 'smoke' | 'dust';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface RobotState {
  t: number;
  /** Walk cycle phase (radians) */
  ph: number;
  /** Walk cycle strength, 0 when standing */
  amp: number;
  /** Flight blend: 0 = on the ground, 1 = hovering with thrusters */
  fl: number;
  /** Facing, smoothed between -1 (left) and 1 (right) */
  fd: number;
  dirTarget: number;
  sq: number;
  sv: number;
  lean: number;
  leanV: number;
  ant: number;
  antV: number;
  rightArm: number;
  rightArmV: number;
  leftArm: number;
  leftArmV: number;
  mouth: number;
  lookX: number;
  lookY: number;
  blink: number;
  blinkStart: number;
  nextBlink: number;
  wasGrounded: boolean;
  smokeTimer: number;
  particles: RobotParticle[];
}

export interface RobotInput {
  /** Pixels per second, positive = right */
  vx: number;
  /** Pixels per second, positive = down */
  vy: number;
  /** True when the feet rest on the desktop floor */
  grounded: boolean;
  /** Vector in pixels from the head to the cursor, or null when the cursor is idle */
  look: { x: number; y: number } | null;
  /** The character currently being typed, or null when the robot is not speaking */
  talkChar: string | null;
  thinking: boolean;
  /** True while this robot is the active chat partner */
  active: boolean;
  /** Pixels per robot unit */
  u: number;
}

export function createRobotState(): RobotState {
  return {
    t: 0,
    ph: 0,
    amp: 0,
    fl: 0,
    fd: 1,
    dirTarget: 1,
    sq: 0,
    sv: 0,
    lean: 0,
    leanV: 0,
    ant: 0,
    antV: 0,
    rightArm: 0.7,
    rightArmV: 0,
    leftArm: 0.5,
    leftArmV: 0,
    mouth: 0,
    lookX: 0,
    lookY: 0,
    blink: 1,
    blinkStart: -1,
    nextBlink: 2,
    wasGrounded: true,
    smokeTimer: 0,
    particles: [],
  };
}

/** How wide the mouth opens for a typed character: vowels wide, consonants narrow, spaces shut. */
export function mouthOpenness(char: string | null | undefined): number {
  if (!char) return 0;
  const c = char.toLowerCase();
  if (/[aiueo]/.test(c)) return 1;
  if (/[a-z0-9]/.test(c)) return 0.4;
  return 0.05;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function approach(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * Math.min(1, dt * rate);
}

function spawnDust(s: RobotState, count: number) {
  for (let i = 0; i < count; i++) {
    s.particles.push({
      kind: 'dust',
      x: (Math.random() - 0.5) * 36,
      y: 0,
      vx: (Math.random() - 0.5) * 120,
      vy: -50 - Math.random() * 70,
      life: 0.45,
    });
  }
}

export function stepRobot(s: RobotState, input: RobotInput, dt: number): void {
  const { u, grounded } = input;
  const vxu = input.vx / u;
  const vyu = input.vy / u;
  s.t += dt;

  if (grounded && !s.wasGrounded) {
    const impact = clamp(vyu, 0, 300);
    if (impact > 40) {
      s.sv += impact * 0.014;
      s.antV += (Math.random() - 0.5) * 4;
      s.rightArmV += impact * 0.006;
      spawnDust(s, 5);
    }
  } else if (!grounded && s.wasGrounded) {
    s.sv += 2;
  }
  s.wasGrounded = grounded;

  s.fl = approach(s.fl, grounded ? 0 : 1, 6, dt);

  const walking = grounded && Math.abs(vxu) > 8;
  s.amp = approach(s.amp, walking ? 1 : 0, 10, dt);
  if (walking) s.ph += dt * Math.min(20, Math.abs(vxu) * 0.092);

  if (Math.abs(input.vx) > 12) s.dirTarget = input.vx > 0 ? 1 : -1;
  else if (input.look && Math.abs(input.look.x) > 25) s.dirTarget = input.look.x > 0 ? 1 : -1;
  s.fd = approach(s.fd, s.dirTarget, 9, dt);

  const restSquash = grounded ? Math.sin(s.t * 2.4) * 0.03 : 0;
  s.sv += (220 * (restSquash - s.sq) - 14 * s.sv) * dt;
  s.sq += s.sv * dt;

  const leanTarget = clamp(vxu * (grounded ? 0.0009 : 0.0016), -0.3, 0.3);
  s.leanV += (120 * (leanTarget - s.lean) - 10 * s.leanV) * dt;
  s.lean += s.leanV * dt;

  s.antV += (150 * (-vxu * 0.0015 - s.ant) - 8 * s.antV) * dt;
  s.ant += s.antV * dt;

  const flying = s.fl > 0.5;
  const speaking = input.talkChar !== null;
  let rightTarget: number;
  if (flying) rightTarget = 1.25 + Math.sin(s.t * 3) * 0.08;
  else if (speaking) rightTarget = 0.95 + Math.sin(s.t * 8) * 0.18;
  else rightTarget = 0.7 + Math.sin(s.ph + Math.PI) * 0.5 * s.amp;
  const leftTarget = flying ? 1.1 : 0.5 + Math.sin(s.ph) * 0.5 * s.amp;
  s.rightArmV += (90 * (rightTarget - s.rightArm) - 7 * s.rightArmV) * dt;
  s.rightArm += s.rightArmV * dt;
  s.leftArmV += (90 * (leftTarget - s.leftArm) - 7 * s.leftArmV) * dt;
  s.leftArm += s.leftArmV * dt;

  let lookTx: number;
  let lookTy: number;
  if (input.look) {
    const dist = Math.hypot(input.look.x, input.look.y) || 1;
    const strength = Math.min(1, dist / 120);
    lookTx = (input.look.x / dist) * strength * 3.6;
    lookTy = (input.look.y / dist) * strength * 2.6;
  } else {
    lookTx = Math.sin(s.t * 0.7) * 2.5;
    lookTy = Math.cos(s.t * 0.5) * 1;
  }
  s.lookX = approach(s.lookX, lookTx, 10, dt);
  s.lookY = approach(s.lookY, lookTy, 10, dt);

  if (s.t > s.nextBlink) {
    s.blinkStart = s.t;
    s.nextBlink = s.t + 2 + Math.random() * 3;
  }
  const b = (s.t - s.blinkStart) / 0.16;
  s.blink = b >= 0 && b < 1 ? 1 - 0.9 * Math.sin(b * Math.PI) : 1;

  s.mouth = approach(s.mouth, mouthOpenness(input.talkChar), 22, dt);

  s.smokeTimer -= dt;
  if (s.fl > 0.5 && s.smokeTimer <= 0) {
    s.smokeTimer = 0.07;
    for (const side of [-1, 1]) {
      s.particles.push({
        kind: 'smoke',
        x: side * 9,
        y: 6,
        vx: (Math.random() - 0.5) * 20,
        vy: 40 + Math.random() * 30,
        life: 0.6,
      });
    }
  }

  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      s.particles.splice(i, 1);
      continue;
    }
    if (p.kind === 'dust') p.vy += 900 * dt;
    // The canvas travels with the robot, so counter its motion to keep particles in place
    p.x += p.vx * dt - vxu * dt;
    p.y += p.vy * dt - vyu * dt;
    if (p.kind === 'dust' && p.y > 0 && p.vy > 0) {
      p.y = 0;
      p.vy = 0;
      p.vx *= 0.5;
    }
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFlame(ctx: CanvasRenderingContext2D, s: RobotState, pal: RobotPalette, x: number) {
  if (s.fl < 0.03) return;
  const len = (11 + Math.sin(s.t * 40 + x) * 3 + Math.sin(s.t * 23) * 2) * s.fl;
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = pal.ink;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x - 5, -8);
  ctx.lineTo(x + 5, -8);
  ctx.lineTo(x, -8 + len + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x - 2.5, -8);
  ctx.lineTo(x + 2.5, -8);
  ctx.lineTo(x, -8 + len * 0.6);
  ctx.closePath();
  ctx.fill();
}

function drawLeg(ctx: CanvasRenderingContext2D, s: RobotState, pal: RobotPalette, hipX: number, offset: number) {
  const tuck = 1 - s.fl;
  if (tuck < 0.05) return;
  const swing = Math.sin(s.ph + offset) * 9 * s.amp;
  const lift = Math.max(0, Math.cos(s.ph + offset)) * 5 * s.amp;
  const footX = hipX + swing * tuck;
  const hipY = -9;
  const footY = hipY + (-lift * tuck - hipY) * tuck;
  ctx.lineWidth = 5;
  ctx.strokeStyle = pal.ink;
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(footX, footY - 2);
  ctx.stroke();
  ctx.fillStyle = pal.ink;
  roundRect(ctx, footX - 3, footY - 4, 10, 4, 2);
  ctx.fill();
}

function drawFace(ctx: CanvasRenderingContext2D, s: RobotState, input: RobotInput, pal: RobotPalette, facing: number) {
  const ex = 12;
  const ey = -58;
  const my = -46;
  const lx = s.lookX * 0.8 * facing;
  const ly = s.lookY * 0.8;
  const eyes = [-ex, ex];
  const talking = input.talkChar !== null || s.mouth > 0.08;

  ctx.save();
  // Shift the face toward the facing side for a three-quarter look
  ctx.translate(3.5, 0);
  ctx.fillStyle = pal.eye;
  ctx.strokeStyle = pal.eye;
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.6;

  if (input.thinking) {
    eyes.forEach((x, i) => {
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(s.t * 6 + i * 1.2);
      ctx.beginPath();
      ctx.arc(x + lx * 0.6 + 3, ey + ly * 0.6 - 2, 3.6, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(-4.5, my);
    ctx.lineTo(4.5, my);
    ctx.stroke();
    ctx.restore();
    return;
  }

  eyes.forEach((x, i) => {
    // The eye on the far side is drawn slightly narrower
    const w = i ? 6 : 7.5;
    roundRect(ctx, x + lx - w / 2, ey + ly - 5 * s.blink, w, 10 * s.blink, 3);
    ctx.fill();
  });

  if (talking) {
    ctx.beginPath();
    ctx.ellipse(1, my - 2, 4 + s.mouth * 2.5, 1.2 + s.mouth * 4.3, 0, 0, TAU);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(1, my - 4, 5.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, s: RobotState, input: RobotInput, pal: RobotPalette, facing: number) {
  const ink = pal.ink;
  const ledColor = input.active ? pal.ledActive : pal.led;
  const chestColor = input.active ? pal.ledActive : pal.glow;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  drawFlame(ctx, s, pal, -9);
  drawFlame(ctx, s, pal, 9);
  drawLeg(ctx, s, pal, -8, 0);
  drawLeg(ctx, s, pal, 8, Math.PI);

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = ink;
  ctx.beginPath();
  ctx.moveTo(-17, -26);
  ctx.lineTo(-17 - Math.sin(s.leftArm) * 20, -26 + Math.cos(s.leftArm) * 20);
  ctx.stroke();
  const handX = 17 + Math.sin(s.rightArm) * 20;
  const handY = -26 + Math.cos(s.rightArm) * 20;
  ctx.beginPath();
  ctx.moveTo(17, -26);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Torso with chest panel
  roundRect(ctx, -16, -36, 32, 28, 8);
  ctx.fillStyle = pal.paper;
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, -11, -30, 22, 10, 3);
  ctx.fillStyle = pal.accent;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = chestColor;
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(s.t * (input.active ? 6 : 4));
  ctx.beginPath();
  ctx.arc(-4, -25, 2.6, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = ink;
  ctx.fillRect(1, -26, 6, 2.5);

  // Antenna
  const tipX = Math.sin(s.ant * facing) * 16;
  const tipY = -90 - Math.cos(s.ant) * 16;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -90);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.fillStyle = ledColor;
  ctx.globalAlpha = 0.65 + 0.35 * Math.sin(s.t * 5);
  roundRect(ctx, tipX - 4, tipY - 7, 8, 8, 1.5);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  ctx.strokeStyle = ink;
  ctx.stroke();

  // Monitor head: window frame, title bar, screen
  ctx.lineWidth = 3.5;
  roundRect(ctx, -34, -90, 68, 56, 8);
  ctx.fillStyle = pal.paper;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-34, -77);
  ctx.lineTo(-34, -82);
  ctx.arcTo(-34, -90, -26, -90, 8);
  ctx.lineTo(26, -90);
  ctx.arcTo(34, -90, 34, -82, 8);
  ctx.lineTo(34, -77);
  ctx.closePath();
  ctx.fillStyle = pal.accent;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.fillRect(12, -86, 5, 5);
  ctx.fillRect(20, -86, 5, 5);
  ctx.fillStyle = pal.ledActive;
  ctx.fillRect(28, -86, 4, 5);
  roundRect(ctx, -28, -71, 56, 31, 4);
  ctx.fillStyle = pal.screen;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = ink;
  ctx.stroke();
  drawFace(ctx, s, input, pal, facing);

  // Cursor hand
  ctx.fillStyle = pal.paper;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.save();
  ctx.translate(handX - 2, handY - 1);
  ctx.rotate(-0.35);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 14);
  ctx.lineTo(3.5, 11);
  ctx.lineTo(6, 17);
  ctx.lineTo(8.5, 16);
  ctx.lineTo(6, 10);
  ctx.lineTo(11, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Draws the robot with the origin at its feet. The caller has already scaled the context to robot units. */
export function drawRobot(ctx: CanvasRenderingContext2D, s: RobotState, input: RobotInput, pal: RobotPalette): void {
  const facing = s.fd >= 0 ? 1 : -1;
  // Narrow briefly while turning so the flip reads as a turn instead of a snap
  const widthScale = facing * (0.6 + 0.4 * Math.abs(s.fd));

  if (s.fl < 0.9) {
    ctx.save();
    ctx.globalAlpha = 0.2 * (1 - s.fl);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 1, 26, 4, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  for (const p of s.particles) {
    ctx.globalAlpha = Math.min(1, p.life * 2.2);
    if (p.kind === 'dust') {
      ctx.fillStyle = pal.paper;
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = pal.smoke;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + (0.6 - p.life) * 8, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  const bob = -Math.abs(Math.sin(s.ph)) * 3 * s.amp + Math.sin(s.t * 3) * 3 * s.fl;
  ctx.save();
  ctx.translate(0, bob);
  ctx.rotate(s.lean);
  ctx.scale(widthScale * (1 + s.sq * 0.5), 1 - s.sq * 0.5);
  drawBody(ctx, s, input, pal, facing);
  ctx.restore();
}
