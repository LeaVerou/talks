import Color from "colorjs.io";

let RGBColorSpace = Color.spaces.srgb.constructor;
let ColorSpace = Object.getPrototypeOf(RGBColorSpace);

const MBA2013Linear = new RGBColorSpace({
  id: "mba2013-linear",
  cssId: "--mba2013-linear",
  name: "MacBook Air 2013 (linear)",
  white: "D65",
  toXYZ_M: [
    [0.36114, 0.40455, 0.18476],
    [0.21175, 0.67834, 0.10989],
    [0.05354, 0.10884, 0.92683],
  ],
  fromXYZ_M: [
    [ 4.30484, -2.47673, -0.56451],
    [-1.32876,  2.26726, -0.00394],
    [-0.09263, -0.12318,  1.11202],
  ],
});

const γ = 1.83;                                  // measured panel gamma, not sRGB/2.2
const pow = (c, g) => c < 0 ? -((-c) ** g) : c ** g;   // sign-preserving for out-of-gamut

const MBA2013 = new RGBColorSpace({
  id: "mba2013",
  cssId: "--mba2013",
  name: "MacBook Air 2013",
  base: MBA2013Linear,
  toBase:   rgb => rgb.map(c => pow(c, γ)),
  fromBase: rgb => rgb.map(c => pow(c, 1 / γ)),
});

ColorSpace.register(MBA2013Linear);
ColorSpace.register(MBA2013);
