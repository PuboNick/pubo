import { degrees, radians } from './geometry';

const K0 = 0.9996;

const E = 0.00669438;
const E2 = Math.pow(E, 2);
const E3 = Math.pow(E, 3);
const E_P2 = E / (1 - E);

const SQRT_E = Math.sqrt(1 - E);
const _E = (1 - SQRT_E) / (1 + SQRT_E);
const _E2 = Math.pow(_E, 2);
const _E3 = Math.pow(_E, 3);
const _E4 = Math.pow(_E, 4);
const _E5 = Math.pow(_E, 5);

const M1 = 1 - E / 4 - (3 * E2) / 64 - (5 * E3) / 256;
const M2 = (3 * E) / 8 + (3 * E2) / 32 + (45 * E3) / 1024;
const M3 = (15 * E2) / 256 + (45 * E3) / 1024;
const M4 = (35 * E3) / 3072;

const P2 = (3 / 2) * _E - (27 / 32) * _E3 + (269 / 512) * _E5;
const P3 = (21 / 16) * _E2 - (55 / 32) * _E4;
const P4 = (151 / 96) * _E3 - (417 / 128) * _E5;
const P5 = (1097 / 512) * _E4;

const R = 6378137;

const ZONE_LETTERS = 'CDEFGHJKLMNPQRSTUVWXX';

export interface LatLonOptions {
  x: number;
  y: number;
  zoneNum: number;
  zoneLetter?: string;
  northern?: boolean;
  strict?: boolean;
}

export interface WGS84Position {
  latitude: number;
  longitude: number;
}

export interface UTMPosition {
  x: number;
  y: number;
  zoneNum: number;
  zoneLetter: string | null;
}

export function toLatLon(options: LatLonOptions): WGS84Position {
  const { zoneNum, strict = true } = options;
  let { zoneLetter, northern } = options;
  const easting = options.x;
  const northing = options.y;

  if (!zoneLetter && northern === undefined) {
    throw new Error('either zoneLetter or northern needs to be set');
  } else if (zoneLetter && northern !== undefined) {
    throw new Error('set either zoneLetter or northern, but not both');
  }

  if (strict) {
    if (easting < 100000 || 1000000 <= easting) {
      throw new RangeError('easting out of range (must be between 100 000 m and 999 999 m)');
    }
    if (northing < 0 || northing > 10000000) {
      throw new RangeError('northing out of range (must be between 0 m and 10 000 000 m)');
    }
  }
  if (zoneNum < 1 || zoneNum > 60) {
    throw new RangeError('zone number out of range (must be between 1 and 60)');
  }
  if (zoneLetter) {
    zoneLetter = zoneLetter.toUpperCase();
    if (zoneLetter.length !== 1 || ZONE_LETTERS.indexOf(zoneLetter) === -1) {
      throw new RangeError('zone letter out of range (must be between C and X)');
    }
    northern = zoneLetter >= 'N';
  }

  const x = easting - 500000;
  let y = northing;

  if (!northern) y -= 1e7;

  const m = y / K0;
  const mu = m / (R * M1);

  const pRad = mu + P2 * Math.sin(2 * mu) + P3 * Math.sin(4 * mu) + P4 * Math.sin(6 * mu) + P5 * Math.sin(8 * mu);

  const pSin = Math.sin(pRad);
  const pSin2 = Math.pow(pSin, 2);

  const pCos = Math.cos(pRad);

  const pTan = Math.tan(pRad);
  const pTan2 = Math.pow(pTan, 2);
  const pTan4 = Math.pow(pTan, 4);

  const epSin = 1 - E * pSin2;
  const epSinSqrt = Math.sqrt(epSin);

  const n = R / epSinSqrt;
  const r = (1 - E) / epSin;

  const c = _E * pCos * pCos;
  const c2 = c * c;

  const d = x / (n * K0);
  const d2 = Math.pow(d, 2);
  const d3 = Math.pow(d, 3);
  const d4 = Math.pow(d, 4);
  const d5 = Math.pow(d, 5);
  const d6 = Math.pow(d, 6);

  const latitude =
    pRad -
    (pTan / r) * (d2 / 2 - (d4 / 24) * (5 + 3 * pTan2 + 10 * c - 4 * c2 - 9 * E_P2)) +
    (d6 / 720) * (61 + 90 * pTan2 + 298 * c + 45 * pTan4 - 252 * E_P2 - 3 * c2);
  const longitude =
    (d - (d3 / 6) * (1 + 2 * pTan2 + c) + (d5 / 120) * (5 - 2 * c + 28 * pTan2 - 3 * c2 + 8 * E_P2 + 24 * pTan4)) /
    pCos;

  return {
    latitude: degrees(latitude),
    longitude: degrees(longitude) + zoneNumberToCentralLongitude(zoneNum),
  };
}

export function fromLatLon({ latitude, longitude }: WGS84Position, forceZoneNum?: number): UTMPosition {
  if (latitude > 84 || latitude < -80) {
    throw new RangeError('latitude out of range (must be between 80 deg S and 84 deg N)');
  }
  if (longitude > 180 || longitude < -180) {
    throw new RangeError('longitude out of range (must be between 180 deg W and 180 deg E)');
  }

  const latRad = radians(latitude);
  const latSin = Math.sin(latRad);
  const latCos = Math.cos(latRad);

  const latTan = Math.tan(latRad);
  const latTan2 = Math.pow(latTan, 2);
  const latTan4 = Math.pow(latTan, 4);

  let zoneNum;

  if (forceZoneNum === undefined) {
    zoneNum = latLonToZoneNumber({ latitude, longitude });
  } else {
    zoneNum = forceZoneNum;
  }

  const zoneLetter = latitudeToZoneLetter(latitude);

  const lonRad = radians(longitude);
  const centralLon = zoneNumberToCentralLongitude(zoneNum);
  const centralLonRad = radians(centralLon);

  const n = R / Math.sqrt(1 - E * latSin * latSin);
  const c = E_P2 * latCos * latCos;

  const a = latCos * (lonRad - centralLonRad);
  const a2 = Math.pow(a, 2);
  const a3 = Math.pow(a, 3);
  const a4 = Math.pow(a, 4);
  const a5 = Math.pow(a, 5);
  const a6 = Math.pow(a, 6);

  const m = R * (M1 * latRad - M2 * Math.sin(2 * latRad) + M3 * Math.sin(4 * latRad) - M4 * Math.sin(6 * latRad));
  const easting =
    K0 * n * (a + (a3 / 6) * (1 - latTan2 + c) + (a5 / 120) * (5 - 18 * latTan2 + latTan4 + 72 * c - 58 * E_P2)) +
    500000;
  let northing =
    K0 *
    (m +
      n *
        latTan *
        (a2 / 2 +
          (a4 / 24) * (5 - latTan2 + 9 * c + 4 * c * c) +
          (a6 / 720) * (61 - 58 * latTan2 + latTan4 + 600 * c - 330 * E_P2)));
  if (latitude < 0) northing += 1e7;

  return {
    x: easting,
    y: northing,
    zoneNum: zoneNum,
    zoneLetter: zoneLetter,
  };
}

export function latitudeToZoneLetter(latitude) {
  if (-80 <= latitude && latitude <= 84) {
    return ZONE_LETTERS[Math.floor((latitude + 80) / 8)];
  } else {
    return null;
  }
}

export function latLonToZoneNumber({ latitude, longitude }: WGS84Position) {
  if (56 <= latitude && latitude < 64 && 3 <= longitude && longitude < 12) return 32;

  if (72 <= latitude && latitude <= 84 && longitude >= 0) {
    if (longitude < 9) return 31;
    if (longitude < 21) return 33;
    if (longitude < 33) return 35;
    if (longitude < 42) return 37;
  }

  return Math.floor((longitude + 180) / 6) + 1;
}

function zoneNumberToCentralLongitude(zoneNum) {
  return (zoneNum - 1) * 6 - 180 + 3;
}
