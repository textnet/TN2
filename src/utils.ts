import * as crypto from "crypto";

/*
 * Miscellaneous utility function.
 */

export function nonce() {
    return (Date.now()) + ":" + crypto.randomBytes(16).toString('hex')
}

export function strip(s) {
    const ss = s.replace(/^\s+/, "");
    return ss.replace(/\s+$/, "")
}

export function repeat(s: string, times: number, joiner: string = "") {
    let ss = []
    for (let i=0; i<times; i++) {
        ss[i] = s
    }
    return ss.join(joiner);
}



/**
 * Push values from B to A if there are no values present in A
 * @param {object} to       — destination
 * @param {object} defaults - object with default values
 */
export function pushDefaults(to,defaults) 
{ for (let i in defaults) if (to[i] === undefined) to[i] = defaults[i]; }


/** 
 * Helper function to convert Base64 strings into Blob objects.
 * @param {string} b64Data - input
 * @param {string} contentType - kind of data, e.g. image
 * @param {number} sliceSize - speed optimisation
 * @returns {Blob}
 */
export const b64toBlob = (b64Data, contentType='image/png', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
export const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => { cp.push(v); });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach(k => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};